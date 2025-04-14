import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Mail, AlertTriangle, Check, RefreshCw, Filter } from 'lucide-react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert"
import { domain } from '@/lib/constant';

// Define proper types for the student data
interface Student {
  studentId: number;
  name: string;
  email: string;
  enrollmentNumber: string;
  department: string;
  semester: number;
  attendancePercentage: string;
  totalClasses: number;
  attendedClasses: number;
}

// Define type for filters
interface AttendanceFilters {
  semester: string;
  department_id: string;
  threshold: number;
}

const AttendanceDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState<AttendanceFilters>({
    semester: '',
    department_id: '',
    threshold: 75
  });
  const [sending, setSending] = useState(false);

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Convert all values to strings for URLSearchParams
      const queryParams = new URLSearchParams({
        ...(filters.semester && { semester: filters.semester }),
        ...(filters.department_id && { department_id: filters.department_id }),
        threshold: filters.threshold.toString()
      });
      
      const response = await fetch(`${domain}/api/v1/attendance/low-attendance-report?${queryParams}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch data');
      
      setStudents(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Send emails to students with low attendance
  const sendEmails = async () => {
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`${domain}/api/v1/attendance/send-attendance-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filters,
          studentIds: students.map(student => student.studentId)
        })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to send emails');
      
      setSuccessMessage(`Successfully sent emails to ${data.affectedStudents.length} students`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [filters]);

  // Prepare data for the chart
  const chartData = students.map(student => ({
    name: student.enrollmentNumber,
    attendance: parseFloat(student.attendancePercentage),
    required: 75
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Attendance Dashboard</h1>
        <p className="text-gray-600">Monitor and manage student attendance</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Semester</label>
          <select
            className="w-full border rounded p-2"
            value={filters.semester}
            onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem.toString()}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Attendance Threshold (%)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={filters.threshold}
            onChange={(e) => setFilters(prev => ({ ...prev, threshold: Number(e.target.value) }))}
            min="0"
            max="100"
          />
        </div>

        <div className="md:col-span-2 flex items-end gap-2">
          <button
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={fetchAttendanceData}
            disabled={loading}
          >
            <Filter size={16} />
            Apply Filters
          </button>
          
          <button
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={sendEmails}
            disabled={sending || loading || students.length === 0}
          >
            <Mail size={16} />
            {sending ? 'Sending...' : 'Send Notifications'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-500">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Data Display */}
      {!loading && students.length > 0 && (
        <>
          {/* Attendance Chart */}
          <div className="mb-6 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Attendance Overview</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#3B82F6" name="Current Attendance %" />
                  <Bar dataKey="required" fill="#EF4444" name="Required Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.studentId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.enrollmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parseFloat(student.attendancePercentage) < 75
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {student.attendancePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* No Data State */}
      {!loading && students.length === 0 && (
        <div className="text-center py-12 bg-white rounded shadow">
          <p className="text-gray-500">No students found with attendance below threshold.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;