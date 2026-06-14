// DOM Elements for Auth
const loginForm = document.getElementById('loginFormElement');
const registerForm = document.getElementById('registerFormElement');
const forgotPasswordForm = document.getElementById('forgotPasswordFormElement');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const showForgotPasswordLink = document.getElementById('showForgotPassword');
const backToLoginLink = document.getElementById('backToLogin');
const logoutBtn = document.getElementById('logoutBtn');
const resetPasswordModal = document.getElementById('resetPasswordModal');

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Switch between auth forms
function showForm(formName) {
    const login = document.getElementById('loginForm');
    const register = document.getElementById('registerForm');
    const forgot = document.getElementById('forgotPasswordForm');
    
    login.classList.remove('active');
    register.classList.remove('active');
    forgot.classList.remove('active');
    
    if (formName === 'login') login.classList.add('active');
    if (formName === 'register') register.classList.add('active');
    if (formName === 'forgot') forgot.classList.add('active');
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const data = await api.login({ email, password });
        
        if (data.token) {
            setAuthToken(data.token);
            showToast('Login successful! Welcome back!', 'success');
            await loadUserData();
            showTodoApp();
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Login error. Please try again.', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const data = await api.register({ name, email, password });
        
        if (data.token) {
            setAuthToken(data.token);
            showToast('Registration successful! Welcome!', 'success');
            await loadUserData();
            showTodoApp();
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Registration error. Please try again.', 'error');
    }
}

// Handle Forgot Password
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    
    try {
        const data = await api.forgotPassword(email);
        showToast('Password reset link sent to your email!', 'success');
        showForm('login');
    } catch (error) {
        showToast('Error sending reset link. Please try again.', 'error');
    }
}

// Handle Reset Password
async function handleResetPassword(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showToast('Invalid reset token', 'error');
        return;
    }
    
    try {
        const data = await api.resetPassword(token, newPassword);
        showToast('Password reset successful! Please login.', 'success');
        resetPasswordModal.style.display = 'none';
        showForm('login');
        
        // Remove token from URL
        window.history.pushState({}, '', window.location.pathname);
    } catch (error) {
        showToast('Error resetting password. Token may be expired.', 'error');
    }
}

// Load user data after login
async function loadUserData() {
    try {
        const user = await api.getMe();
        if (user.name) {
            document.getElementById('userName').textContent = user.name;
        }
        await loadTodos();
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Show Todo App (hide auth forms)
function showTodoApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('todoContainer').style.display = 'block';
    logoutBtn.style.display = 'block';
    loadTodos();
}

// Show Auth Forms (hide todo app)
function showAuthForms() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('todoContainer').style.display = 'none';
    logoutBtn.style.display = 'none';
    setAuthToken(null);
}

// Handle Logout
function handleLogout() {
    setAuthToken(null);
    showAuthForms();
    showForm('login');
    showToast('Logged out successfully', 'success');
}

// Check if user is already logged in
async function checkAuthStatus() {
    const token = getAuthToken();
    if (token) {
        try {
            const user = await api.getMe();
            if (user.name) {
                showTodoApp();
                await loadUserData();
            }
        } catch (error) {
            // Token is invalid
            setAuthToken(null);
            showAuthForms();
        }
    } else {
        showAuthForms();
    }
}

// Check for reset token in URL
function checkForResetToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        resetPasswordModal.style.display = 'block';
    }
}

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
forgotPasswordForm.addEventListener('submit', handleForgotPassword);
resetPasswordForm.addEventListener('submit', handleResetPassword);
logoutBtn.addEventListener('click', handleLogout);

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showForm('register');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showForm('login');
});

showForgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showForm('forgot');
});

backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showForm('login');
});

// Modal close
document.querySelector('.close').addEventListener('click', () => {
    resetPasswordModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === resetPasswordModal) {
        resetPasswordModal.style.display = 'none';
    }
});