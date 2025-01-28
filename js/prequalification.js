document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const sections = document.querySelectorAll('.section');
    const progressBar = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-text');
    const form = document.getElementById('prequalForm');
    const paymentCalculator = document.getElementById('payment-calculator');
    let currentSection = 0;
    let isAnimating = false;

    // Hide loading screen immediately on page load
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }

    // Check for loan amount in URL and redirect if not present
    const urlParams = new URLSearchParams(window.location.search);
    const loanAmount = urlParams.get('amount');

    if (!loanAmount) {
        window.location.href = '/';
        return;
    }

    // Format and set the loan amount
    const formattedAmount = parseInt(loanAmount.replace(/[^0-9]/g, '')).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    const loanAmountInput = document.getElementById('00NHs00000lzslH');
    if (loanAmountInput) {
        loanAmountInput.value = formattedAmount;
    }

    // Initialize Google Places Autocomplete
    const autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        {types: ['address'], componentRestrictions: {country: 'US'}}
    );

    // Handle address selection
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let zipCode = '';

        // Parse address components
        for (const component of place.address_components) {
            const type = component.types[0];
            switch (type) {
                case 'street_number':
                    streetNumber = component.long_name;
                    break;
                case 'route':
                    route = component.long_name;
                    break;
                case 'locality':
                    city = component.long_name;
                    break;
                case 'administrative_area_level_1':
                    state = component.short_name;
                    break;
                case 'postal_code':
                    zipCode = component.long_name;
                    break;
            }
        }

        // Set hidden field values
        document.getElementById('street').value = `${streetNumber} ${route}`.trim();
        document.getElementById('city').value = city;
        document.getElementById('state').value = state;
        document.getElementById('zip').value = zipCode;
    });

    // Handle loan purpose selection
    const loanPurpose = document.getElementById('00NHs00000scaqg');
    const otherPurpose = document.getElementById('other-purpose');
    const otherPurposeText = document.getElementById('00NQP000003JB1F');

    if (loanPurpose) {
        loanPurpose.addEventListener('change', function() {
            const isOther = this.value === 'Other';
            otherPurpose.classList.toggle('hidden', !isOther);

            if (isOther) {
                otherPurposeText.setAttribute('required', 'required');
            } else {
                otherPurposeText.removeAttribute('required');
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

            if (isEstablished) {
                yearsInput.setAttribute('required', 'required');
            } else {
                yearsInput.removeAttribute('required');
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

            // Restrict to 10 digits
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
    function validateSection(sectionIndex) {
        const section = sections[sectionIndex];
        const inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = isValid && emailRegex.test(input.value);
            } else if (input.type === 'tel') {
                const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
                isValid = isValid && phoneRegex.test(input.value);
            } else if (input.classList.contains('currency')) {
                const value = parseInt(input.value.replace(/[^0-9]/g, ''));
                isValid = isValid && !isNaN(value) && value > 0;
            } else {
                isValid = isValid && input.value.trim() !== '';
            }

            if (!isValid) {
                input.classList.add('error-input');
            } else {
                input.classList.remove('error-input');
            }
        });

        return isValid;
    }

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
            return null; // Not eligible for higher amounts
        }
        return null; // Not eligible
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

    // Navigation event listeners with slide animations
    document.querySelectorAll('.next-button').forEach(button => {
        button.addEventListener('click', async () => {
            if (isAnimating || !validateSection(currentSection)) return;

            isAnimating = true;
            const currentSect = sections[currentSection];
            const nextSection = sections[currentSection + 1];

            // Prepare next section
            nextSection.classList.remove('hidden');
            nextSection.classList.add('slide-enter');

            // Force reflow
            void nextSection.offsetWidth;

            // Start animation
            currentSect.classList.add('slide-exit-active');
            nextSection.classList.add('slide-enter-active');

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 500));

            // Cleanup
            currentSect.classList.add('hidden');
            currentSect.classList.remove('slide-exit-active');
            nextSection.classList.remove('slide-enter', 'slide-enter-active');

            // Update state
            currentSection++;
            updateProgress();
            isAnimating = false;
        });
    });

    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', async () => {
            if (isAnimating) return;
            isAnimating = true;

            const currentSect = sections[currentSection];
            const prevSection = sections[currentSection - 1];

            // Prepare previous section
            prevSection.classList.remove('hidden');
            prevSection.classList.add('slide-back-enter');

            // Force reflow
            void prevSection.offsetWidth;

            // Start animation
            currentSect.classList.add('slide-back-exit-active');
            prevSection.classList.add('slide-back-enter-active');

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 500));

            // Cleanup
            currentSect.classList.add('hidden');
            currentSect.classList.remove('slide-back-exit-active');
            prevSection.classList.remove('slide-back-enter', 'slide-back-enter-active');

            // Update state
            currentSection--;
            updateProgress();
            isAnimating = false;
        });
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateSection(currentSection)) return;

        loadingScreen.classList.remove('hidden');

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Hide form sections
                sections.forEach(section => section.classList.add('hidden'));

                // Show and update calculator
                paymentCalculator.classList.remove('hidden');
                updatePaymentCalculator();

                // Update progress text
                progressText.textContent = 'Estimate Complete';
                progressBar.style.width = '100%';
            } else {
                alert('There was an error submitting your application. Please try again.');
            }
        } catch (error) {
            alert('There was an error submitting your application. Please try again.');
            console.error('Submission error:', error);
        } finally {
            loadingScreen.classList.add('hidden');
        }
    });

    function updateProgress() {
        const progress = ((currentSection + 1) / 4) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Step ${currentSection + 1} of 4`;
    }

    // Show first section
    if (sections.length > 0) {
        sections[0].classList.remove('hidden');
    }
    updateProgress();
});
