// import React, { useState, useContext, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { Loader2 } from 'lucide-react';
// import { domain } from '@/lib/constant';
// import { useAuth } from '@/services/AuthContext';

// const ScheduleGenerator = () => {
//   const { user } = useAuth()
//   const navigate = useNavigate();
//   const { course_id, semester_id, syllabus_id } = useParams();
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [timeslots, setTimeslots] = useState([]);
//   const [departments, setDepartments] = useState([]);
  
//   const [formData, setFormData] = useState({
//     batch_year: '',
//     academic_year: new Date().getFullYear(),
//     semester: parseInt(semester_id),
//     course_id: parseInt(course_id),
//     department_id: user?.departments[0].department_id,
//     duration: 16, // Default semester duration in weeks
//     created_by: user?.user_id
//   });

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     try {
//       // Fetch available timeslots for the semester
//       const timeslotsResponse = await fetch(
//         `${domain}/api/v1/timeslots`,
        
//       );
      
//       const timeslotsData = await timeslotsResponse.json();
//       console.log(timeslotsData);
//       setTimeslots(timeslotsData.data);

//       // Fetch departments user has access to
//       const departmentsResponse = await fetch(`${domain}/api/v1/department/list-of-department`,{
//         headers: {
//           'X-Institution-Id': `${localStorage.getItem('institution_id')}`
//       }});
//       const departmentsData = await departmentsResponse.json();
//       console.log(departmentsData);
      
//       setDepartments(departmentsData.department);

//       // Set default department if user has only one
//       if (departmentsData.length === 1) {
//         setFormData(prev => ({
//           ...prev,
//           department_id: departmentsData[0].department_id
//         }));
//       }
//     } catch (err) {
//       setError('Error fetching initial data. Please try again.');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       // Calculate period length from timeslots
//       const periodLength = calculatePeriodLength(timeslots);

//       const response = await fetch(`${domain}/api/v1/schedule/generate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify({
//           ...formData,
//           created_by: user?.user_id,
//           period_length: periodLength
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to generate schedule');
//       }

//       setSuccess('Schedule generated successfully!');
//       // Optionally navigate to the generated schedule
//       navigate(`/schedule/${data.schedule.schedule_id}`);
//     } catch (err) {
//       setError(err.message || 'An error occurred while generating the schedule');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const calculatePeriodLength = (slots) => {
//     if (!slots || slots.length === 0) return 60; // Default to 60 minutes if no slots

//     // Calculate the average period length from all slots
//     const lengths = slots.map(slot => {
//       const start = new Date(`1970-01-01T${slot.start_time}`);
//       const end = new Date(`1970-01-01T${slot.end_time}`);
//       return (end - start) / 1000 / 60; // Convert to minutes
//     });

//     return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: ['batch_year', 'academic_year', 'department_id', 'duration'].includes(name) 
//         ? parseInt(value) 
//         : value
//     }));
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <div className="max-w-2xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6">Generate Course Schedule</h1>
        
//         {error && (
//           <Alert variant="destructive" className="mb-4">
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
        
//         {success && (
//           <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
//             <AlertTitle>Success</AlertTitle>
//             <AlertDescription>{success}</AlertDescription>
//           </Alert>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Course ID</label>
//               <input
//                 type="text"
//                 value={course_id}
//                 className="w-full p-2 border rounded bg-gray-100"
//                 disabled
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Semester</label>
//               <input
//                 type="text"
//                 value={semester_id}
//                 className="w-full p-2 border rounded bg-gray-100"
//                 disabled
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Department</label>
//               <select
//                 name="department_id"
//                 value={formData.department_id}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                 required
//               >
//                 <option value="">Select Department</option>
//                 {departments.map(dept => (
//                   <option key={dept.department_id} value={dept.department_id}>
//                     {dept.department_name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Duration (weeks)</label>
//               <input
//                 type="number"
//                 name="duration"
//                 value={formData.duration}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                 min={1}
//                 max={52}
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Batch Year</label>
//               <input
//                 type="number"
//                 name="batch_year"
//                 value={formData.batch_year}
//                 onChange={handleInputChange}
//                 placeholder="Enter batch year"
//                 className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                 min={2000}
//                 max={2100}
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Academic Year</label>
//               <input
//                 type="number"
//                 name="academic_year"
//                 value={formData.academic_year}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                 min={2000}
//                 max={2100}
//                 required
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading ? (
//               <span className="flex items-center justify-center">
//                 <Loader2 className="animate-spin mr-2" size={18} />
//                 Generating Schedule...
//               </span>
//             ) : (
//               'Generate Schedule'
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ScheduleGenerator;