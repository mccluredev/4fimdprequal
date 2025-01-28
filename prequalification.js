document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const sections = document.querySelectorAll('.section');
    const progressBar = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-text');
    let currentSection = 0;

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

        // Extract address components
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

    // Format currency inputs
    const currencyInputs = document.querySelectorAll('.currency');
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
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            if (value.length > 6) {
                value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
            } else if (value.length > 3) {
                value = `(${value.slice(0,3)}) ${value.slice(3)}`;
            } else if (value.length > 0) {
                value = `(${value}`;
            }
        }
        e.target.value = value;
    });

    // Handle business established selection
    const businessEstablished = document.getElementById('00NHs00000lzslM');
    const yearsContainer = document.getElementById('years-container');
    businessEstablished.addEventListener('change', function() {
        yearsContainer.classList.toggle('hidden', this.value !== 'Yes');
    });

    // Handle loan purpose selection
    const loanPurpose = document.getElementById('00NHs00000scaqg');
    const otherPurpose = document.getElementById('other-purpose');
    loanPurpose.addEventListener('change', function() {
        otherPurpose.classList.toggle('hidden', this.value !== 'Other');
    });

    // Navigation functions
    function updateProgress() {
        const progress = ((currentSection + 1) / sections.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Step ${currentSection + 1} of ${sections.length}`;
    }

    function validateSection(sectionIndex) {
        const section = sections[sectionIndex];
        const inputs = section.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = isValid && emailRegex.test(input.value);
            } else if (input.classList.contains('currency')) {
                const value = parseInt(input.value.replace(/[^0-9]/g, ''));
                isValid = isValid && !isNaN(value) && value > 0;
            } else if (input.type === 'tel') {
                const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
                isValid = isValid && phoneRegex.test(input.value);
            } else {
                isValid = isValid && input.value.trim() !== '';
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
        } else {
            if (amount < 10000) return 18.99;
            if (amount <= 75000) return 17.99;
            return null; // Not eligible for higher amounts
        }
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

    // Add event listeners for navigation
    document.querySelectorAll('.next-button').forEach(button => {
        button.addEventListener('click', () => {
            if (validateSection(currentSection)) {
                if (currentSection === 3) {
                    // Show loading screen before calculator
                    document.getElementById('loading-screen').classList.remove('hidden');
                    setTimeout(() => {
                        document.getElementById('loading-screen').classList.add('hidden');
                        sections[currentSection].classList.add('hidden');
                        currentSection++;
                        sections[currentSection].classList.remove('hidden');
                        updateProgress();
                        updatePaymentCalculator();
                    }, 1500);
                } else {
                    sections[currentSection].classList.add('hidden');
                    currentSection++;
                    sections[currentSection].classList.remove('hidden');
                    updateProgress();
                }
            }
        });
    });

    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', () => {
            sections[currentSection].classList.add('hidden');
            currentSection--;
            sections[currentSection].classList.remove('hidden');
            updateProgress();
        });
    });

    // Term slider event listener
    const termSlider = document.getElementById('term-slider');
    termSlider.addEventListener('input', updatePaymentCalculator);

    // Check for initial loan amount from homepage
    const urlParams = new URLSearchParams(window.location.search);
    const initialAmount = urlParams.get('amount');
    if (initialAmount) {
        const loanAmountInput = document.getElementById('00NHs00000lzslH');
        loanAmountInput.value = parseInt(initialAmount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        });
    }
});
