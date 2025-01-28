document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loan-widget-form');
    const amountInput = document.getElementById('loan-amount');
    const errorMessage = document.getElementById('amount-error');
    const minAmount = 1000;
    const maxAmount = 1000000;

    // Format amount as user types
    amountInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            value = parseInt(value, 10);
            if (!isNaN(value)) {
                e.target.value = `${value.toLocaleString('en-US')}`;
            }
        }
    });

    // Format on blur
    amountInput.addEventListener('blur', function(e) {
        let value = parseInt(e.target.value.replace(/[^0-9,]/g, '').replace(/,/g, ''));
        if (!isNaN(value)) {
            if (value < minAmount || value > maxAmount) {
                errorMessage.style.display = 'block';
                e.target.classList.add('error-input');
            } else {
                errorMessage.style.display = 'none';
                e.target.classList.remove('error-input');
            }
            e.target.value = value.toLocaleString('en-US');
        }
    });

    // Remove formatting on focus
    amountInput.addEventListener('focus', function(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = value;
    });

    // Form submission validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let amount = parseInt(amountInput.value.replace(/[^0-9]/g, ''), 10);
        
        if (!amount || amount < minAmount || amount > maxAmount) {
            errorMessage.style.display = 'block';
            amountInput.classList.add('error-input');
            return;
        }
        
        // Ensure we're navigating to the correct page with the amount
        window.location.href = `prequalification.html?amount=${amount}`;
    });
});
