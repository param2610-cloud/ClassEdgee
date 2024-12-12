import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { domain } from "@/lib/constant";
import { useAuth } from "@/services/AuthContext";
import { BookOpen, School, Users } from "lucide-react";
import { useEffect, useState } from "react";

const FacultyAttendanceDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facultyId, setFacultyId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${domain}/api/v1/faculty/get-faculty/${user?.user_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch faculty data");
        }
        const data = await response.json();
        if (data?.faculty_id) {
          setFacultyId(data.faculty_id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchFaculty();
    }
  }, [user?.user_id]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${domain}/api/v1/faculty/get-faculty-classes/${facultyId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }
        const data = await response.json();
        setClasses(data.classes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (facultyId) {
      fetchClasses();
    }
  }, [facultyId]);

  const handleClassSelect = async (classId) => {
    try {
      setLoading(true);
      const response = await fetch(`${domain}/api/v1/attendance/history/${classId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }
      const data = await response.json();
      setAttendanceData(data);
      setSelectedClass(classId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !classes.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!classes.length) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>No past classes found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Past Classes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {classes.map((cls) => (
          <Card
            key={cls.id}
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              selectedClass === cls.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => handleClassSelect(cls.id)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{cls.courseCode}</span>
                <span className="text-sm text-gray-500">
                  {new Date(cls.dateOfClass).toLocaleDateString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{cls.courseName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Section: {cls.section}</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4" />
                  <span>Room: {cls.room}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Attendance Statistics */}
      {loading ? (
        <div className="text-center py-8">Loading attendance data...</div>
      ) : (
        attendanceData && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Attendance Statistics</h3>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {attendanceData.stats.averageAttendance.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {attendanceData.stats.totalStudents}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {attendanceData.stats.totalClasses}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student List */}
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Student</th>
                        <th className="text-center p-2">Present</th>
                        <th className="text-center p-2">Absent</th>
                        <th className="text-center p-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.history.map((student) => (
                        <tr key={student.student.id} className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {student.student.profile_picture && (
                                <img
                                  src={student.student.profile_picture}
                                  alt={student.student.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <div>
                                <div>{student.student.name}</div>
                                <div className="text-sm text-gray-500">
                                  {student.student.college_uid}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center p-2">
                            {student.attendance.present}
                          </td>
                          <td className="text-center p-2">
                            {student.attendance.absent}
                          </td>
                          <td className="text-center p-2">
                            <span
                              className={`px-2 py-1 rounded ${
                                parseFloat(student.attendance.percentage) >= 75
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {student.attendance.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </div>
  );
};

export default FacultyAttendanceDashboard;
