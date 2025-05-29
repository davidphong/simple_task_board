import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(`${API_URL}/user/login`, { email, password });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the default Authorization header for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      
      return false;
    }
  },
  
  signup: async (username, email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.post(`${API_URL}/user/signup`, { username, email, password });
      
      set({ isLoading: false });
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Signup failed', 
        isLoading: false 
      });
      
      return false;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove the Authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
  
  clearError: () => set({ error: null })
})); 