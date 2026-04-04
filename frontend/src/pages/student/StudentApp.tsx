import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import { roleNavigation } from "@/lib/navigation";
import Dashboard from "@/pages/student/Dashboard";
import ClassDashboardStudent from "@/pages/Protected/student/classes/ClassDashboardStudent";
import ListOfClass from "@/pages/Protected/faculty/classes/List_of_class";
import TechEventsNotifications from "@/pages/Protected/student/TechNotification";
import Feedback from "@/pages/Protected/student/feedback/Feedback";
import Calender from "@/pages/Protected/student/calender/Calender";
import StudentProfile from "@/pages/Protected/student/profile/ProfilePage";
import CreateEmergencyForm from "@/components/CreateEmergencyForm";
import ComingSoon from "@/pages/shared/ComingSoon";

const StudentApp = () => {
  return (
    <AppShell nav={roleNavigation.student}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="classes" element={<ListOfClass />} />
        <Route path="classes/:class_id" element={<ClassDashboardStudent />} />
        <Route path="attendance" element={<ComingSoon title="Student Attendance" />} />
        <Route path="calendar" element={<Calender />} />
        <Route path="notifications" element={<TechEventsNotifications />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="emergency" element={<CreateEmergencyForm />} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </AppShell>
  );
};

export default StudentApp;
