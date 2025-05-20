import React, { useEffect, useState } from 'react';
import { format, compareAsc, differenceInDays, addDays } from 'date-fns';
import { CalendarIcon, BookIcon, TrendingUpIcon, CheckSquareIcon } from 'lucide-react';
import useSubjectsStore from '../../store/subjectsStore';
import useSessionsStore from '../../store/sessionsStore';
import Card, { CardContent, CardHeader } from '../../components/Card';
import Button from '../../components/Button';

const Dashboard: React.FC = () => {
  const { subjects } = useSubjectsStore();
  const { sessions, markAsCompleted } = useSessionsStore();
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percent: 0,
  });
  
  useEffect(() => {
    // Calculate session progress
    const completed = sessions.filter(s => s.completed).length;
    const total = sessions.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    setProgress({
      completed,
      total,
      percent,
    });
    
    // Get upcoming study sessions (today and next 2 days)
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const threeDaysFromNow = addDays(today, 3);
    
    const upcoming = sessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return !session.completed && 
               compareAsc(sessionDate, today) >= 0 && 
               compareAsc(sessionDate, threeDaysFromNow) < 0;
      })
      .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)))
      .slice(0, 5)
      .map(session => {
        const subject = subjects.find(s => s.id === session.subjectId);
        return {
          ...session,
          subjectName: subject?.name || 'Unknown Subject',
          subjectColor: subject?.color || '#4F46E5',
        };
      });
    
    setUpcomingSessions(upcoming);
    
    // Get upcoming exams (next 30 days)
    const nextMonth = addDays(today, 30);
    
    const exams = subjects
      .filter(subject => {
        return compareAsc(subject.examDate, today) >= 0 && 
               compareAsc(subject.examDate, nextMonth) <= 0;
      })
      .sort((a, b) => compareAsc(a.examDate, b.examDate))
      .slice(0, 5)
      .map(subject => {
        const daysUntilExam = differenceInDays(subject.examDate, today);
        return {
          ...subject,
          daysUntilExam,
        };
      });
    
    setUpcomingExams(exams);
  }, [subjects, sessions]);
  
  const handleMarkCompleted = (id: string) => {
    markAsCompleted(id);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Card - Subjects */}
        <Card className="border border-gray-200">
          <CardContent className="flex items-center py-6">
            <div className="p-3 rounded-full bg-indigo-100">
              <BookIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Subjects</p>
              <h3 className="text-xl font-semibold text-gray-900">{subjects.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Card - Study Sessions */}
        <Card className="border border-gray-200">
          <CardContent className="flex items-center py-6">
            <div className="p-3 rounded-full bg-teal-100">
              <CalendarIcon className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Study Sessions</p>
              <h3 className="text-xl font-semibold text-gray-900">{sessions.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Card - Completed Sessions */}
        <Card className="border border-gray-200">
          <CardContent className="flex items-center py-6">
            <div className="p-3 rounded-full bg-green-100">
              <CheckSquareIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-xl font-semibold text-gray-900">{progress.completed}</h3>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Card - Progress */}
        <Card className="border border-gray-200">
          <CardContent className="flex items-center py-6">
            <div className="p-3 rounded-full bg-amber-100">
              <TrendingUpIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Progress</p>
              <h3 className="text-xl font-semibold text-gray-900">{progress.percent}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Study Sessions */}
        <Card className="border border-gray-200">
          <CardHeader className="bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Study Sessions</h2>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingSessions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {upcomingSessions.map((session) => (
                  <li key={session.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: session.subjectColor }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{session.subjectName}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(session.date), 'EEEE, MMM d')} · {session.duration} minutes
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkCompleted(session.id)}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No upcoming study sessions</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Exams */}
        <Card className="border border-gray-200">
          <CardHeader className="bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Exams</h2>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingExams.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {upcomingExams.map((exam) => (
                  <li key={exam.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: exam.color }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{exam.name}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(exam.examDate), 'EEEE, MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${exam.daysUntilExam <= 3 
                            ? 'bg-red-100 text-red-800' 
                            : exam.daysUntilExam <= 7 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-green-100 text-green-800'
                          }
                        `}>
                          {exam.daysUntilExam} days left
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No upcoming exams</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Progress Bar */}
      <Card className="border border-gray-200">
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900">Overall Progress</h3>
            <span className="text-sm text-gray-500">
              {progress.completed} of {progress.total} sessions completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;