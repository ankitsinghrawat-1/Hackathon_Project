document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

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
    
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                displayMessage(data.message, "success");
                setTimeout(() => {
                    window.location.href = "alumni_directory.html";
                }, 1000); 
            } else {
                displayMessage(data.error, "error");
            }
        } catch (error) {
            console.error('Login error:', error);
            displayMessage("An unexpected error occurred. Please try again.", "error");
        }
    });
});