document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.querySelector('input[name="role"]:checked') ? document.querySelector('input[name="role"]:checked').value : null;

    if (!email || !password || !role) {
        alert('All fields are required');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, role }),
        });

        if (response.ok) {
            const data = await response.json();

            localStorage.setItem('userId', data.userId);
            console.log('User ID stored:', data.userId);

            let redirectUrl;
            if (role === 'Student') {
                redirectUrl = `/student-home.html?studentId=${data.userId}`;
            } else if (role === 'Teacher') {
                redirectUrl = `/teacher-home.html?teacherId=${data.userId}`;
            } else if (role === 'Admin') {
                redirectUrl = `/admin-dashboard.html`;
            } else {
                alert('Invalid role specified');
                return;
            }

            console.log(`Redirecting to: ${redirectUrl}`);
            window.location.href = redirectUrl;
        } else {
            const error = await response.json();
            alert(error.message || 'Login failed');
        }
    } catch (err) {
        console.error('Login error:', err);
    }
});
