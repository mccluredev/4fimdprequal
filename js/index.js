document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loan-widget-form');
    const amountInput = document.getElementById('loan-amount');
    const errorMessage = document.getElementById('amount-error');
    
    // Format by removing non-numeric characters
    function formatCurrency(value) {
        return value.replace(/[^0-9]/g, '');
    }
    
    // Validate the amount
    function validateAmount(amount) {
        const value = parseInt(formatCurrency(amount));
        return value >= 1000 && value <= 1000000;
    }
    
    // Format number with commas but NO currency symbol
    function formatNumberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Input event handler - updated to NOT add a $ symbol
    amountInput.addEventListener('input', function (e) {
        let value = formatCurrency(e.target.value);
        if (value) {
            // Format with commas but NO $ symbol since we already have one in the HTML
            value = formatNumberWithCommas(parseInt(value));
            e.target.value = value;
        }
    });
    
    // Form submission handler
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateAmount(amountInput.value)) {
            errorMessage.style.display = 'block';
            return;
        }
        // Redirect to prequalification page with loan amount as URL parameter
        const loanAmount = encodeURIComponent(formatCurrency(amountInput.value));
        window.location.href = `prequalification.html?amount=${loanAmount}`;
    });
});
