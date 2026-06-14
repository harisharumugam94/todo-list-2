// Global variables
let allTodos = [];
let currentFilter = 'all';

// DOM Elements for Todos
const todosList = document.getElementById('todosList');
const addTodoForm = document.getElementById('addTodoForm');
const totalCountSpan = document.getElementById('totalCount');
const completedCountSpan = document.getElementById('completedCount');
const pendingCountSpan = document.getElementById('pendingCount');
const filterBtns = document.querySelectorAll('.filter-btn');

// Load todos from API
async function loadTodos() {
    try {
        showLoading();
        const todos = await api.getTodos();
        
        if (Array.isArray(todos)) {
            allTodos = todos;
            renderTodos();
            updateStats();
        } else {
            allTodos = [];
            renderTodos();
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        showToast('Error loading todos', 'error');
        todosList.innerHTML = '<div class="error-message">Failed to load todos. Please refresh.</div>';
    }
}

// Show loading spinner
function showLoading() {
    todosList.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading your tasks...</p>
        </div>
    `;
}

// Render todos based on current filter
function renderTodos() {
    let filteredTodos = allTodos;
    
    if (currentFilter === 'completed') {
        filteredTodos = allTodos.filter(todo => todo.completed);
    } else if (currentFilter === 'pending') {
        filteredTodos = allTodos.filter(todo => !todo.completed);
    }
    
    if (filteredTodos.length === 0) {
        todosList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>No tasks found</p>
                <small>Add your first task above!</small>
            </div>
        `;
        return;
    }
    
    todosList.innerHTML = filteredTodos.map(todo => createTodoHTML(todo)).join('');
    
    // Attach event listeners to new buttons
    attachTodoEventListeners();
}

// Create HTML for a single todo
function createTodoHTML(todo) {
    const priorityClass = `priority-${todo.priority}`;
    const priorityIcon = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    }[todo.priority];
    
    const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';
    const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();
    
    return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo._id}">
            <div class="todo-header">
                <div class="todo-title ${todo.completed ? 'completed' : ''}">
                    <span>${todo.completed ? '✅' : '📝'}</span>
                    <span>${escapeHtml(todo.title)}</span>
                </div>
                <span class="priority-badge ${priorityClass}">
                    ${priorityIcon} ${todo.priority.toUpperCase()}
                </span>
            </div>
            ${todo.description ? `
                <div class="todo-description">
                    ${escapeHtml(todo.description)}
                </div>
            ` : ''}
            <div class="todo-footer">
                <div class="todo-date">
                    <i class="far fa-calendar-alt"></i>
                    ${dueDate}
                    ${isOverdue ? '<span class="overdue-badge"> ⚠️ Overdue</span>' : ''}
                </div>
                <div class="todo-actions">
                    <button class="toggle-complete" data-id="${todo._id}">
                        ${todo.completed ? '↩️ Undo' : '✅ Complete'}
                    </button>
                    <button class="delete-todo" data-id="${todo._id}">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Attach event listeners to todo buttons
function attachTodoEventListeners() {
    // Toggle complete buttons
    document.querySelectorAll('.toggle-complete').forEach(btn => {
        btn.removeEventListener('click', handleToggleComplete);
        btn.addEventListener('click', handleToggleComplete);
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-todo').forEach(btn => {
        btn.removeEventListener('click', handleDeleteTodo);
        btn.addEventListener('click', handleDeleteTodo);
    });
}

// Handle toggle complete
async function handleToggleComplete(e) {
    const btn = e.currentTarget;
    const todoId = btn.getAttribute('data-id');
    const todo = allTodos.find(t => t._id === todoId);
    
    if (todo) {
        try {
            const updatedTodo = await api.updateTodo(todoId, {
                completed: !todo.completed
            });
            
            // Update local data
            const index = allTodos.findIndex(t => t._id === todoId);
            allTodos[index] = updatedTodo;
            
            renderTodos();
            updateStats();
            showToast(`Task marked as ${updatedTodo.completed ? 'completed' : 'pending'}`, 'success');
        } catch (error) {
            showToast('Error updating task', 'error');
        }
    }
}

// Handle delete todo
async function handleDeleteTodo(e) {
    const btn = e.currentTarget;
    const todoId = btn.getAttribute('data-id');
    
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await api.deleteTodo(todoId);
            
            // Remove from local data
            allTodos = allTodos.filter(t => t._id !== todoId);
            
            renderTodos();
            updateStats();
            showToast('Task deleted successfully', 'success');
        } catch (error) {
            showToast('Error deleting task', 'error');
        }
    }
}

// Handle add todo
async function handleAddTodo(e) {
    e.preventDefault();
    
    const title = document.getElementById('todoTitle').value.trim();
    const description = document.getElementById('todoDescription').value.trim();
    const priority = document.getElementById('todoPriority').value;
    const dueDate = document.getElementById('todoDueDate').value;
    
    if (!title) {
        showToast('Please enter a task title', 'error');
        return;
    }
    
    const todoData = {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined
    };
    
    try {
        const newTodo = await api.createTodo(todoData);
        allTodos.unshift(newTodo); // Add to beginning of array
        renderTodos();
        updateStats();
        showToast('Task added successfully!', 'success');
        
        // Clear form
        document.getElementById('addTodoForm').reset();
    } catch (error) {
        showToast('Error adding task', 'error');
    }
}

// Update statistics
function updateStats() {
    const total = allTodos.length;
    const completed = allTodos.filter(t => t.completed).length;
    const pending = total - completed;
    
    totalCountSpan.textContent = total;
    completedCountSpan.textContent = completed;
    pendingCountSpan.textContent = pending;
}

// Handle filter change
function handleFilterChange(filter) {
    currentFilter = filter;
    
    // Update active button styles
    filterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTodos();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
addTodoForm.addEventListener('submit', handleAddTodo);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        handleFilterChange(filter);
    });
});