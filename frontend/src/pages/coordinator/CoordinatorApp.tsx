import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import { roleNavigation } from "@/lib/navigation";
import CoordinatorDashboard from "@/pages/Protected/coordinator/dashaboard/CoordinatorDashboard";
import CoordinatorStudent from "@/pages/Protected/coordinator/student/CoordinatorStudent";
import StudentUploadLayout from "@/pages/Protected/coordinator/student/create/StudentCreateLayout";
import EditStudentForm from "@/pages/Protected/coordinator/student/edit/Studentedit";
import CoordinatorFaculty from "@/pages/Protected/coordinator/teachers/CoordinatorFaculty";
import TeacherUploadLayout from "@/pages/Protected/coordinator/teachers/create/CreateTeacherLayout";
import FacultyEditProfile from "@/pages/Protected/coordinator/teachers/edit/Teacheredit";
import DepartmentLayout from "@/pages/Protected/department/DepartmentLayout";
import DetailDepartment from "@/pages/Protected/department/[departmentid]/DetailDepartment";
import AddHod from "@/pages/Protected/department/[departmentid]/AddHod";
import CourseDashboard from "@/pages/Protected/coordinator/course/CourseDashboard";
import SpecificCourseDashboard from "@/pages/Protected/coordinator/course/SpecificCourseDashboard";
import SubjectManagement from "@/pages/Protected/coordinator/course/semester/SemesterSyllabusCreate";
import UnitTopicManagement from "@/pages/Protected/coordinator/course/semester/subject/SpecificSubjectManagement";
import ScheduleDashboard from "@/pages/Protected/faculty/schedule/ScheduleDashboard";
import RoomManagement from "@/pages/Protected/coordinator/rooms/RoomManagement";
import BuildingManagement from "@/pages/Protected/coordinator/buildings/BuildingManagement";
import AttendanceDashboard from "@/pages/Protected/coordinator/Attendance/AttendanceDashboard";
import ResourceManagement from "@/pages/Protected/coordinator/resource/ResourceManagement";
import CreateEmergencyForm from "@/components/CreateEmergencyForm";

const CoordinatorApp = () => {
  return (
    <AppShell nav={roleNavigation.coordinator}>
      <Routes>
        <Route index element={<CoordinatorDashboard />} />

        <Route path="students" element={<CoordinatorStudent />} />
        <Route path="students/new" element={<StudentUploadLayout />} />
        <Route path="students/:id/edit" element={<EditStudentForm />} />

        <Route path="faculty" element={<CoordinatorFaculty />} />
        <Route path="faculty/new" element={<TeacherUploadLayout />} />
        <Route path="faculty/:id/edit" element={<FacultyEditProfile />} />

        <Route path="departments" element={<DepartmentLayout />} />
        <Route path="departments/:id" element={<DetailDepartment />} />
        <Route path="departments/:id/add-hod" element={<AddHod />} />

        <Route path="courses" element={<CourseDashboard />} />
        <Route path="courses/:id" element={<SpecificCourseDashboard />} />
        <Route
          path="courses/:course_id/semester/:semester_id/:syllabus_id"
          element={<SubjectManagement />}
        />
        <Route
          path="courses/:course_id/semester/:semester_id/syllabus/:syllabus_id/subject/:subject_id"
          element={<UnitTopicManagement />}
        />

        <Route path="timetable" element={<ScheduleDashboard />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="buildings" element={<BuildingManagement />} />
        <Route path="attendance" element={<AttendanceDashboard />} />
        <Route path="resources" element={<ResourceManagement />} />
        <Route path="emergency" element={<CreateEmergencyForm />} />

        <Route path="*" element={<Navigate to="/coordinator" replace />} />
      </Routes>
    </AppShell>
  );
};

export default CoordinatorApp;
