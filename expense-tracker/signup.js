document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            window.location.href = 'login.html'; // Redirect to the login page upon successful registration
        } else {
            document.getElementById('signup-error-message').textContent = data.message;
        }
    } catch (err) {
        document.getElementById('signup-error-message').textContent = 'An error occurred. Please try again.';
        console.error('Registration error:', err);
    }
});
