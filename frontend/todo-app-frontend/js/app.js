// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Todo App Initialized');
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Check for password reset token in URL
    checkForResetToken();
    
    // Add CSS for empty state if not already in styles
    addEmptyStateStyles();
});

// Add additional styles for empty state and overdue badges
function addEmptyStateStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .empty-state {
            text-align: center;
            padding: 3rem;
            background: white;
            border-radius: var(--radius);
            color: var(--gray-color);
        }
        
        .empty-state i {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
        
        .error-message {
            text-align: center;
            padding: 2rem;
            color: var(--danger-color);
            background: white;
            border-radius: var(--radius);
        }
        
        .overdue-badge {
            color: var(--danger-color);
            font-weight: bold;
            margin-left: 0.5rem;
        }
        
        .todo-item {
            transition: all 0.3s ease;
        }
        
        .todo-item:hover {
            transform: translateX(5px);
        }
        
        input, textarea, select {
            font-family: inherit;
        }
        
        button:active {
            transform: scale(0.98);
        }
    `;
    document.head.appendChild(style);
}