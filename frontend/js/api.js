const API_BASE_URL = 'http://localhost:5000/api';

// API service for handling authentication requests

const AuthService = {
  login: async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    return data;
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  logout: () => {
    localStorage.removeItem('user');
  }
};

// Make AuthService available globally
window.AuthService = AuthService;
