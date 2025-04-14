import { useEffect, useState } from "react";
import { useAuth } from "@/services/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userDataAtom } from "@/store/atom";
import { useAtom } from "jotai";
import { domain } from "@/lib/constant";
import { useNavigate } from "react-router-dom";
import UpcomingClassComponentStudent from "./classes/UpciomingClassComponentStudent";

const StudentLMSDashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useAtom(userDataAtom);
  const [, setLoading] = useState(true);
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

  const quickStats = [
    { label: "Courses Enrolled", value: "5" },
    { label: "Assignments Due", value: "3" },
    { label: "Average Score", value: "85%" },
    { label: "Attendance", value: "92%" },
  ];

  const recentActivities = [
    { type: "assignment", title: "Data Structures Assignment Submitted", time: "2 hours ago" },
    { type: "course", title: "Completed Python Basics Module", time: "1 day ago" },
    { type: "feedback", title: "Received Grade for Math Quiz", time: "2 days ago" },
  ];

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Profile */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userData?.profile_picture} />
              <AvatarFallback className="bg-blue-500 text-white text-xl">
                {userData?.first_name?.charAt(0)}{userData?.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{`${userData?.first_name} ${userData?.last_name}`}</h1>
              {/* <p className="text-gray-600">Student ID: {userData?.student_id}</p> */}
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate("/p/profile-page")} 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">{stat.label}</h3>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Classes</h2>
        <UpcomingClassComponentStudent userData={userData} />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentLMSDashboard;
