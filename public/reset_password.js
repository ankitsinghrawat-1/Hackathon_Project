document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetPasswordForm');
    const messageContainer = document.getElementById('message-container');
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        displayMessage('Invalid or missing token.', false);
        form.style.display = 'none';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            displayMessage('Passwords do not match.', false);
            return;
        }

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();
            displayMessage(data.message || data.error, response.ok);
            if (response.ok) {
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            }
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