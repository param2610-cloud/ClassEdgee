
import {  useNavigate } from 'react-router-dom'

const SupremeDashboard = () => {
  const navigate = useNavigate()
  const handleroute = () => {
    navigate('/p/idgenerate')
  }
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <button
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        onClick={handleroute}
      >
        Generate principal
      </button>
    </div>
  )
}

export default SupremeDashboard
