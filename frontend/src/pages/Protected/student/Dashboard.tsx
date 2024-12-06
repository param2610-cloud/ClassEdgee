import React, { useEffect, useState } from 'react';
import { Book, Calendar, CheckSquare, MessageCircle, BarChart2, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/services/AuthContext';
import UpcomingClassComponentStudent from './classes/UpciomingClassComponentStudent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userDataAtom } from '@/store/atom';
import { useAtom } from 'jotai';
import { domain } from '@/lib/constant';
import { useNavigate } from 'react-router-dom';

const StudentLMSDashboard = () => {
  const [activeSection, setActiveSection] = useState('courses');
  const {logout,user} = useAuth()
  const [userData,setUserData] = useAtom(userDataAtom)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchStudentData = async () => {
    try {
      const studentResponse = await fetch(`${domain}/api/v1/student/get-student/${user?.user_id}`);
      const studentData = await studentResponse.json();
      console.log("studentData:",studentData);
      setUserData(studentData.data);
      
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }
  useEffect(() => {
    if(user && !userData){
      fetchStudentData()
    }
  },[user,userData])
  // Sample data (in a real app, this would come from backend)
  const courses = [
    { 
      id: 1, 
      title: 'Introduction to Computer Science', 
      instructor: 'Dr. Sarah Johnson',
      progress: 65,
      assignments: 3,
      newContent: true
    },
    { 
      id: 2, 
      title: 'Advanced Mathematics', 
      instructor: 'Prof. Michael Lee',
      progress: 45,
      assignments: 2,
      newContent: false
    }
  ];

  const upcomingAssignments = [
    {
      id: 1,
      course: 'Computer Science',
      title: 'Data Structures Homework',
      dueDate: '2024-12-05',
      status: 'Pending'
    },
    {
      id: 2,
      course: 'Advanced Mathematics',
      title: 'Calculus Problem Set',
      dueDate: '2024-12-10',
      status: 'Not Started'
    }
  ];
  if(!userData){
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-gray-500">Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar Navigation */}
      <div className="w-24 bg-white shadow-md flex flex-col items-center py-8">
        <div className="mb-8">
          <Avatar onClick={()=>navigate("/p/profile-page")}>
            <AvatarImage src={userData?.profile_picture}/>
            <AvatarFallback className="bg-blue-500 text-white">
              {userData?.first_name?.charAt(0) || ''}{userData?.last_name?.charAt(0) || ''}
            </AvatarFallback>
          </Avatar>
        </div>
        <nav className="space-y-6">
          <button 
            onClick={() => setActiveSection('courses')}
            className={`p-3 rounded ${activeSection === 'courses' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Book className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveSection('calendar')}
            className={`p-3 rounded ${activeSection === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Calendar className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveSection('assignments')}
            className={`p-3 rounded ${activeSection === 'assignments' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <CheckSquare className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveSection('messages')}
            className={`p-3 rounded ${activeSection === 'messages' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <MessageCircle className="w-6 h-6" />
          </button>


          <button 
            onClick={logout}
            className={`p-3 rounded ${activeSection === 'messages' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <LogOut className="w-6 h-6" />
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <UpcomingClassComponentStudent userData={userData}/>
        {activeSection === 'courses' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">My Courses</h1>
            {courses.map(course => (
              <div 
                key={course.id} 
                className="bg-white p-6 rounded-lg shadow-md mb-4 flex items-center"
              >
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-gray-500">{course.instructor}</p>
                </div>
                <div className="flex items-center">
                  {course.newContent && (
                    <span className="mr-4 px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                      New Content
                    </span>
                  )}
                  <div className="w-36 bg-gray-200 rounded-full h-2.5 mr-4">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{width: `${course.progress}%`}}
                    ></div>
                  </div>
                  <span>{course.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'assignments' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Upcoming Assignments</h1>
            {upcomingAssignments.map(assignment => (
              <div 
                key={assignment.id} 
                className="bg-white p-6 rounded-lg shadow-md mb-4 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{assignment.title}</h2>
                  <p className="text-gray-500">{assignment.course}</p>
                </div>
                <div className="flex items-center">
                  <span className="mr-4 text-gray-600">Due: {assignment.dueDate}</span>
                  <span 
                    className={`px-3 py-1 rounded-full text-sm ${
                      assignment.status === 'Pending' 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLMSDashboard;