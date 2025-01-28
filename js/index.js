document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loan-widget-form');
    const amountInput = document.getElementById('loan-amount');
    const errorMessage = document.getElementById('amount-error');

    function formatCurrency(value) {
        return value.replace(/[^0-9]/g, '');
    }

    function validateAmount(amount) {
        const value = parseInt(formatCurrency(amount));
        return value >= 1000 && value <= 1000000;
    }

    amountInput.addEventListener('input', function(e) {
        let value = formatCurrency(e.target.value);
        if (value) {
            value = parseInt(value).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            e.target.value = value;
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateAmount(amountInput.value)) {
            errorMessage.style.display = 'block';
            return;
        }
        errorMessage.style.display = 'none';
        this.submit();
    });
});
