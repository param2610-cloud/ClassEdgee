import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { domain } from '@/lib/constant';

const AttendanceHistory = ({ classId }:{classId:string}) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`${domain}/api/v1/attendance/history/${classId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        const data = await response.json();
        setAttendanceData(data.history);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [classId]);

  const getVerificationBadge = (method) => {
    const colors = {
      facial: "bg-green-100 text-green-800",
      manual: "bg-yellow-100 text-yellow-800",
      mobile: "bg-blue-100 text-blue-800",
      biometric: "bg-purple-100 text-purple-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
        {method}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-500 text-center">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Attendance History</CardTitle>
        <CardDescription>View all attendance records for this class</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((record) => (
                <TableRow key={`${record.attendance_id}-${record.date}`}>
                  <TableCell className="font-medium">
                    {record.students?.users?.first_name} {record.students?.users?.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {formatDate(record.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {formatTime(record.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={record.status === 'present' ? 'success' : 'destructive'}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getVerificationBadge(record.verification_method)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceHistory;