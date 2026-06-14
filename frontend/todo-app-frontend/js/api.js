// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Store auth token
let authToken = localStorage.getItem('token');

// Helper function to get headers
const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
};

// API Functions
const api = {
    // Auth endpoints
    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    },
    
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return await response.json();
    },
    
    forgotPassword: async (email) => {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return await response.json();
    },
    
    resetPassword: async (token, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        return await response.json();
    },
    
    getMe: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: getHeaders()
        });
        return await response.json();
    },
    
    // Todo endpoints
    getTodos: async () => {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'GET',
            headers: getHeaders()
        });
        return await response.json();
    },
    
    createTodo: async (todoData) => {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(todoData)
        });
        return await response.json();
    },
    
    updateTodo: async (id, todoData) => {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(todoData)
        });
        return await response.json();
    },
    
    deleteTodo: async (id) => {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return await response.json();
    }
};

// Set auth token (call this after login/register)
function setAuthToken(token) {
    authToken = token;
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
}

// Get current auth token
function getAuthToken() {
    return authToken;
}