import { useNavigate } from "react-router-dom";
import ResourceManagement from "../resource/ResourceManagement";

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    navigate(path);
  };
  return (
    <div>
      Dashboard of Coordinator
      <br />
      <button className="bg-blue-200" onClick={() => navigateTo("/p/faculty/create")}>
        Create Teacher
      </button>
     < ResourceManagement/>
    </div>
  );
};

export default CoordinatorDashboard;
