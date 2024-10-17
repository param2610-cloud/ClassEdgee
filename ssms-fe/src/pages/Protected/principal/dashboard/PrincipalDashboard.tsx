import { useNavigate } from 'react-router-dom';

const PrincipalDashboard = () => {
  const navigate = useNavigate();

  const handleroute = () => {
    navigate('/p/idgenerate');
  };
  

  return (
    <div>
        <button onClick={handleroute}>Generate Coordinator</button>
    </div>
  );
};

export default PrincipalDashboard;
