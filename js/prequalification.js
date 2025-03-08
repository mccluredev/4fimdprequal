document.addEventListener('DOMContentLoaded', function() {
    console.log("Script loaded and running!");

    // Global variable declarations
    let currentSection = 0;
    let isAnimating = false;
    let streetNumber = "";
    
    // Get DOM elements
    const sections = document.querySelectorAll('.section');
    console.log("Sections found:", sections.length);
    
    const progressBar = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-text');
    const form = document.getElementById("prequalForm");
    const paymentCalculator = document.getElementById('payment-calculator');
    const loadingScreen = document.getElementById('loading-screen');
    
    // Check if sections exist
    if (sections.length === 0) {
        console.error("❌ No sections found. Check if .section elements exist in the HTML.");
        return;
    }
    
    // Check if form exists
    if (!form) {
        console.error("❌ Error: Form not found!");
        return;
    }
    
    // Hide loading screen if it exists
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    
    // Ensure first section is visible on load
    if (sections.length > 0) {
        sections[0].classList.remove('hidden');
    }
    
    // Check for loan amount in URL and populate field
    const urlParams = new URLSearchParams(window.location.search);
    const loanAmount = urlParams.get('amount');
    
    if (loanAmount && !isNaN(parseInt(loanAmount))) {
        const loanInput = document.getElementById('00NHs00000lzslH');
        
        if (loanInput) {
            // Format and set the loan amount for display
            const formattedAmount = parseInt(loanAmount.replace(/[^0-9]/g, '')).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            
            loanInput.value = formattedAmount;
            console.log("Loan amount set to:", formattedAmount);
        } else {
            console.error("Loan amount input field not found!");
        }
    } else {
        console.log("No valid loan amount found in URL.");
    }
    
    // Initialize autocomplete (correct ID format)
    const addressInput = document.querySelector("#autocomplete");
    
    // Handle Google Maps initialization
    function initializeGooglePlaces() {
        if (!addressInput) {
            console.error("❌ Error: Address input field not found.");
            return;
        }
        
        try {
            const autocomplete = new google.maps.places.Autocomplete(addressInput);
            console.log("✅ Autocomplete initialized:", autocomplete);
            
            if (autocomplete && typeof google.maps.event.addListener === "function") {
                google.maps.event.addListener(autocomplete, "place_changed", function() {
                    console.log("📍 Autocomplete place changed event triggered.");
                    const place = autocomplete.getPlace();
                    console.log("📍 Selected place:", place);
                    
                    let streetNumber = "",
                        route = "",
                        city = "",
                        state = "",
                        zipCode = "";
                    
                    if (place.address_components) {
                        for (const component of place.address_components) {
                            const type = component.types[0];
                            switch (type) {
                                case "street_number":
                                    streetNumber = component.long_name;
                                    break;
                                case "route":
                                    route = component.long_name;
                                    break;
                                case "locality":
                                    city = component.long_name;
                                    break;
                                case "administrative_area_level_1":
                                    state = component.short_name;
                                    break;
                                case "postal_code":
                                    zipCode = component.long_name;
                                    break;
                            }
                        }
                    }
                    
                    document.getElementById("street").value = `${streetNumber} ${route}`.trim();
                    document.getElementById("city").value = city;
                    document.getElementById("state").value = state;
                    document.getElementById("zip").value = zipCode;
                });
            } else {
                console.error("❌ Error: Autocomplete is not valid or addListener is missing.");
            }
        } catch (error) {
            console.error("❌ Error initializing autocomplete:", error);
        }
    }
    
    // Wait for Google Maps API to load
    window.onload = function() {
        if (typeof google !== "undefined" && google.maps && google.maps.places) {
            console.log("✅ Google Maps API is loaded correctly.");
            initializeGooglePlaces();
        } else {
            console.error("❌ Error: Google Maps API is not loaded.");
        }
    };
    
    // Handle loan purpose selection
    const loanPurpose = document.getElementById('00NHs00000scaqg');
    const otherPurpose = document.getElementById('other-purpose');
    const otherPurposeText = document.getElementById('00NQP000003JB1F');
    
    if (loanPurpose) {
        // First event listener for showing/hiding other purpose input
        loanPurpose.addEventListener('change', function() {
            const isOther = this.value === 'Other';
            otherPurpose.classList.toggle('hidden', !isOther);
            otherPurposeText.required = isOther;
            if (!isOther) {
                otherPurposeText.value = '';
            }
        });
        
        // Second event listener for redirecting to complete page
        // NOTE: Be careful with this - it will redirect immediately when purpose changes
        loanPurpose.addEventListener('change', function() {
            const selectedPurpose = this.value;
            if (selectedPurpose) {
                const updatedURL = `complete.html?amount=${loanAmount}&purpose=${encodeURIComponent(selectedPurpose)}`;
                window.location.href = updatedURL;
            }
        });
    }
    
    // Handle business established selection
    const businessEstablished = document.getElementById('00NHs00000lzslM');
    const yearsContainer = document.getElementById('years-container');
    const yearsInput = document.getElementById('00NHs00000m08cv');
    
    if (businessEstablished) {
        businessEstablished.addEventListener('change', function() {
            const isEstablished = this.value === 'Yes';
            yearsContainer.classList.toggle('hidden', !isEstablished);
            yearsInput.required = isEstablished;
            if (!isEstablished) {
                yearsInput.value = '';
            }
        });
    }
    
    // Format currency inputs
    const currencyInputs = document.querySelectorAll('.currency:not([readonly])');
    currencyInputs.forEach(input => {
        input.addEventListener('blur', formatCurrency);
        input.addEventListener('focus', unformatCurrency);
    });
    
    function formatCurrency(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value, 10).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            e.target.value = value;
        }
    }
    
    function unformatCurrency(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    }
    
    // Format phone number
    const phoneInput = document.getElementById('mobile');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.substring(0, 10);
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = `(${value}`;
                } else if (value.length <= 6) {
                    value = `(${value.slice(0,3)}) ${value.slice(3)}`;
                } else {
                    value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
                }
            }
            e.target.value = value;
        });
        
        // Prevent paste of invalid format
        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            let pastedText = (e.clipboardData || window.clipboardData).getData('text');
            pastedText = pastedText.replace(/\D/g, '').substring(0, 10);
            if (pastedText.length === 10) {
                this.value = `(${pastedText.slice(0,3)}) ${pastedText.slice(3,6)}-${pastedText.slice(6)}`;
            }
        });
    }
    
    // Form validation
    window.validateSection = function(section) {
        console.log("Validating section:", section);
        
        if (!section) {
            console.error("Error: Section is undefined or null.");
            return false;
        }
        
        const inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
        console.log("Inputs found for validation:", inputs);
        
        let isValid = true;
        
        inputs.forEach(input => {
            console.log(`Validating input: ${input.name || input.id}, Value: ${input.value}`);
            
            if (input.type === 'email') {
                const emailRegex = /^\S+@\S+\.\S+$/;
                isValid = isValid && emailRegex.test(input.value);
                console.log("Email validation result:", emailRegex.test(input.value));
            } else if (input.type === 'tel') {
                const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
                isValid = isValid && phoneRegex.test(input.value);
                console.log("Phone validation result:", phoneRegex.test(input.value));
            } else if (input.classList.contains('currency')) {
                const value = parseInt(input.value.replace(/[^0-9]/g, ''));
                isValid = isValid && !isNaN(value) && value > 0;
                console.log("Currency validation result:", !isNaN(value) && value > 0);
            } else {
                isValid = isValid && input.value.trim() !== '';
                console.log("General field validation result:", input.value.trim() !== '');
            }
            
            const hasError = !isValid;
            input.classList.toggle('error-input', hasError);
            if (hasError) {
                console.warn(`Validation failed for: ${input.name || input.id}`);
            }
        });
        
        console.log("✅ Final validation result for section:", isValid ? "✔️ Passed" : "❌ Failed");
        return isValid;
    };
    
    console.log("✅ validateSection function is now globally available.");
    
    // Calculate interest rate based on FICO score and loan amount
    function calculateInterestRate(creditScore, loanAmount) {
        const amount = parseInt(loanAmount.replace(/[^0-9]/g, ''));
        const score = parseInt(creditScore);
        
        if (score >= 760) {
            if (amount < 10000) return 15.99;
            if (amount <= 75000) return 14.99;
            if (amount <= 150000) return 13.99;
            return 12.99;
        } else if (score >= 720) {
            if (amount < 10000) return 16.99;
            if (amount <= 75000) return 15.99;
            if (amount <= 150000) return 14.99;
            return 13.99;
        } else if (score >= 680) {
            if (amount < 10000) return 17.99;
            if (amount <= 75000) return 16.99;
            if (amount <= 150000) return 15.99;
            return 14.99;
        } else if (score >= 640) {
            if (amount < 10000) return 18.99;
            if (amount <= 75000) return 17.99;
            return null;
        }
        return null;
    }
    
    // Calculate monthly payment
    function calculateMonthlyPayment(principal, annualRate, termMonths) {
        const monthlyRate = annualRate / 100 / 12;
        const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) /
            (Math.pow(1 + monthlyRate, termMonths) - 1);
        return Math.round(payment * 100) / 100;
    }
    
    // Update payment calculator
    function updatePaymentCalculator() {
        const loanAmount = document.getElementById('00NHs00000lzslH').value;
        const creditScore = document.getElementById('00NHs00000m08cg').value;
        const termSlider = document.getElementById('term-slider');
        const monthlyPaymentDisplay = document.getElementById('monthly-payment');
        const rateText = document.getElementById('rate-text');
        const currentTerm = document.getElementById('current-term');
        
        const amount = parseInt(loanAmount.replace(/[^0-9]/g, ''));
        const rate = calculateInterestRate(creditScore, loanAmount);
        
        if (rate === null) {
            rateText.textContent = "Based on the provided information, please contact us for rate details.";
            monthlyPaymentDisplay.textContent = "Contact us for details";
            return;
        }
        
        rateText.textContent = `Your estimated interest rate is ${rate}% APR`;
        const payment = calculateMonthlyPayment(amount, rate, parseInt(termSlider.value));
        monthlyPaymentDisplay.textContent = payment.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        });
        currentTerm.textContent = `${termSlider.value} months`;
    }
    
    // Add term slider event listener
    const termSlider = document.getElementById('term-slider');
    if (termSlider) {
        termSlider.addEventListener('input', updatePaymentCalculator);
    }
    
    // Navigation with animations
    async function slideSection(direction) {
        if (isAnimating) return;
        isAnimating = true;
        
        const currentSect = sections[currentSection];
        const nextSection = sections[currentSection + direction];
        
        nextSection.classList.remove('hidden');
        nextSection.classList.add(direction > 0 ? 'slide-enter' : 'slide-back-enter');
        
        void nextSection.offsetWidth;
        
        currentSect.classList.add(direction > 0 ? 'slide-exit-active' : 'slide-back-exit-active');
        nextSection.classList.add(direction > 0 ? 'slide-enter-active' : 'slide-back-enter-active');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        currentSect.classList.add('hidden');
        currentSect.classList.remove(direction > 0 ? 'slide-exit-active' : 'slide-back-exit-active');
        nextSection.classList.remove(
            direction > 0 ? 'slide-enter' : 'slide-back-enter',
            direction > 0 ? 'slide-enter-active' : 'slide-back-enter-active'
        );
        
        currentSection += direction;
        updateProgress();
        isAnimating = false;
    }
    
    // Add navigation button listeners
    document.querySelectorAll('.next-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Next button clicked!");
            
            const currentSection = [...sections].find(section => !section.classList.contains('hidden'));
            
            if (!currentSection) {
                console.error("No visible section found!");
                return;
            }
            
            if (validateSection(currentSection)) {
                console.log("Validation passed, moving to next section...");
                goToNextSection(currentSection);
            } else {
                console.error("Validation failed. Check required fields.");
            }
        });
    });
    
    // Function to go to the next section
    function goToNextSection(currentSection) {
        const nextSection = currentSection.nextElementSibling;
        if (nextSection) {
            currentSection.classList.add('hidden');
            nextSection.classList.remove('hidden');
        }
    }
    
    // Progress bar update
    function updateProgress() {
        const progress = ((currentSection + 1) / 4) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Step ${currentSection + 1} of 4`;
    }
    
    // Form submission handler for Salesforce
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const visibleSection = [...sections].find(section => !section.classList.contains('hidden'));
            if (!validateSection(visibleSection)) return;
            
            if (loadingScreen) {
                loadingScreen.classList.remove('hidden');
            }
            
            try {
                // Submit to Salesforce first
                await new Promise((resolve, reject) => {
                    const formData = new FormData(form);
                    fetch(form.action, {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Form submission failed');
                        }
                        resolve();
                    })
                    .catch(error => reject(error));
                });
                
                // After successful submission, show calculator
                sections.forEach(section => section.classList.add('hidden'));
                if (paymentCalculator) {
                    paymentCalculator.classList.remove('hidden');
                    updatePaymentCalculator();
                }
                
                if (progressText && progressBar) {
                    progressText.textContent = 'Estimate Complete';
                    progressBar.style.width = '100%';
                }
                
                // Update URL without redirecting
                window.history.pushState({}, '', 'prequalification.html?showCalculator=true');
                
            } catch (error) {
                console.error('Submission error:', error);
                alert('There was an error submitting your application. Please try again.');
            } finally {
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
            }
        });
    }
    
    // Initialize progress
    updateProgress();
    
    console.log("✅ Prequalification.js fully loaded and executed.");
});
