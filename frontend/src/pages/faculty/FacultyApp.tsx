import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import { roleNavigation } from "@/lib/navigation";
import FacultyDashboard from "@/pages/faculty/Dashboard";
import ListOfClass from "@/pages/Protected/faculty/classes/List_of_class";
import ClassDashboard from "@/pages/Protected/faculty/classes/ClassDashboard";
import QuizManagement from "@/pages/Protected/faculty/classes/quizzes/QuizDashboard";
import ScheduleDashboard from "@/pages/Protected/faculty/schedule/ScheduleDashboard";
import ScheduleViewer from "@/pages/Protected/faculty/schedule/ScheduleViewer";
import FacultyAttendanceDashboard from "@/pages/Protected/faculty/Attendance/FacultyAttendance";
import ResourceManagement from "@/pages/Protected/coordinator/resource/ResourceManagement";
import DepartmentDetails from "@/pages/Protected/department/[departmentid]/DetailDepartment";
import CourseDashboardForFaculty from "@/pages/Protected/faculty/Course/CourseDashboardForFaculty";
import Profilepage from "@/pages/Protected/faculty/profile/Profilepage";
import CreateEmergencyForm from "@/components/CreateEmergencyForm";

const FacultyApp = () => {
  return (
    <AppShell nav={roleNavigation.faculty}>
      <Routes>
        <Route index element={<FacultyDashboard />} />
        <Route path="classes" element={<ListOfClass />} />
        <Route path="classes/:class_id" element={<ClassDashboard />} />
        <Route path="classes/:class_id/quiz" element={<QuizManagement />} />
        <Route path="schedule" element={<ScheduleDashboard />} />
        <Route path="schedule/:section_id" element={<ScheduleViewer />} />
        <Route path="attendance" element={<FacultyAttendanceDashboard />} />
        <Route path="resources" element={<ResourceManagement />} />
        <Route path="department" element={<DepartmentDetails />} />
        <Route path="courses" element={<CourseDashboardForFaculty />} />
        <Route path="profile" element={<Profilepage />} />
        <Route path="emergency" element={<CreateEmergencyForm />} />
        <Route path="*" element={<Navigate to="/faculty" replace />} />
      </Routes>
    </AppShell>
  );
};

export default FacultyApp;
