import { useEffect, useState } from "react";
import {
  Book,
  Calendar,
  CheckSquare,
  MessageCircle,
  LogOut,
  FileQuestion,
  Bot,
  Siren,
  Bell,
} from "lucide-react";
import { useAuth } from "@/services/AuthContext";
import UpcomingClassComponentStudent from "./classes/UpciomingClassComponentStudent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userDataAtom } from "@/store/atom";
import { useAtom } from "jotai";
import { domain } from "@/lib/constant";
import { useNavigate } from "react-router-dom";
import Feedback from "./feedback/Feedback";
import  Calender  from "./calender/Calender";

const StudentLMSDashboard = () => {
  const [activeSection, setActiveSection] = useState("courses");
  const { logout, user } = useAuth();
  const [userData, setUserData] = useAtom(userDataAtom);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchStudentData = async () => {
    try {
      const studentResponse = await fetch(
        `${domain}/api/v1/student/get-student/${user?.user_id}`
      );
      const studentData = await studentResponse.json();
      console.log("studentData:", studentData);
      setUserData(studentData.data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user && !userData) {
      fetchStudentData();
    }
  }, [user, userData]);
  // Sample data (in a real app, this would come from backend)
  const courses = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      instructor: "Dr. Sarah Johnson",
      progress: 65,
      assignments: 3,
      newContent: true,
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      instructor: "Prof. Michael Lee",
      progress: 45,
      assignments: 2,
      newContent: false,
    },
  ];

  const upcomingAssignments = [
    {
      id: 1,
      course: "Computer Science",
      title: "Data Structures Homework",
      dueDate: "2024-12-05",
      status: "Pending",
    },
    {
      id: 2,
      course: "Advanced Mathematics",
      title: "Calculus Problem Set",
      dueDate: "2024-12-10",
      status: "Not Started",
    },
  ];
  if (!userData) {
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
      <div className="w-20 sm:w-44 bg-white shadow-md flex flex-col items-center py-8">
        <div className="mb-8">
          <Avatar
            className="cursor-pointer"
            onClick={() => navigate("/p/profile-page")}
          >
            <AvatarImage src={userData?.profile_picture} />
            <AvatarFallback className="bg-blue-500 text-white">
              {userData?.first_name?.charAt(0) || ""}
              {userData?.last_name?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>
        </div>
        <nav className="space-y-6 flex flex-col items-start">
          <button
            onClick={() => setActiveSection("courses")}
            className={`p-3 rounded flex flex-row items-center gap-4 ${
              activeSection === "courses"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-blue-100 hover:text-blue-700"
            }`}
          >
            <Book className="w-6 h-6" />
            <span className="hidden sm:inline">Courses</span>
          </button>
          <button
            onClick={() => {
              navigate("/p/calender");
            }}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "calendar"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-blue-100 hover:text-blue-700"
            }`}
          >
            <Calendar className="w-6 h-6" />{" "}
            <span className="hidden sm:inline">Calender</span>
          </button>
          <button
            onClick={() => setActiveSection("assignments")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "assignments"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-blue-100 hover:text-blue-700"
            }`}
          >
            <CheckSquare className="w-6 h-6" />{" "}
            <span className="hidden sm:inline">Assignments</span>
          </button>

          <button
            onClick={() => {
              navigate("/p/notifications");
            }}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "chatBot"
                ? "bg-yellow-100 text-yellow-700"
                : "text-gray-500 hover:bg-yellow-100 hover:text-yellow-700"
            }`}
          >
            <Bell className="w-6 h-6" />{" "}
            <span className="hidden sm:inline">Tech Events</span>
          </button>

          <button
            onClick={() => {
              navigate("/p/feedback");
            }}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "feedback"
                ? "bg-green-100 text-green-700"
                : "text-gray-500 hover:bg-green-100 hover:text-green-700"
            }`}
          >
            <FileQuestion className="w-6 h-6" />{" "}
            <span className="hidden sm:inline">Feedback</span>
          </button>
          <button
            onClick={() => {
              navigate("/p/emergency");
            }}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "alert"
                ? "bg-red-100 text-red-700"
                : "text-gray-500 hover:bg-red-100 hover:text-red-700"
            }`}
          >
            <Siren className="w-6 h-6" />{" "}
            <span className="hidden sm:inline">Alert</span>
          </button>

          <button
            onClick={logout}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "logout"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-red-100 hover:text-red-500"
            }`}
          >
            <LogOut className="w-6 h-6" />{" "}
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeSection === "courses" && (
          <UpcomingClassComponentStudent userData={userData} />
        )}
        {activeSection === "calendar" && (
          <UpcomingClassComponentStudent userData={userData} />
        )}
        {activeSection === "courses" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">My Courses</h1>
            {courses.map((course) => (
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
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span>{course.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* feedbackform */}
        {activeSection === "feedback" && <Feedback />}
        {activeSection === "calendar" && <Calender />}
        {activeSection === "assignments" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Upcoming Assignments</h1>
            {upcomingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white p-6 rounded-lg shadow-md mb-4 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{assignment.title}</h2>
                  <p className="text-gray-500">{assignment.course}</p>
                </div>
                <div className="flex items-center">
                  <span className="mr-4 text-gray-600">
                    Due: {assignment.dueDate}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      assignment.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
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
