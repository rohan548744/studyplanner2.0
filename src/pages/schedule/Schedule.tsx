import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns';
import { ArrowLeft, ArrowRight, RefreshCw, Check } from 'lucide-react';
import useSubjectsStore from '../../store/subjectsStore';
import useSessionsStore from '../../store/sessionsStore';
import useAuthStore from '../../store/authStore';
import useAvailabilityStore from '../../store/availabilityStore';
import Card, { CardContent, CardHeader } from '../../components/Card';
import Button from '../../components/Button';
import { generateStudySchedule } from '../../utils/scheduleGenerator';

const Schedule: React.FC = () => {
  const { user } = useAuthStore();
  const { subjects } = useSubjectsStore();
  const { sessions, addSession, markAsCompleted } = useSessionsStore();
  const { availabilities } = useAvailabilityStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [weekSessions, setWeekSessions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize week days
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as week start
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    setWeekDays(days);
  }, [currentDate]);
  
  // Filter sessions for the current week
  useEffect(() => {
    if (weekDays.length === 0) return;
    
    const start = weekDays[0];
    const end = weekDays[weekDays.length - 1];
    
    const filteredSessions = sessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= start && sessionDate <= end;
      })
      .map(session => {
        const subject = subjects.find(s => s.id === session.subjectId);
        return {
          ...session,
          subjectName: subject?.name || 'Unknown Subject',
          subjectColor: subject?.color || '#4F46E5',
        };
      });
    
    // Group by day and sort by time
    const sessionsGrouped = weekDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return {
        date: day,
        sessions: filteredSessions
          .filter(s => format(new Date(s.date), 'yyyy-MM-dd') === dayStr)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };
    });
    
    setWeekSessions(sessionsGrouped);
  }, [weekDays, sessions, subjects]);
  
  const goToPreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };
  
  const goToNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };
  
  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
  };
  
  const generateNewSchedule = () => {
    if (!user || subjects.length === 0 || availabilities.length === 0) {
      alert('Please add subjects and set your availability before generating a schedule.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Generate new sessions
      const newSessions = generateStudySchedule(subjects, availabilities, new Date(), user.id);
      
      // Add each session
      newSessions.forEach(session => {
        addSession({
          subjectId: session.subjectId,
          date: session.date,
          duration: session.duration,
          completed: false
        });
      });
      
      alert(`Generated ${newSessions.length} study sessions for the next 14 days.`);
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCompleteSession = (id: string) => {
    markAsCompleted(id);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Schedule</h1>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentWeek}
            className="flex items-center gap-1"
          >
            Today
          </Button>
          
          <div className="flex rounded-md shadow-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              className="rounded-r-none border-r-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              className="rounded-l-none"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={generateNewSchedule}
            isLoading={isGenerating}
            className="flex items-center gap-1"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
            Generate Schedule
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekSessions.map((day, index) => (
          <Card 
            key={index} 
            className={`border ${isToday(day.date) ? 'border-indigo-300 ring-1 ring-indigo-300' : 'border-gray-200'}`}
          >
            <CardHeader className={`py-2 text-center ${isToday(day.date) ? 'bg-indigo-50' : 'bg-white'}`}>
              <p className="text-xs font-medium text-gray-500">
                {format(day.date, 'EEEE')}
              </p>
              <p className={`text-lg font-semibold ${isToday(day.date) ? 'text-indigo-600' : 'text-gray-900'}`}>
                {format(day.date, 'MMM d')}
              </p>
            </CardHeader>
            <CardContent className="p-2 h-64 overflow-y-auto">
              {day.sessions.length > 0 ? (
                <ul className="space-y-2">
                  {day.sessions.map((session: any) => (
                    <li 
                      key={session.id}
                      className={`
                        p-2 rounded border text-sm
                        ${session.completed 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-2">
                          <div 
                            className="w-3 h-3 mt-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: session.subjectColor }}
                          />
                          <div>
                            <p className={`font-medium ${session.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {session.subjectName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {session.duration} minutes
                            </p>
                          </div>
                        </div>
                        
                        {!session.completed && (
                          <button 
                            onClick={() => handleCompleteSession(session.id)}
                            className="p-1 rounded-full hover:bg-gray-100"
                            title="Mark as completed"
                          >
                            <Check className="h-3 w-3 text-gray-500 hover:text-green-600" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400">No sessions</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Schedule;