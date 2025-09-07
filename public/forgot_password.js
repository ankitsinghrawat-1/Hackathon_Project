document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');
    const messageContainer = document.getElementById('message-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            displayMessage(data.message || data.error, response.ok);
        } catch (error) {
            console.error('Error:', error);
            displayMessage('An unexpected error occurred.', false);
        }
    });

    function displayMessage(message, isSuccess) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSuccess ? 'success' : 'error'}`;
        messageDiv.textContent = message;
        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageDiv);
    }
});