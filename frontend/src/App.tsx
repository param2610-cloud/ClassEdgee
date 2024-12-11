import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import { useAuth } from "./services/AuthContext";
import LandingPage from "./pages/Open/LandingPage/LandingPage";
import LoginPage from "./pages/Open/auth/Login";
import Registration from "./pages/Open/auth/Registration";

// Import layouts
import SupremeLayout from "./pages/Protected/supreme/SupremeLayout";
import StudentLayout from "./pages/Protected/student/StudentLayout";

// Import pages
import Dashboard from "./pages/Protected/student/Dashboard";
import Idgenerate from "./pages/Protected/supreme/generator/Idgenerate";
import SupremeDashboard from "./pages/Protected/supreme/dashboard/SupremeDashboard";
import CoordinatorLayout from "./pages/Protected/coordinator/CoordinatorLayout";
import CoordinatorDashboard from "./pages/Protected/coordinator/dashaboard/CoordinatorDashboard";
import CoordinatorStudent from "./pages/Protected/coordinator/student/CoordinatorStudent";
import Createroom from "./pages/Protected/coordinator/rooms/Createroom";
import CoordinatorFaculty from "./pages/Protected/coordinator/teachers/CoordinatorFaculty";
import TeacherUploadLayout from "./pages/Protected/coordinator/teachers/create/CreateTeacherLayout";
import AddDepartmentForm from "./pages/Protected/department/create/DepartmentCreate";
import { Toaster } from "./components/ui/toaster";
import DepartmentLayout from "./pages/Protected/department/DepartmentLayout";
import DetailDepartment from "./pages/Protected/department/[departmentid]/DetailDepartment";
import StudentUploadLayout from "./pages/Protected/coordinator/student/create/StudentCreateLayout";
import EditStudentForm from "./pages/Protected/coordinator/student/edit/Studentedit";
import FacultyEditProfile from "./pages/Protected/coordinator/teachers/edit/Teacheredit";
import CourseDashboard from "./pages/Protected/coordinator/course/CourseDashboard";
import SpecificCourseDashboard from "./pages/Protected/coordinator/course/SpecificCourseDashboard";
import SubjectManagement from "./pages/Protected/coordinator/course/semester/SemesterSyllabusCreate";
import UnitTopicManagement from "./pages/Protected/coordinator/course/semester/subject/SpecificSubjectManagement";
import TimeslotManagement from "./pages/Protected/coordinator/classes/TimeSlotTable";
import FacultyLMSDashboard from "./pages/Protected/faculty/FacultyDashboard";
import FacultyLayout from "./pages/Protected/faculty/FacultyLayout";
import VirtualRoom from "./pages/Protected/faculty/classes/ClassDashboard";
import AddBatchSyllabus from "./pages/Protected/coordinator/course/AddBatchSyllabus";
import AddHod from "./pages/Protected/department/[departmentid]/AddHod";
import Profilepage from "./pages/Protected/faculty/profile/Profilepage";
import DepartmentDetails from "./pages/Protected/department/[departmentid]/DetailDepartment";
import CourseDashboardForFaculty from "./pages/Protected/faculty/Course/CourseDashboardForFaculty";
import SectionDashboard from "./pages/Protected/faculty/section/SectionDashboard";
import SubjectAssignment from "./pages/Protected/faculty/schedule/SubjectAssignment";
import ScheduleViewer from "./pages/Protected/faculty/schedule/ScheduleViewer";
import Load from "./LoadSpinners/Load";
import ScheduleDashboard from "./pages/Protected/faculty/schedule/ScheduleDashboard";
import ClassDashboard from "./pages/Protected/faculty/classes/ClassDashboard";
import QuizComponent from "./pages/Protected/student/quiz/QuizComponent";
import ClassDashboardStudent from "./pages/Protected/student/classes/ClassDashboardStudent";
import StudentProfile from "./pages/Protected/student/profile/ProfilePage";
import QuizManagement from "./pages/Protected/faculty/classes/quizzes/QuizDashboard";
// import SechduleForSemester from "./pages/Protected/faculty/sechdule/SechduleForSemester";
// import ScheduleManager from "./pages/Protected/faculty/sechdule/ScheduleManagement";
// import ScheduleDetailView from "./pages/Protected/faculty/sechdule/ScheduleDetailsView";

const App: React.FC = () => {
    return (
        // <AuthProvider>
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/signin" element={<LoginPage />} />
                <Route path="/auth/signup" element={<Registration />} />
                <Route path="/p/*" element={<ProtectedRoute />} />
            </Routes>
            <Toaster />
        </Router>
    );
};
{
    /* </AuthProvider> */
}

const ProtectedRoute: React.FC = () => {
    const { user, isLoading } = useAuth();

    useEffect(() => {
        console.log("ProtectedRoute - User:", user);
        console.log("ProtectedRoute - IsLoading:", isLoading);
        if (user && user.role) {
            console.log("ProtectedRoute - User role:", user.role);
        }
        console.log("horin:",user);
    }, [user, isLoading]);

    if (isLoading) {
        console.log("ProtectedRoute - Still loading...");
        return <div><Load /></div>;
    }
    
    if (!user && !user?.role && isLoading === false) {
        console.log(
            "ProtectedRoute - No user or no role, redirecting to signin"
        );
        return <Navigate to="/auth/signin" replace />;
    }

    console.log("ProtectedRoute - Rendering routes for role:", user.role);

    switch (user.role) {
        case "admin":
            return <SupremeRoutes />;
        case "faculty":
            return <FacultyRoutes />;
        case "student":
            return <StudentRoutes />;
        case "coordinator":
            return <CoordinatorRoutes />;
        default:
            console.log("ProtectedRoute - Invalid role:", user.role);
            return <Navigate to="/auth/signin" replace />;
    }
};

const SupremeRoutes: React.FC = () => (
    <SupremeLayout>
        <Routes>
            <Route path="/" element={<SupremeDashboard />} />
            <Route path="/idgenerate" element={<Idgenerate />} />
            {/* Add other supreme routes here */}
        </Routes>
    </SupremeLayout>
);

const FacultyRoutes: React.FC = () => (
    <FacultyLayout>
        <Routes>
            <Route path="/" element={<FacultyLMSDashboard />} />
            <Route path="/interactive-classroom" element={<VirtualRoom />} />
            <Route path="/profile-page" element={<Profilepage />} />
            <Route path="/department" element={<DepartmentDetails />} />
            <Route path="/department/:department_id/section/:section_id" element={<SectionDashboard />} />
            <Route path="/department-syllabus" element={<CourseDashboardForFaculty />} />
            <Route path="/course/:id" element={<SpecificCourseDashboard />} />
            <Route
                path="/course/:course_id/semester/:semester_id/:syllabus_id"
                element={<SubjectManagement />}
            />
            <Route
                path="department/:department_id/add-syllabus/:course_id"
                element={<AddBatchSyllabus />}
            />                                                       
            <Route
                path="/course/:course_id/semester/:semester_id/syllabus/:syllabus_id/subject/:subject_id"
                element={<UnitTopicManagement />}
            />
            <Route
                path="/schedule/course/:course_id/semester/:semester_id/:syllabus_id/subject-assignment"
                element={<SubjectAssignment    />}
            />
            <Route
                path="/schedule"
                element={<ScheduleDashboard    />}
            />
            <Route
                path="/schedule/:section_id"
                element={<ScheduleViewer    />}
            />
            <Route
                path="/classes/:class_id"
                element={<ClassDashboard    />}
            />
            <Route
                path="/classes/:class_id/quiz"
                element={<QuizManagement    />} 
                />
            {/* <Route
                path="/classes-list"
                element={<List_of_Class    />} 
                /> */}

        </Routes>
    </FacultyLayout>
);

const StudentRoutes: React.FC = () => (
    <StudentLayout>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile-page" element={<StudentProfile />} />
            <Route
                path="/classes/:class_id"
                element={<ClassDashboardStudent    />}
            />
        </Routes>
    </StudentLayout>
);
const CoordinatorRoutes: React.FC = () => (
    <CoordinatorLayout>
        <Routes>
            <Route path="/" element={<CoordinatorDashboard />} />
            <Route path="/student" element={<CoordinatorStudent />} />
            <Route path="/student/create" element={<StudentUploadLayout />} />
            <Route
                path="/student/edit/:user_id"
                element={<EditStudentForm />}
            />
            <Route path="/faculty" element={<CoordinatorFaculty />} />
            <Route path="/faculty/create" element={<TeacherUploadLayout />} />
            <Route path="/faculty/edit/:id" element={<FacultyEditProfile />} />
            <Route path="/department" element={<DepartmentLayout />} />
            <Route path="/department/:id" element={<DetailDepartment />} />
            <Route path="/department/create" element={<AddDepartmentForm />} />
            <Route path="/roomCreation" element={<Createroom />} />
            <Route path="/course" element={<CourseDashboard />} />
            <Route path="/course/:id" element={<SpecificCourseDashboard />} />
            <Route
                path="/course/:course_id/semester/:semester_id/:syllabus_id"
                element={<SubjectManagement />}
            />
            <Route
                path="department/:department_id/add-syllabus/:course_id"
                element={<AddBatchSyllabus />}
            />
            <Route
                path="/course/:course_id/semester/:semester_id/syllabus/:syllabus_id/subject/:subject_id"
                element={<UnitTopicManagement />}
            />
            <Route path="/classes" element={<TimeslotManagement/>} />
            <Route path="department/:department_id/add-hod" element={<AddHod/>} />
        </Routes>
    </CoordinatorLayout>
);

export default App;
