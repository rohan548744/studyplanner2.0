import { create } from 'zustand';
import { Subject, SubjectsState } from '../types';
import useAuthStore from './authStore';

// Colors for subjects
const SUBJECT_COLORS = [
  '#4F46E5', // indigo
  '#0D9488', // teal
  '#F59E0B', // amber
  '#EC4899', // pink
  '#8B5CF6', // purple
  '#14B8A6', // teal
  '#F97316', // orange
];

const useSubjectsStore = create<SubjectsState>((set, get) => {
  // Get saved subjects from localStorage
  const savedSubjects = localStorage.getItem('subjects');
  const initialSubjects = savedSubjects 
    ? JSON.parse(savedSubjects).map((subj: any) => ({
        ...subj,
        examDate: new Date(subj.examDate)
      }))
    : [];
  
  // Helper to save to localStorage
  const saveSubjects = (subjects: Subject[]) => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  };
  
  return {
    subjects: initialSubjects,
    addSubject: (subjectData) => {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      // Create new subject with random color
      const newSubject: Subject = {
        ...subjectData,
        id: Math.random().toString(36).substring(2, 15),
        userId: user.id,
        color: SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)],
      };
      
      const updatedSubjects = [...get().subjects, newSubject];
      set({ subjects: updatedSubjects });
      saveSubjects(updatedSubjects);
    },
    updateSubject: (id, subjectData) => {
      const updatedSubjects = get().subjects.map(subject => 
        subject.id === id ? { ...subject, ...subjectData } : subject
      );
      set({ subjects: updatedSubjects });
      saveSubjects(updatedSubjects);
    },
    deleteSubject: (id) => {
      const updatedSubjects = get().subjects.filter(subject => subject.id !== id);
      set({ subjects: updatedSubjects });
      saveSubjects(updatedSubjects);
    }
  };
});

export default useSubjectsStore;