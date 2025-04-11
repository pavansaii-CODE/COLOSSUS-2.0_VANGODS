const API_BASE_URL = 'http://localhost:5000/api';

// API service for handling authentication requests
const AuthService = {
  // Login user and store token
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
    // Store token and user data in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  // Register new user
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
    // Store token and user data in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  // Get auth token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Verify token validity with backend
  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        headers: {
          'x-auth-token': token
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  // Fetch current user data from API
  fetchCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user data');
    }

    const userData = await response.json();
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Make AuthService available globally
window.AuthService = AuthService;
