import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import LandingPage from './pages/Open/LandingPage/LandingPage';
import LoginPage from './pages/Open/auth/Login';

// Import layouts
import SupremeLayout from './pages/Protected/supreme/SupremeLayout';
import StaffLayout from './pages/Protected/staff/StaffLayout';
import PrincipalLayout from './pages/Protected/principal/PrincipalLayout';
import FacultyLayout from './pages/Protected/faculty/FacultyLayout';
import StudentLayout from './pages/Protected/student/StudentLayout';

// Import pages
import Dashboard from './pages/Protected/Dashboard';
import Idgenerate from './pages/Protected/supreme/generator/Idgenerate';
import SupremeDashboard from './pages/Protected/supreme/dashboard/SupremeDashboard';
import PrincipalDashboard from './pages/Protected/principal/dashboard/PrincipalDashboard';
import CreateCoordinatorForm from './pages/Protected/principal/createCoordinator/CreateCoordinator';
import CoordinatorLayout from './pages/Protected/coordinator/CoordinatorLayout';
import CoordinatorDashboard from './pages/Protected/coordinator/dashaboard/CoordinatorDashboard';
import CreateStudent from './pages/Protected/coordinator/student/create/CreateStudent';
import CoordinatorStudent from './pages/Protected/coordinator/student/CoordinatorStudent';
import StudentEditProfile from './pages/Protected/coordinator/student/edit/Studentedit';

const App: React.FC = () => {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/signin" element={<LoginPage />} />
        <Route path="/p/*" element={<ProtectedRoute />} />
        {/* Add other public routes here */}
      </Routes>
    </Router>
    </AuthProvider>
  );
}

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
    case 'supreme':
      return <SupremeRoutes />;
    case 'staff':
      return <StaffRoutes />;
    case 'principal':
      return <PrincipalRoutes />;
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

const StaffRoutes: React.FC = () => (
  <StaffLayout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* Add staff-specific routes here */}
    </Routes>
  </StaffLayout>
);

const PrincipalRoutes: React.FC = () => (
  <PrincipalLayout>
    <Routes>
      <Route path="/" element={<PrincipalDashboard />} />
      <Route path="/idgenerate" element={<CreateCoordinatorForm />} />
      {/* Add principal-specific routes here */}
    </Routes>
  </PrincipalLayout>
);

const FacultyRoutes: React.FC = () => (
  <FacultyLayout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* Add faculty-specific routes here */}
    </Routes>
  </FacultyLayout>
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
      <Route path="/student/create" element={<CreateStudent />} />
      <Route path="/student/edit/:id" element={<StudentEditProfile />} />
    </Routes>
  </CoordinatorLayout>
);

export default App;