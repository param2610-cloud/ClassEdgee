import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider,useAuth } from './services/AuthContext';
import LandingPage from './pages/Open/LandingPage/LandingPage';
import LoginPage from './pages/Open/auth/Login';

// Import layouts
import SupremeLayout from './pages/Protected/supreme/SupremeLayout';
import StudentLayout from './pages/Protected/student/StudentLayout';

// Import pages
import Dashboard from './pages/Protected/Dashboard';
import Idgenerate from './pages/Protected/supreme/generator/Idgenerate';
import SupremeDashboard from './pages/Protected/supreme/dashboard/SupremeDashboard';
import CoordinatorLayout from './pages/Protected/coordinator/CoordinatorLayout';
import CreateTeacher from './pages/Protected/coordinator/teachers/create/CreateTeacher';
import CoordinatorDashboard from './pages/Protected/coordinator/dashaboard/CoordinatorDashboard';
import CreateStudent from './pages/Protected/coordinator/student/create/CreateStudent';
import CoordinatorStudent from './pages/Protected/coordinator/student/CoordinatorStudent';
import StudentEditProfile from './pages/Protected/coordinator/student/edit/Studentedit';
import TeacherEditProfile from './pages/Protected/coordinator/teachers/edit/Teacheredit';
import CoordinatorFaculty from './pages/Protected/coordinator/teachers/CoordinatorFaculty';
import CreateFacultyForm from './pages/Protected/coordinator/teachers/create/CreateTeacher';
import TeacherUploadLayout from './pages/Protected/coordinator/teachers/create/CreateTeacherLayout';
import AddDepartmentForm from './pages/Protected/department/create/DepartmentCreate';
import { Toaster } from './components/ui/toaster';
import DepartmentLayout from './pages/Protected/department/DepartmentLayout';
import DetailDepartment from './pages/Protected/department/[departmentid]/DetailDepartment';
import StudentUploadLayout from './pages/Protected/coordinator/student/create/StudentCreateLayout';

const App: React.FC = () => {
  return (
    // <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/signin" element={<LoginPage />} />
        <Route path="/p/*" element={<ProtectedRoute />} />
      </Routes>
      <Toaster/>
    </Router>
  );
}
{/* </AuthProvider> */}

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute - User:", user);
    console.log("ProtectedRoute - IsLoading:", isLoading);
    if (user && user.role) {
      console.log("ProtectedRoute - User role:", user.role);
    }
  }, [user, isLoading]);

  if (isLoading) {
    console.log("ProtectedRoute - Still loading...");
    return <div>Loading...</div>;
  }

  if (!user || !user.role) {
    console.log("ProtectedRoute - No user or no role, redirecting to signin");
    return <Navigate to="/auth/signin" replace />;
  }

  console.log("ProtectedRoute - Rendering routes for role:", user.role);

  switch (user.role) {
    case 'admin':
      return <SupremeRoutes />;
    case 'faculty':
      return <FacultyRoutes />;
    case 'student':
      return <StudentRoutes />;
    case 'coordinator':
      return <CoordinatorRoutes />;
    default:
      console.log("ProtectedRoute - Invalid role:", user.role);
      return <Navigate to="/auth/signin" replace />;
  }
}

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
  <CoordinatorLayout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  </CoordinatorLayout>
);

const StudentRoutes: React.FC = () => (
  <StudentLayout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* Add student-specific routes here */}
    </Routes>
  </StudentLayout>
);
const CoordinatorRoutes: React.FC = () => (
  <CoordinatorLayout>
    <Routes>
      <Route path="/" element={<CoordinatorDashboard />} />
      <Route path="/student" element={<CoordinatorStudent />} />
      <Route path="/student/create" element={<StudentUploadLayout />} />
      {/* <Route path="/student/edit/:id" element={<StudentEditProfile />} /> */}
      <Route path="/faculty" element={<CoordinatorFaculty />} />
      <Route path="/faculty/create" element={<TeacherUploadLayout />} />
      {/* <Route path="/faculty/edit/:id" element={<TeacherEditProfile />} /> */}
      <Route path="/department" element={<DepartmentLayout />} />
      <Route path="/department/:id" element={<DetailDepartment />} />
      <Route path="/department/create" element={<AddDepartmentForm />} />

    </Routes>
  </CoordinatorLayout>
);

export default App;