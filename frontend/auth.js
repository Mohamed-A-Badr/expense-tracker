document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/accounts/login/', {  // Added full URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                window.location.href = 'dashboard.html';
            } else {
                const errorData = await response.text();
                alert(`Login failed: ${errorData}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        // In the registration part of the code
        try {
            const response = await fetch('http://127.0.0.1:8000/api/accounts/signup/', {  // Updated full URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    username,
                    password
                })
            });
        

            if (response.ok) {
                alert('Registration successful! Please log in.');
                // Switch to login tab
                const loginTab = new bootstrap.Tab(document.querySelector('a[href="#login"]'));
                loginTab.show();
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration.');
        }
    });
});