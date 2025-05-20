import { create } from 'zustand';
import { StudySession, StudySessionsState } from '../types';
import useAuthStore from './authStore';

const useSessionsStore = create<StudySessionsState>((set, get) => {
  // Get saved sessions from localStorage
  const savedSessions = localStorage.getItem('sessions');
  const initialSessions = savedSessions 
    ? JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        date: new Date(session.date)
      }))
    : [];
  
  // Helper to save to localStorage
  const saveSessions = (sessions: StudySession[]) => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  };
  
  return {
    sessions: initialSessions,
    addSession: (sessionData) => {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      const newSession: StudySession = {
        ...sessionData,
        id: Math.random().toString(36).substring(2, 15),
        userId: user.id
      };
      
      const updatedSessions = [...get().sessions, newSession];
      set({ sessions: updatedSessions });
      saveSessions(updatedSessions);
    },
    updateSession: (id, sessionData) => {
      const updatedSessions = get().sessions.map(session => 
        session.id === id ? { ...session, ...sessionData } : session
      );
      set({ sessions: updatedSessions });
      saveSessions(updatedSessions);
    },
    deleteSession: (id) => {
      const updatedSessions = get().sessions.filter(session => session.id !== id);
      set({ sessions: updatedSessions });
      saveSessions(updatedSessions);
    },
    markAsCompleted: (id) => {
      const updatedSessions = get().sessions.map(session => 
        session.id === id ? { ...session, completed: true } : session
      );
      set({ sessions: updatedSessions });
      saveSessions(updatedSessions);
    }
  };
});

export default useSessionsStore;