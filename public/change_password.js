document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('changePasswordForm');

    function displayMessage(message, type) {
        const messageContainer = document.getElementById("message-container");
        if (!messageContainer) return;
        messageContainer.innerHTML = '';
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", type);
        messageElement.textContent = message;
        messageContainer.appendChild(messageElement);
        setTimeout(() => {
            messageElement.remove();
        }, 4000);
    }

    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        const token = localStorage.getItem('token');

        if (newPassword !== confirmNewPassword) {
            displayMessage('New passwords do not match.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(data.message, 'success');
                changePasswordForm.reset();
            } else {
                displayMessage(data.error, 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            displayMessage('An error occurred. Please try again.', 'error');
        }
    });
});