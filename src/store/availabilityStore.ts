import { create } from 'zustand';
import { AvailabilityState, DailyAvailability } from '../types';
import useAuthStore from './authStore';

const useAvailabilityStore = create<AvailabilityState>((set, get) => {
  // Get saved availabilities from localStorage
  const savedAvailabilities = localStorage.getItem('availabilities');
  const initialAvailabilities = savedAvailabilities 
    ? JSON.parse(savedAvailabilities)
    : [];
  
  // Helper to save to localStorage
  const saveAvailabilities = (availabilities: DailyAvailability[]) => {
    localStorage.setItem('availabilities', JSON.stringify(availabilities));
  };
  
  return {
    availabilities: initialAvailabilities,
    setAvailability: (dayOfWeek, hours) => {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      const currentAvailabilities = get().availabilities;
      const existingIndex = currentAvailabilities.findIndex(
        a => a.dayOfWeek === dayOfWeek && a.userId === user.id
      );
      
      let updatedAvailabilities;
      
      if (existingIndex >= 0) {
        // Update existing availability
        updatedAvailabilities = [...currentAvailabilities];
        updatedAvailabilities[existingIndex] = {
          ...updatedAvailabilities[existingIndex],
          availableHours: hours
        };
      } else {
        // Create new availability
        const newAvailability: DailyAvailability = {
          id: Math.random().toString(36).substring(2, 15),
          dayOfWeek,
          availableHours: hours,
          userId: user.id
        };
        updatedAvailabilities = [...currentAvailabilities, newAvailability];
      }
      
      set({ availabilities: updatedAvailabilities });
      saveAvailabilities(updatedAvailabilities);
    }
  };
});

export default useAvailabilityStore;