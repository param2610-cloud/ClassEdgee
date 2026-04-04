import { Navigate, Route, Routes } from "react-router-dom";
import RoleGuard from "@/components/RoleGuard";
import PublicLayout from "@/layouts/PublicLayout";
import LandingPage from "@/pages/public/LandingPage";
import Login from "@/pages/public/Login";
import Registration from "@/pages/public/Registration";
import AdminApp from "@/pages/admin/AdminApp";
import CoordinatorApp from "@/pages/coordinator/CoordinatorApp";
import FacultyApp from "@/pages/faculty/FacultyApp";
import StudentApp from "@/pages/student/StudentApp";
import NotFound from "@/pages/NotFound";

const App = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Registration />} />
      </Route>

      <Route path="/auth/signin" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/signup" element={<Navigate to="/auth/register" replace />} />

      <Route element={<RoleGuard expectedRole="admin" />}>
        <Route path="/admin/*" element={<AdminApp />} />
      </Route>

      <Route element={<RoleGuard expectedRole="coordinator" />}>
        <Route path="/coordinator/*" element={<CoordinatorApp />} />
      </Route>

      <Route element={<RoleGuard expectedRole="faculty" />}>
        <Route path="/faculty/*" element={<FacultyApp />} />
      </Route>

      <Route element={<RoleGuard expectedRole="student" />}>
        <Route path="/student/*" element={<StudentApp />} />
      </Route>

      <Route path="/p/*" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
