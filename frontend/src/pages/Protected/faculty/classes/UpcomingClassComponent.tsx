import React, { useState, useEffect } from 'react';
import { Clock, Book, Users, DoorOpen, Calendar, Home, BookOpen, Bell, UserCircle, Video, HomeIcon, Box } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { domain } from '@/lib/constant';
import { useAuth } from '@/services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Class } from '@/interface/general';

const UpcomingClassComponent = () => {
  const [upcomingClass, setUpcomingClass] = useState<Class | null>(null);
  const [remainingTime, setRemainingTime] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        if (!user?.user_id) {
          setLoading(false);
          return;
        }

        const facultyResponse = await fetch(`${domain}/api/v1/faculty/get-faculty/${user.user_id}`);
        if (!facultyResponse.ok) {
          console.error('Failed to fetch faculty data');
          setLoading(false);
          return;
        }

        const facultyData = await facultyResponse.json();
        if (!facultyData?.data?.faculty?.faculty_id) {
          setLoading(false);
          return;
        }
        
        const classesResponse = await fetch(`${domain}/api/v1/faculty/classes/upcoming-classes/${facultyData.data.faculty.faculty_id}/1`);
        if (!classesResponse.ok) {
          console.error('Failed to fetch classes data');
          setLoading(false);
          return;
        }

        const classesData = await classesResponse.json();
        if (!classesData || Object.keys(classesData).length === 0) {
          setUpcomingClass(null);
        } else {
          setUpcomingClass(classesData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchFacultyData();
  }, [user?.user_id]);

  useEffect(() => {
    if (!upcomingClass?.timeslots?.start_time || !upcomingClass?.timeslots?.end_time || !upcomingClass?.date_of_class) {
      return;
    }

    const updateClassStatus = () => {
      const now = new Date();
      const classDate = new Date(upcomingClass.date_of_class);
      
      // Extract hours and minutes from timeslots
      const startTime = new Date(upcomingClass.timeslots.start_time);
      const endTime = new Date(upcomingClass.timeslots.end_time);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.error('Invalid time format');
        return;
      }
      
      // Set the class date with the correct time
      const classStartTime = new Date(classDate);
      const classEndTime = new Date(classDate);
      
      classStartTime.setHours(startTime.getUTCHours(), startTime.getUTCMinutes(), 0);
      classEndTime.setHours(endTime.getUTCHours(), endTime.getUTCMinutes(), 0);

      // Check if current time is between start and end time
      setIsLive(now >= classStartTime && now <= classEndTime);

      // Calculate remaining time
      const timeDiff = classStartTime.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        setRemainingTime(`${hours}h ${minutes}m`);
      } else if (now <= classEndTime) {
        setRemainingTime('Ongoing');
      } else {
        setRemainingTime('Completed');
      }
    };

    const timer = setInterval(updateClassStatus, 30000); // Update every 30 seconds
    updateClassStatus();

    return () => clearInterval(timer);
  }, [upcomingClass]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-4 pb-20 md:pb-4 max-w-7xl mx-auto w-full">
        <Card className="w-full mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Upcoming Class
              {isLive && (
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800 animate-pulse">
                  LIVE
                </Badge>
              )}
            </CardTitle>
            {remainingTime && (
              <Badge variant="outline" className="text-sm">
                {remainingTime}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {upcomingClass && 
             upcomingClass.courses?.course_name && 
             upcomingClass.sections?.section_name && 
             upcomingClass.rooms?.room_number ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Book className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-lg">{upcomingClass.courses.course_name}</h3>
                    <p className="text-sm text-gray-500">Course Code: {upcomingClass.courses.course_code}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Section</p>
                      <p className="font-medium">{upcomingClass.sections.section_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <DoorOpen className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="font-medium">{upcomingClass.rooms.room_number}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">
                        {new Date(upcomingClass.timeslots.start_time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                        {' - '}
                        {new Date(upcomingClass.timeslots.end_time).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(upcomingClass.date_of_class).toLocaleDateString([], {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {!isLive && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      className="w-full md:w-auto gap-2" 
                      size="lg" 
                      onClick={() => navigate(`/p/classes/${upcomingClass.class_id}`)}
                    >
                      <Box className="w-5 h-5" />
                      Join Class
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No upcoming classes</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UpcomingClassComponent;