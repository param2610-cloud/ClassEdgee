import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail, Phone, MapPin, AlertCircle, Pencil, Loader2, Delete, DeleteIcon, Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { domain } from '@/lib/constant';
import { IStudent } from '@/lib/Interface/student';
import { Student } from '@/interface/general';

const CoordinatorStudent = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${domain}/api/v1/student/list-of-student`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token authentication
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      setStudents(data.data);
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  

  // Format date to readable string
  const formatDate = (dateString:string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
        <Button onClick={fetchStudents} variant="outline" className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">List of Students</h1>
        <Button onClick={() => navigate('/p/student/create')}>
          Create Student
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Grade & Section</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.users?.college_uid}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.users?.profile_picture} />
                      <AvatarFallback>
                        {student.users?.first_name[0]}{student.users?.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {student.users?.college_uid}
                  </div>
                </TableCell>
                <TableCell>
                  {student.users?.first_name} {student.users?.last_name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="mr-2">
                    Grade {student.current_semester}
                  </Badge>
                  <Badge variant="outline">
                    Section {student.sections?.section_name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{student.users?.phone_number}</span>
                    <span className="text-gray-500">{student.users?.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/p/student/edit/${student.users?.college_uid}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      try {
                        const response = fetch(`${domain}/api/v1/student/delete-student/${student.users?.college_uid}`, {
                          method: 'DELETE',
                        })
                        console.log(response);
                        fetchStudents()
                        
                      } catch (error) {
                        console.log(error)
                      }
                    }}
                  >
                    <Trash color='red' className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {students.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No students found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default CoordinatorStudent;