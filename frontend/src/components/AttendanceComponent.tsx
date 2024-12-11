import React, { useState, useEffect } from 'react';
import { Video, Loader2, Upload, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { domain, fastapidomain } from '@/lib/constant';

interface AttendanceRecord {
  attendance_id: number;
  date: string;
  status: string;
  students: {
    users: {
      first_name: string;
      last_name: string;
      profile_picture?: string;
      college_uid: string;
    };
  };
}

interface VideoAttendanceUploadProps {
  sectionId: number;
  classId: number;
}

interface ProcessingResult {
  video_duration_seconds: number;
  students_marked_present: number;
}

const VideoAttendanceUpload: React.FC<VideoAttendanceUploadProps> = ({ sectionId, classId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [studentList, setStudentList] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchAttendanceStudentList();
  }, [classId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a valid video file");
      setSelectedFile(null);
    }
  };

  const fetchAttendanceStudentList = async () => {
    try {
      const response = await fetch(`${domain}/api/v1/attendance/history/${classId}`);
      const data = await response.json();
      setStudentList(data.history);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a video file first");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      const response = await fetch(
        `${fastapidomain}/api/face-recognition/process-video-attendance/${sectionId}/${classId}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process video');
      }

      const data = await response.json();
      setResult(data);
      await fetchAttendanceStudentList();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const getAttendanceStats = () => {
    const today = new Date().toISOString().split('T')[0];
    console.log(studentList);
    
    const todayAttendance = studentList.filter(record => 
      record.date?.startsWith(today)
    );
    
    const present = todayAttendance.filter(record => 
      record.status?.toLowerCase() === 'present'
    ).length;
    
    const total = todayAttendance.length;
    const percentage = total ? ((present / total) * 100).toFixed(1) : '0';

    return { present, total, percentage };
  };

  const stats = getAttendanceStats();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      
        

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Video Attendance Processing</CardTitle>
          <CardDescription>Upload a video to mark attendance using facial recognition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
            />
            
            <label 
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">MP4, MOV, or AVI (max. 100MB)</p>
              </div>
            </label>

            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-md">
                <Video className="w-4 h-4" />
                {selectedFile.name}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Process Attendance
                </>
              )}
            </Button>

            {loading && <Progress value={progress} className="w-full h-2" />}

            {result && (
              <Alert>
                <AlertTitle>Processing Complete</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>Video Duration: {Math.round(result.video_duration_seconds)}s</p>
                    <p>Students Marked Present: {result.students_marked_present}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {studentList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>View and manage student attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {studentList.map((record) => (
                <div 
                  key={record.attendance_id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-white"
                >
                  <div className="flex-shrink-0">
                    {record.students?.users?.profile_picture ? (
                      <img 
                        src={record.students.users.profile_picture}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-lg">
                          {record.students?.users?.first_name?.[0] || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {`${record.students?.users?.first_name || ''} ${record.students?.users?.last_name || ''}`}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {record.students?.users?.college_uid || 'N/A'}
                    </p>
                    <div className={`text-xs mt-1 inline-flex items-center px-2 py-0.5 rounded-full ${
                      record.status?.toLowerCase() === 'present' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoAttendanceUpload;