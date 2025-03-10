document.addEventListener('DOMContentLoaded', function() {
    console.log("Script loaded and running!");

    // Global variable declarations
    let currentSectionIndex = 0; // Renamed for clarity
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
            // Format without adding currency symbol to avoid double $ signs
            const formattedAmount = parseInt(loanAmount.replace(/[^0-9]/g, '')).toLocaleString('en-US', {
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
    
    // Initialize autocomplete (fix selector - remove # since we're using querySelector)
    const addressInput = document.querySelector("#autocomplete");
    console.log("Address input found:", addressInput ? "Yes" : "No");
    
    // Handle Google Maps initialization
    function initializeGooglePlaces() {
        // Try to find the input again in case it wasn't available earlier
        const addressInput = document.getElementById("autocomplete");
        
        if (!addressInput) {
            console.error("❌ Error: Address input field not found. Make sure element with ID 'autocomplete' exists.");
            return;
        }
        
        try {
            // Use specific options for the autocomplete
            const options = {
                types: ['address'],
                componentRestrictions: { country: 'us' }
            };
            
            const autocomplete = new google.maps.places.Autocomplete(addressInput, options);
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
    
    // Function to determine the current visible section
    function getCurrentVisibleSection() {
        return [...sections].findIndex(section => !section.classList.contains('hidden'));
    }
    
    // Navigation with animations
    function goToSection(targetSectionIndex) {
        if (isAnimating) return;
        
        const currentSectionIndex = getCurrentVisibleSection();
        if (currentSectionIndex === -1 || targetSectionIndex < 0 || targetSectionIndex >= sections.length) {
            console.error("Invalid section navigation:", currentSectionIndex, "to", targetSectionIndex);
            return;
        }
        
        isAnimating = true;
        
        const currentSection = sections[currentSectionIndex];
        const targetSection = sections[targetSectionIndex];
        const direction = targetSectionIndex > currentSectionIndex ? 1 : -1;
        
        // Prepare the animation
        targetSection.classList.remove('hidden');
        targetSection.classList.add(direction > 0 ? 'slide-enter' : 'slide-back-enter');
        
        // Force reflow to ensure CSS transitions work
        void targetSection.offsetWidth;
        
        // Start the animation
        currentSection.classList.add(direction > 0 ? 'slide-exit-active' : 'slide-back-exit-active');
        targetSection.classList.add(direction > 0 ? 'slide-enter-active' : 'slide-back-enter-active');
        
        // Update the global current section
        currentSection = targetSectionIndex;
        
        // Wait for animation to complete
        setTimeout(() => {
            // Hide the previous section
            currentSection.classList.add('hidden');
            
            // Remove animation classes
            currentSection.classList.remove(
                direction > 0 ? 'slide-exit-active' : 'slide-back-exit-active'
            );
            targetSection.classList.remove(
                direction > 0 ? 'slide-enter' : 'slide-back-enter',
                direction > 0 ? 'slide-enter-active' : 'slide-back-enter-active'
            );
            
            // Update progress
            updateProgress(targetSectionIndex);
            
            // Release animation lock
            isAnimating = false;
        }, 500);
    }
    
    // Add navigation button listeners - NEXT buttons
    document.querySelectorAll('.next-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Next button clicked!");
            
            const currentSectionIndex = getCurrentVisibleSection();
            if (currentSectionIndex === -1) {
                console.error("No visible section found!");
                return;
            }
            
            const currentSection = sections[currentSectionIndex];
            
            if (validateSection(currentSection)) {
                console.log("Validation passed, moving to next section...");
                
                // Hide current section
                currentSection.classList.add('hidden');
                
                // Show next section
                const nextSectionIndex = currentSectionIndex + 1;
                if (nextSectionIndex < sections.length) {
                    sections[nextSectionIndex].classList.remove('hidden');
                    
                    // Update current section tracker for global state
                    currentSection = nextSectionIndex;
                    
                    // Update the progress bar
                    updateProgress(nextSectionIndex);
                }
            } else {
                console.error("Validation failed. Check required fields.");
            }
        });
    });
    
    // Add navigation button listeners - BACK buttons (FIXED)
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Back button clicked!");
            
            const currentSectionIndex = getCurrentVisibleSection();
            if (currentSectionIndex === -1) {
                console.error("No visible section found!");
                return;
            }
            
            // Only proceed if not on the first section
            if (currentSectionIndex > 0) {
                const currentSection = sections[currentSectionIndex];
                const prevSectionIndex = currentSectionIndex - 1;
                const prevSection = sections[prevSectionIndex];
                
                // Hide current section
                currentSection.classList.add('hidden');
                
                // Show previous section
                prevSection.classList.remove('hidden');
                
                // Update global variable for tracking
                currentSection = prevSectionIndex;
                
                // Explicitly update the progress bar
                updateProgress(prevSectionIndex);
                
                console.log("Moved to previous section:", prevSectionIndex);
            }
        });
    });
    
    // Progress bar update
    function updateProgress(sectionIndex) {
        // Use passed index or current global index
        const index = typeof sectionIndex !== 'undefined' ? sectionIndex : getCurrentVisibleSection();
        const totalSections = sections.length;
        
        // Calculate progress as percentage
        const progress = ((index + 1) / totalSections) * 100;
        
        console.log("Updating progress for section:", index + 1, "of", totalSections);
        console.log("Progress percentage:", progress + "%");
        
        // Update the progress bar width - DIRECT DOM MANIPULATION
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            console.log(`Setting progress bar width to ${progress}%`);
        } else {
            console.error("Progress bar element not found!");
        }
        
        // Update the progress text
        if (progressText) {
            progressText.textContent = `Step ${index + 1} of ${totalSections}`;
            console.log(`Updating progress text to: Step ${index + 1} of ${totalSections}`);
        } else {
            console.error("Progress text element not found!");
        }
        
        // Debugging - print current DOM state
        console.log("Current progress bar width:", progressBar ? progressBar.style.width : "N/A");
        console.log("Current progress text:", progressText ? progressText.textContent : "N/A");
    }
    
    // Form submission handler for Salesforce
    if (form) {
        console.log("Form found, setting up submission handler", form);
        console.log("Form action:", form.action);
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submission started");
            
            const visibleSectionIndex = getCurrentVisibleSection();
            if (visibleSectionIndex === -1) {
                console.error("No visible section found!");
                return;
            }
            
            const visibleSection = sections[visibleSectionIndex];
            if (!validateSection(visibleSection)) {
                console.error("Validation failed, stopping submission");
                return;
            }
            
            if (loadingScreen) {
                loadingScreen.classList.remove('hidden');
                console.log("Loading screen displayed");
            }
            
            // Store form data in localStorage for retrieval on complete page
            const formData = new FormData(form);
            const formDataObj = {};
            
            // Get loan amount and purpose for the redirect
            const loanAmountElement = document.getElementById('00NHs00000lzslH');
            const loanPurposeElement = document.getElementById('00NHs00000scaqg');
            const loanAmount = loanAmountElement ? loanAmountElement.value : '';
            const loanPurpose = loanPurposeElement ? loanPurposeElement.value : '';
            
            // Store loan details separately for easier access on the complete page
            localStorage.setItem('loan_amount', loanAmount);
            localStorage.setItem('loan_purpose', loanPurpose);
            
            // Store all form fields
            for (let [key, value] of formData.entries()) {
                formDataObj[key] = value;
                console.log(`${key}: ${value}`);
            }
            
            // Also add these values to hidden fields to pass in the form submission
            const loanAmountParamField = document.getElementById('loan_amount_param');
            const loanPurposeParamField = document.getElementById('loan_purpose_param');
            
            if (loanAmountParamField && loanAmount) {
                loanAmountParamField.value = loanAmount;
            }
            
            if (loanPurposeParamField && loanPurpose) {
                loanPurposeParamField.value = loanPurpose;
            }
            
            // Save form data to localStorage
            try {
                localStorage.setItem('prequalFormData', JSON.stringify(formDataObj));
                console.log("Form data saved to localStorage");
            } catch (e) {
                console.error("Failed to save form data to localStorage:", e);
            }
            
            // Ensure the form has an action URL
            if (!form.action || form.action.trim() === '') {
                alert('Form is missing action URL');
                if (loadingScreen) loadingScreen.classList.add('hidden');
                return;
            }
            
            // Instead of using fetch, submit the form directly
            console.log("Submitting form traditionally to:", form.action);
            
            // Set a flag in localStorage to indicate form was submitted
            localStorage.setItem('formSubmitted', 'true');
            
            // Submit the form traditionally
            form.submit();
        });
    } else {
        console.error("Form element not found - form submission handler not initialized");
    }
    
    // Initialize progress with the initial section (0)
    updateProgress(0);
    
    console.log("✅ Prequalification.js fully loaded and executed.");
});
