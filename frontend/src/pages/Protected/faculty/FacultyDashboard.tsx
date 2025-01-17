// import React from 'react'

// const FacultyLMSDashboard = () => {
//   return (
//     <div className=''>
//       Faculty Dashboard
//     </div>
//   )
// }

// export default FacultyLMSDashboard
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/AuthContext';
import { domain } from '@/lib/constant';
import { BookOpen, Calendar, Users, Clock, FileQuestion, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import UpcomingClassComponent from './classes/UpcomingClassComponent';

const FacultyLMSDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const response = await fetch(`${domain}/api/v1/faculty/get-faculty/${user?.user_id}`);
        const data = await response.json();
        console.log(data);
        
        setFacultyData(data.data);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchFacultyData();
    }
  }, [user]);

  const dashboardItems = [
    {
      title: 'My Classes',
      description: 'Manage your current classes and schedules',
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
      path: '/p/classes',
      stats: facultyData?.classes_count || '0 Classes'
    },
    {
      title: 'Attendance',
      description: 'Track and manage student attendance',
      icon: <Users className="h-6 w-6 text-green-500" />,
      path: '/p/attendance',
      stats: 'View Records'
    },
    {
      title: 'Schedule',
      description: 'View your teaching schedule',
      icon: <Calendar className="h-6 w-6 text-purple-500" />,
      path: '/p/schedule',
      stats: 'Weekly View'
    },
    {
      title: 'Student Queries',
      description: 'Respond to student questions',
      icon: <FileQuestion className="h-6 w-6 text-orange-500" />,
      path: '/p/queries',
      stats: 'Pending Queries'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {facultyData?.first_name}{" "}{facultyData?.last_name}</h1>
          <p className="text-gray-600">{facultyData?.departments[0]?.department_name} Department</p>
        </div>
        <div className="flex gap-2">
          <Clock className="h-5 w-5" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardItems.map((item, index) => (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="mt-2 text-sm font-medium text-blue-600">{item.stats}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Class Completion</p>
                <Progress value={75} className="mt-2" />
              </div>
              <div>
                <p className="text-sm font-medium">Attendance Updates</p>
                <Progress value={90} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add upcoming classes/events here */}
              <UpcomingClassComponent/>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

  );
};
export default FacultyLMSDashboard;