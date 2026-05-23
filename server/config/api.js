// client/src/config/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_URLS = {
  // ========== AUTH ==========
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  ME: `${API_BASE_URL}/auth/me`,
  
  // ========== USERS ==========
  USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  USER_MANAGEMENT: `${API_BASE_URL}/user-management`,
  
  // ========== DESTINATIONS ==========
  DESTINATIONS: `${API_BASE_URL}/destinations`,
  DESTINATION: (id) => `${API_BASE_URL}/destinations/${id}`,
  
  // ========== ACTIVITIES ==========
  ACTIVITIES: `${API_BASE_URL}/activities`,
  ACTIVITY: (id) => `${API_BASE_URL}/activities/${id}`,
  
  // ========== HOTELS ==========
  HOTELS: `${API_BASE_URL}/hotels`,
  HOTEL: (id) => `${API_BASE_URL}/hotels/${id}`,
  
  // ========== TRANSPORTS ==========
  TRANSPORTS: `${API_BASE_URL}/transports`,
  TRANSPORT: (id) => `${API_BASE_URL}/transports/${id}`,
  
  // ========== RESERVATIONS ==========
  RESERVATIONS: `${API_BASE_URL}/reservations`,
  RESERVATION: (id) => `${API_BASE_URL}/reservations/${id}`,
  MY_RESERVATIONS: `${API_BASE_URL}/reservations/my`,
  
  // ========== REVIEWS ==========
  REVIEWS: `${API_BASE_URL}/reviews`,
  REVIEW: (id) => `${API_BASE_URL}/reviews/${id}`,
  REVIEWS_BY_DESTINATION: (id) => `${API_BASE_URL}/reviews/destination/${id}`,
  
  // ========== FAVORITES ==========
  FAVORITES: `${API_BASE_URL}/favorites`,
  MY_FAVORITES: `${API_BASE_URL}/favorites/my`,
  
  // ========== PUBLICATIONS ==========
  PUBLICATIONS: `${API_BASE_URL}/publications`,
  PUBLICATION: (id) => `${API_BASE_URL}/publications/${id}`,
  
  // ========== RECOMMENDATIONS ==========
  RECOMMENDATIONS: `${API_BASE_URL}/recommendations`,
  
  // ========== CONTACT ==========
  CONTACT: `${API_BASE_URL}/contact`,
  
  // ========== INVOICES ==========
  INVOICES: `${API_BASE_URL}/invoices`,
  INVOICE: (id) => `${API_BASE_URL}/invoices/${id}`,
  
  // ========== PAYMENT ==========
  PAYMENT: `${API_BASE_URL}/payment`,
  
  // ========== UPLOAD ==========
  UPLOAD: `${API_BASE_URL}/upload`,
};

export default API_BASE_URL;