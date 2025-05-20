export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Subject {
  id: string;
  name: string;
  examDate: Date;
  color: string;
  priority: 'low' | 'medium' | 'high';
  estimatedStudyHours: number;
  userId: string;
}

export interface DailyAvailability {
  id: string;
  dayOfWeek: number; // 0-6, Sunday to Saturday
  availableHours: number;
  userId: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  date: Date;
  duration: number; // in minutes
  completed: boolean;
  userId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface SubjectsState {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'userId'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
}

export interface AvailabilityState {
  availabilities: DailyAvailability[];
  setAvailability: (dayOfWeek: number, hours: number) => void;
}

export interface StudySessionsState {
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id' | 'userId'>) => void;
  updateSession: (id: string, session: Partial<StudySession>) => void;
  deleteSession: (id: string) => void;
  markAsCompleted: (id: string) => void;
}