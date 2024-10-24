import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import CreateStudentForm from "./CreateStudent"; // Import your form component

 function Dashboard() {
  return (
    <Router>
    <div>
    <header className= "bg-blue-500 p-4 shadow-lg">
      <h1  className="text-white text-2xl font-bold">Co-Ordinator Dashboard</h1>
     
      </header>
    <Router>
     
      <Route path="/create" element={<CreateStudentForm />} />
    </Router>
  </div>
</Router>
  );
 }


 export default Dashboard;























