import React, { useEffect, useState } from 'react';
import useAvailabilityStore from '../../store/availabilityStore';
import useAuthStore from '../../store/authStore';
import Card, { CardContent, CardHeader, CardFooter } from '../../components/Card';
import Button from '../../components/Button';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const Availability: React.FC = () => {
  const { user } = useAuthStore();
  const { availabilities, setAvailability } = useAvailabilityStore();
  const [hoursPerDay, setHoursPerDay] = useState<number[]>(Array(7).fill(0));
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Initialize hours per day from stored availabilities
  useEffect(() => {
    if (!user) return;
    
    const newHoursPerDay = Array(7).fill(0);
    
    availabilities.forEach(avail => {
      if (avail.userId === user.id) {
        // Convert Sunday (0) to be the last day (6)
        const dayIndex = avail.dayOfWeek === 0 ? 6 : avail.dayOfWeek - 1;
        newHoursPerDay[dayIndex] = avail.availableHours;
      }
    });
    
    setHoursPerDay(newHoursPerDay);
  }, [availabilities, user]);
  
  const handleHoursChange = (dayIndex: number, hours: number) => {
    const newHoursPerDay = [...hoursPerDay];
    newHoursPerDay[dayIndex] = hours;
    setHoursPerDay(newHoursPerDay);
  };
  
  const handleSave = () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      // Update availability for each day
      hoursPerDay.forEach((hours, index) => {
        // Convert Monday (0) to be the first day (1), Sunday (6) to be (0)
        const dayOfWeek = index === 6 ? 0 : index + 1;
        setAvailability(dayOfWeek, hours);
      });
      
      alert('Availability settings saved!');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Daily Availability</h1>
      </div>
      
      <Card className="border border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Set Your Available Study Hours
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            For each day of the week, indicate how many hours you can dedicate to studying.
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="flex items-center justify-between">
                <label htmlFor={`day-${index}`} className="text-sm font-medium text-gray-700 w-32">
                  {day}
                </label>
                
                <div className="flex-1 max-w-md">
                  <input
                    id={`day-${index}`}
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={hoursPerDay[index]}
                    onChange={(e) => handleHoursChange(index, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                    <span>0h</span>
                    <span>6h</span>
                    <span>12h</span>
                  </div>
                </div>
                
                <div className="w-16 ml-4">
                  <div className="flex items-center justify-center px-3 py-2 bg-gray-100 rounded text-sm font-medium text-gray-900">
                    {hoursPerDay[index]} hrs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSave}
            isLoading={isUpdating}
          >
            Save Availability
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="border border-gray-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Tips for Setting Your Availability</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
            <li>Be realistic about how much time you can commit each day</li>
            <li>Consider your existing commitments (classes, work, etc.)</li>
            <li>Allow for breaks between study sessions</li>
            <li>Designate more time on weekends if possible</li>
            <li>Consider your energy levels throughout the week</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Availability;