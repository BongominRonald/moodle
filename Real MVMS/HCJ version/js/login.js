// MVMS Login Page JavaScript
// Handles role selection, form validation, and authentication

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Demo credentials (same as React prototype)
    const DEMO_USERS = {
        admin: {
            email: 'admin@mbararamarket.ug',
            password: 'Admin@123',
            name: 'John Mugisha',
            id: 'ADM001'
        },
        vendor: {
            email: 'vendor@mbararamarket.ug',
            password: 'Vendor@123',
            name: 'Sarah Nakato',
            id: 'VND001'
        }
    };

    let selectedRole = 'vendor'; // Default role

    // Get elements
    const roleOptions = document.querySelectorAll('.role-option');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const togglePassword = document.getElementById('togglePassword');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Update role selection UI
    function updateRoleSelection() {
        roleOptions.forEach(option => {
            const role = option.dataset.role;
            const isSelected = role === selectedRole;
            const radioIcon = option.querySelector('.radio i');

            if (isSelected) {
                option.classList.add('active');
                option.style.borderColor = 'hsl(152, 60%, 25%)';
                option.style.backgroundColor = 'hsl(152, 60%, 25%, 0.05)';
                if (radioIcon) radioIcon.setAttribute('data-lucide', 'radio-button-on');
            } else {
                option.classList.remove('active');
                option.style.borderColor = 'hsl(var(--border))';
                option.style.backgroundColor = '';
                if (radioIcon) radioIcon.setAttribute('data-lucide', 'circle');
            }
        });
        lucide.createIcons();
    }

    // Role selection handling
    roleOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectedRole = this.dataset.role;
            updateRoleSelection();
            emailInput.placeholder = `Enter ${selectedRole} email`;
            hideError();
        });
    });

    // Password toggle
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        const icon = this.querySelector('i');
        icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
        lucide.createIcons();
    });

    // Show loading state
    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin" style="width: 18px; height: 18px;"></i> <span>Signing In...</span>';
            lucide.createIcons();
        } else {
            loadingOverlay.classList.add('hidden');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i data-lucide="log-in" style="width: 18px; height: 18px;"></i> <span>Sign In</span>';
            lucide.createIcons();
        }
    }

    // Show error message
    function showError(message) {
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    // Hide error message
    function hideError() {
        errorDiv.classList.add('hidden');
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="mt-0.5">
                    ${type === 'success' ? '<i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>' :
                      type === 'error' ? '<i data-lucide="x-circle" style="width: 16px; height: 16px;"></i>' :
                      '<i data-lucide="bell" style="width: 16px; height: 16px;"></i>'}
                </div>
                <span class="flex-1 text-sm">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="opacity-60 hover:opacity-100">
                    <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                </button>
            </div>
        `;
        toastContainer.appendChild(toast);
        lucide.createIcons();
        setTimeout(() => toast.remove(), 3500);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-xs w-full';
        document.body.appendChild(container);
        return container;
    }

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate inputs
        if (!email || !password) {
            showError('Please fill in all fields.');
            return;
        }

        hideError();
        showLoading(true);

        // Simulate API call with timeout
        setTimeout(() => {
            const demoUser = DEMO_USERS[selectedRole];

            if (email === demoUser.email && password === demoUser.password) {
                // Store user session
                sessionStorage.setItem('mvms_user', JSON.stringify({
                    id: demoUser.id,
                    name: demoUser.name,
                    email: demoUser.email,
                    role: selectedRole
                }));

                showLoading(false);
                showToast('Login successful! Redirecting...', 'success');

                // Redirect to dashboard
                setTimeout(() => {
                    if (selectedRole === 'admin') {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'vendor/dashboard.html';
                    }
                }, 1000);
            } else {
                showLoading(false);
                showError('Invalid email or password. Check demo credentials below.');
            }
        }, 1500);
    });

    // Initialize
    updateRoleSelection();
});
