import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import { roleNavigation } from "@/lib/navigation";
import CoordinatorDashboard from "@/pages/coordinator/Dashboard";
import StudentList from "@/pages/coordinator/students/StudentList";
import StudentCreate from "@/pages/coordinator/students/StudentCreate";
import StudentEdit from "@/pages/coordinator/students/StudentEdit";
import FacultyList from "@/pages/coordinator/faculty/FacultyList";
import CreateFaculty from "@/pages/coordinator/faculty/CreateFaculty";
import EditFaculty from "@/pages/coordinator/faculty/EditFaculty";
import DepartmentLayout from "@/pages/Protected/department/DepartmentLayout";
import DetailDepartment from "@/pages/Protected/department/[departmentid]/DetailDepartment";
import AddHod from "@/pages/Protected/department/[departmentid]/AddHod";
import CourseDashboard from "@/pages/Protected/coordinator/course/CourseDashboard";
import SpecificCourseDashboard from "@/pages/Protected/coordinator/course/SpecificCourseDashboard";
import SubjectManagement from "@/pages/Protected/coordinator/course/semester/SemesterSyllabusCreate";
import UnitTopicManagement from "@/pages/Protected/coordinator/course/semester/subject/SpecificSubjectManagement";
import TimetableManagement from "@/pages/coordinator/timetable/TimetableManagement";
import RoomManagement from "@/pages/coordinator/rooms/RoomManagement";
import BuildingManagement from "@/pages/coordinator/buildings/BuildingManagement";
import AttendanceDashboard from "@/pages/Protected/coordinator/Attendance/AttendanceDashboard";
import ResourceManagement from "@/pages/Protected/coordinator/resource/ResourceManagement";
import CreateEmergencyForm from "@/components/CreateEmergencyForm";

const CoordinatorApp = () => {
  return (
    <AppShell nav={roleNavigation.coordinator}>
      <Routes>
        <Route index element={<CoordinatorDashboard />} />

        <Route path="students" element={<StudentList />} />
        <Route path="students/new" element={<StudentCreate />} />
        <Route path="students/:id/edit" element={<StudentEdit />} />

        <Route path="faculty" element={<FacultyList />} />
        <Route path="faculty/new" element={<CreateFaculty />} />
        <Route path="faculty/:id/edit" element={<EditFaculty />} />

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

        <Route path="timetable" element={<TimetableManagement />} />
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
