import React, { useState } from "react";
import {
  Book,
  Users,
  ClipboardList,
  BarChart2,
  MessageCircle,
  FileText,
  BookOpen,
  LogOut,
  Home,
  User2,
  List,
  Calendar,
  School,
} from "lucide-react";
import { useAuth } from "@/services/AuthContext";
import { useNavigate } from "react-router-dom";
import UpcomingClassComponent from "./classes/UpcomingClassComponent";

const FacultyLMSDashboard = () => {
  const [activeSection, setActiveSection] = useState("courses");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const courses = [
    {
      id: 1,
      title: "Introduction to Computer Science",
      semester: "Fall 2024",
      students: 45,
      assignments: 6,
      averageGrade: 85.5,
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      semester: "Fall 2024",
      students: 30,
      assignments: 4,
      averageGrade: 78.3,
    },
  ];

  const students = [
    {
      id: 1,
      name: "Emily Rodriguez",
      course: "Computer Science",
      grade: 92,
      progress: 75,
      attendance: "95%",
    },
    {
      id: 2,
      name: "Jason Kim",
      course: "Advanced Mathematics",
      grade: 85,
      progress: 60,
      attendance: "88%",
    },
  ];

  const assignments = [
    {
      id: 1,
      title: "Data Structures Project",
      course: "Computer Science",
      dueDate: "2024-12-15",
      submitted: 35,
      total: 45,
    },
    {
      id: 2,
      title: "Calculus Problem Set",
      course: "Advanced Mathematics",
      dueDate: "2024-12-20",
      submitted: 25,
      total: 30,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-52 bg-white shadow-md flex flex-col items-center py-8">
        <div className="mb-1">
          <img
            src="/faculty.jpg"
            alt="Faculty Profile"
            className="rounded-full w-16 h-16 object-cover my-3"
          />
        </div>
        <nav className="space-y-1 flex flex-col items-start">
          <button
            onClick={() => navigate("/p/profile-page")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "profile"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-violet-100 hover:text-blue-700"
            }`}
          >
            <User2 className="w-6 h-6" /> Profile
          </button>

          <button
            onClick={() => setActiveSection("courses")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "courses"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-violet-100 hover:text-blue-700"
            }`}
          >
            <BookOpen className="w-6 h-6" /> Courses
          </button>
          <button
            onClick={() => setActiveSection("students")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "students"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-violet-100 hover:text-blue-700"
            }`}
          >
            <Users className="w-6 h-6" /> Students Details
          </button>
          <button
            onClick={() => setActiveSection("assignments")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "assignments"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-violet-100 hover:text-blue-700"
            }`}
          >
            <ClipboardList className="w-6 h-6" /> Assingments
          </button>
          <button
            onClick={() => navigate("/p/interactive-classroom")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "analytics"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-violet-100 hover:text-blue-700"
            }`}
          >
            <Home className="w-6 h-6" /> Room
          </button>

          <button
            onClick={() => navigate("/p/department")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "analytics"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-violet-100 hover:text-blue-700"
            }`}
          >
            <Book className="w-6 h-6" /> Department Info
          </button>
          <button
            onClick={() => navigate("/p/department-syllabus")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "syllabus"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-violet-100 hover:text-blue-700"
            }`}
          >
            <List className="w-6 h-6" /> Syllabus
          </button>
          <button
            onClick={() => navigate("/p/schedule")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "schedule"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-violet-100 hover:text-blue-700"
            }`}
          >
            <Calendar className="w-6 h-6" /> Schedule
          </button>
          <button
            onClick={() => navigate("/p/classes-list")}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "analytics"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-green-100 hover:text-green-700"
            }`}
          >
            <School className="w-6 h-6" /> Classes
          </button>
          <button
            onClick={logout}
            className={`p-3 rounded flex flex-row gap-4 ${
              activeSection === "analytics"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-700 hover:bg-red-100 hover:text-red-700"
            }`}
          >
            <LogOut className="w-6 h-6" /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeSection === "courses" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">
              <div className="w-full flex justify-between">
                <div>My Courses</div>
                <div>
                  <button
                    onClick={() => navigate("/p/interactive-classroom")}
                    className={`p-3 flex justify-between items-center gap-2 border-2 rounded-xl border-black`}
                  >
                    <Home className="w-6 h-6" />
                    <span>Room</span>
                  </button>
                </div>
              </div>
            </h1>
            <UpcomingClassComponent />
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-6 rounded-lg shadow-md mb-4 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-gray-500">{course.semester}</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="font-bold text-lg">{course.students}</div>
                    <div className="text-gray-500 text-sm">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {course.assignments}
                    </div>
                    <div className="text-gray-500 text-sm">Assignments</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {course.averageGrade}%
                    </div>
                    <div className="text-gray-500 text-sm">Avg Grade</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "students" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Student Performance</h1>
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white p-6 rounded-lg shadow-md mb-4 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{student.name}</h2>
                  <p className="text-gray-500">{student.course}</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="font-bold text-lg">{student.grade}%</div>
                    <div className="text-gray-500 text-sm">Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{student.progress}%</div>
                    <div className="text-gray-500 text-sm">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {student.attendance}
                    </div>
                    <div className="text-gray-500 text-sm">Attendance</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "assignments" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Assignment Management</h1>
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white p-6 rounded-lg shadow-md mb-4 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold">{assignment.title}</h2>
                  <p className="text-gray-500">{assignment.course}</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      Due {assignment.dueDate}
                    </div>
                    <div className="text-gray-500 text-sm">Deadline</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">
                      {assignment.submitted}/{assignment.total}
                    </div>
                    <div className="text-gray-500 text-sm">Submissions</div>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyLMSDashboard;
