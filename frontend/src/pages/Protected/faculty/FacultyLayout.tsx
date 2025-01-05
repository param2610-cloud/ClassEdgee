import AlertFire from "@/components/AlertFire";
import { useEmergencyAlert } from "@/hooks/useEmergencyAlert";

const FacultyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasActiveEmergency } = useEmergencyAlert();

  return (
    <div className="relative">
      {hasActiveEmergency ? (
        <AlertFire />
      ) : (
        <>
          {/* Your existing layout content */}
          {children}
        </>
      )}
    </div>
  );
};
export default FacultyLayout