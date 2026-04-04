import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import { roleNavigation } from "@/lib/navigation";
import SupremeDashboard from "@/pages/Protected/supreme/dashboard/SupremeDashboard";
import ListOfCoordinator from "@/pages/Protected/supreme/dashboard/Listofcoordinator";
import CreateCoordinator from "@/pages/Protected/principal/createCoordinator/CreateCoordinator";
import Idgenerate from "@/pages/Protected/supreme/generator/Idgenerate";
import CreateEmergencyForm from "@/components/CreateEmergencyForm";

const AdminApp = () => {
  return (
    <AppShell nav={roleNavigation.admin}>
      <Routes>
        <Route index element={<SupremeDashboard />} />
        <Route path="coordinators" element={<ListOfCoordinator />} />
        <Route path="coordinators/new" element={<CreateCoordinator />} />
        <Route path="id-generate" element={<Idgenerate />} />
        <Route path="emergency" element={<CreateEmergencyForm />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AppShell>
  );
};

export default AdminApp;
