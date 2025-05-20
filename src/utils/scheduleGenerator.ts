import { Subject, DailyAvailability, StudySession } from '../types';
import { addDays, differenceInDays, format, isAfter, isBefore, startOfDay } from 'date-fns';

// Constants for scheduling algorithm
const MIN_SESSION_DURATION = 30; // minimum session in minutes
const MAX_SESSION_DURATION = 120; // maximum session in minutes
const PRIORITY_MULTIPLIERS = {
  low: 1,
  medium: 1.5,
  high: 2
};

// Generate study sessions based on subjects and available time
export const generateStudySchedule = (
  subjects: Subject[],
  availabilities: DailyAvailability[],
  startDate: Date = new Date(), // defaults to today
  userId: string
): StudySession[] => {
  if (!subjects.length || !availabilities.length) {
    return [];
  }

  // Sort subjects by exam date (closest first) and priority
  const sortedSubjects = [...subjects].sort((a, b) => {
    const daysToExamA = differenceInDays(a.examDate, startDate);
    const daysToExamB = differenceInDays(b.examDate, startDate);
    
    // If exam dates are significantly different, sort by that
    if (Math.abs(daysToExamA - daysToExamB) > 3) {
      return daysToExamA - daysToExamB;
    }
    
    // Otherwise, consider priority
    const priorityA = PRIORITY_MULTIPLIERS[a.priority];
    const priorityB = PRIORITY_MULTIPLIERS[b.priority];
    return priorityB - priorityA;
  });

  // Calculate study time allocation based on exam proximity and subject priority
  const totalStudyNeeded = sortedSubjects.reduce((acc, subject) => {
    const daysToExam = Math.max(1, differenceInDays(subject.examDate, startDate));
    const priorityMultiplier = PRIORITY_MULTIPLIERS[subject.priority];
    return acc + (subject.estimatedStudyHours * priorityMultiplier / daysToExam);
  }, 0);

  // Calculate available study time per day
  const dailyAvailabilities = Array(7).fill(0);
  availabilities.forEach(a => {
    dailyAvailabilities[a.dayOfWeek] = a.availableHours;
  });
  
  // Generate a 14-day schedule
  const generatedSessions: StudySession[] = [];
  let currentDate = startOfDay(startDate);
  const endDate = addDays(currentDate, 14);
  
  while (isBefore(currentDate, endDate)) {
    const dayOfWeek = currentDate.getDay();
    const availableHours = dailyAvailabilities[dayOfWeek];
    
    if (availableHours > 0) {
      // Calculate minutes available for this day
      let availableMinutes = availableHours * 60;
      let assignedMinutes = 0;
      
      // Assign time to subjects that need study on this day
      for (const subject of sortedSubjects) {
        // Skip subjects whose exam date has passed
        if (isBefore(subject.examDate, currentDate)) {
          continue;
        }
        
        // Calculate how much time to allocate to this subject today
        const daysToExam = Math.max(1, differenceInDays(subject.examDate, currentDate));
        const priorityMultiplier = PRIORITY_MULTIPLIERS[subject.priority];
        const idealDailyMinutes = (subject.estimatedStudyHours * 60 * priorityMultiplier) / daysToExam;
        
        // Don't exceed available time
        const remainingMinutes = availableMinutes - assignedMinutes;
        if (remainingMinutes < MIN_SESSION_DURATION) break;
        
        // Calculate actual session duration
        let sessionDuration = Math.min(
          idealDailyMinutes,
          MAX_SESSION_DURATION,
          remainingMinutes
        );
        
        // Ensure minimum session duration
        sessionDuration = Math.max(sessionDuration, MIN_SESSION_DURATION);
        
        // Create a study session
        if (sessionDuration >= MIN_SESSION_DURATION) {
          generatedSessions.push({
            id: `${subject.id}-${format(currentDate, 'yyyy-MM-dd')}`,
            subjectId: subject.id,
            date: new Date(currentDate),
            duration: Math.floor(sessionDuration),
            completed: false,
            userId
          });
          
          assignedMinutes += sessionDuration;
          
          // Stop if we've used all available time
          if (assignedMinutes >= availableMinutes) break;
        }
      }
    }
    
    // Move to next day
    currentDate = addDays(currentDate, 1);
  }
  
  return generatedSessions;
};