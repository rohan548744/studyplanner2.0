import { create } from 'zustand';
import { AuthState, User } from '../types';

// This is a mock implementation. In a real app, you would use an actual backend.
const useAuthStore = create<AuthState>((set) => {
  // Check if user data exists in localStorage
  const storedUser = localStorage.getItem('user');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    login: async (email, password) => {
      // Mock login - in a real app, this would call an API
      if (email && password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create a mock user
        const user: User = {
          id: Math.random().toString(36).substring(2, 15),
          name: email.split('@')[0],
          email
        };
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        set({ user, isAuthenticated: true });
      } else {
        throw new Error('Invalid credentials');
      }
    },
    signup: async (name, email, password) => {
      // Mock signup - in a real app, this would call an API
      if (name && email && password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create a mock user
        const user: User = {
          id: Math.random().toString(36).substring(2, 15),
          name,
          email
        };
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        
        set({ user, isAuthenticated: true });
      } else {
        throw new Error('Invalid user data');
      }
    },
    logout: () => {
      // Remove from localStorage
      localStorage.removeItem('user');
      
      set({ user: null, isAuthenticated: false });
    }
  };
});

export default useAuthStore;