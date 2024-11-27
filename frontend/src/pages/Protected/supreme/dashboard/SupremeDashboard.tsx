import { useNavigate } from 'react-router-dom';
import PrincipalList from './Listofprincipal';

const SupremeDashboard = () => {
  const navigate = useNavigate();

  const handleroute = () => {
    navigate('/p/idgenerate');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 md:flex-row md:space-x-8 md:space-y-0 p-6">
      {/* Admin Dashboard Card */}
      <div className="flex flex-col items-center justify-center bg-white rounded-lg p-6 shadow-lg w-full max-w-xs md:max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 text-center mt-2">Manage Coordinator and generate their credentials here.</p>
        <button
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all duration-300 ease-in-out"
          onClick={handleroute}
        >
          Generate Coordinator
        </button>
      </div>

      {/* Principal List */}
      <div className="w-full md:w-2/3">
        <PrincipalList />
      </div>
    </div>
  );
};

export default SupremeDashboard;
