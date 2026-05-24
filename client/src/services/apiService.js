// apiService.js - Centralized API service for all backend communications

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`;
// Generic request function with error handling
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle different response statuses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Return response data
    return await response.json();
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);

    // Check if it's a network error (backend not running)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Impossible de se connecter au serveur. Assurez-vous que le serveur backend est en cours d\'exécution.');
    }

    throw error;
  }
};

// Authentication API methods
export const authService = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: () => request('/auth/me'),

  refreshToken: () => request('/auth/refresh', {
    method: 'POST',
  }),
};

// User API methods
export const userService = {
  getUserProfile: (userId) => request(`/users/${userId}`),

  updateUserProfile: (userId, profileData) => request(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  getUserFavorites: (userId) => request(`/users/${userId}/favorites`),

  getUserRecommendations: (userId) => request(`/users/${userId}/recommendations`),
};

// Recommendation API methods (NOUVEAU - Système hybride)
export const recommendationService = {
  // Hybrid recommendations (principal)
  getHybridRecommendations: (options = {}) => {
    const params = new URLSearchParams({
      limit: options.limit || 10,
      contentWeight: options.contentWeight || 0.5,
      collabWeight: options.collabWeight || 0.3,
      coldStartWeight: options.coldStartWeight || 0.2
    });
    return request(`/recommendations/hybrid?${params}`);
  },

  // Content-based only
  getContentBasedRecommendations: (limit = 10) => {
    return request(`/recommendations/content-based?limit=${limit}`);
  },

  // Collaborative filtering only
  getCollaborativeRecommendations: (limit = 10) => {
    return request(`/recommendations/collaborative?limit=${limit}`);
  },

  // Cold start (new users)
  getColdStartRecommendations: (limit = 10) => {
    return request(`/recommendations/cold-start?limit=${limit}`);
  },

  // Popular destinations
  getPopularDestinations: (limit = 10) => {
    return request(`/recommendations/popular?limit=${limit}`);
  },

  // Add a rating
  addRating: (destinationId, rating, comment = '') => {
    return request('/recommendations/rate', {
      method: 'POST',
      body: JSON.stringify({ destinationId, rating, comment })
    });
  },

  // Explain a recommendation
  explainRecommendation: (destinationId) => {
    return request(`/recommendations/explain/${destinationId}`);
  },

  // Run K-means clustering (admin only)
  runClustering: (k = 5) => {
    return request('/recommendations/clustering/run', {
      method: 'POST',
      body: JSON.stringify({ k })
    });
  },
};

// Dashboard API methods
export const dashboardService = {
  getUserDashboardData: () => request('/dashboard'),

  getUserStats: () => request('/dashboard/stats'),

  getUserActivity: () => request('/dashboard/activity'),
};

// Export default object with all services
const apiService = {
  authService,
  userService,
  dashboardService,
  recommendationService,
};

export default apiService;