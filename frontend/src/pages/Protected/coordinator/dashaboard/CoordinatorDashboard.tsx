import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, Building2, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CoordinatorDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Student Management',
      description: 'Manage student profiles, enrollments, and academic records',
      icon: <Users className="h-6 w-6" />,
      path: '/p/student',
      stats: '500+ Students'
    },
    {
      title: 'Faculty Management',
      description: 'Oversee faculty assignments and department allocations',
      icon: <Users className="h-6 w-6" />,
      path: '/p/faculty',
      stats: '50+ Faculty'
    },
    {
      title: 'Course Management',
      description: 'Handle course structures, syllabi, and academic planning',
      icon: <BookOpen className="h-6 w-6" />,
      path: '/p/course',
      stats: '15 Courses'
    },
    {
      title: 'Department Overview',
      description: 'View and manage department details and statistics',
      icon: <Building2 className="h-6 w-6" />,
      path: '/p/department',
      stats: '6 Departments'
    },
    {
      title: 'Class Schedule',
      description: 'Manage classroom allocations and timing schedules',
      icon: <Calendar className="h-6 w-6" />,
      path: '/p/classes',
      stats: '20+ Classes'
    },
    {
      title: 'Resource Management',
      description: 'Manage classroom equipments',
      icon: <Calendar className="h-6 w-6" />,
      path: '/p/resource',
      stats: '500+ Resources'
    }
  ];

  const recentNotifications = [
    {
      id: 1,
      title: 'New Faculty Onboarding',
      message: 'Complete onboarding for 3 new faculty members',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      title: 'Course Update Required',
      message: 'Review and update Computer Science syllabus',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      title: 'Student Registration',
      message: 'New batch registration pending approval',
      timestamp: '2 days ago'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Bell className="h-6 w-6 text-gray-500" />
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            Coordinator
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                {item.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="mt-2 text-sm font-medium text-blue-600">{item.stats}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    <span className="text-xs text-gray-400">{notification.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left border-gray-600 border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                Create New Student Account
              </button>
              <button className="w-full text-left border-gray-600 border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                Assign Faculty to Courses
              </button>
              <button className="w-full text-left border-gray-600 border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                Update Class Schedule
              </button>
              <button className="w-full text-left border-gray-600 border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                View Department Reports
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm  text-gray-600">Student Portal</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Faculty Portal</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Course Management</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Department Portal</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;