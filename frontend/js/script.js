document.getElementById('registrationForm').addEventListener('submit', async function (event) {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    if (password !== confirmPassword) {
        document.getElementById('passwordError').textContent = "Passwords do not match.";
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, firstName, lastName, password, role })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error); 
        alert('Something went wrong. Please try again.');
    }
});
