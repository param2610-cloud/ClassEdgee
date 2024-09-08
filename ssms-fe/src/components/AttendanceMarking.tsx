import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  present: boolean;
}

const dummyStudents: Student[] = [
  { id: 'S001', name: 'Alice Johnson', present: false },
  { id: 'S002', name: 'Bob Smith', present: false },
  { id: 'S003', name: 'Charlie Brown', present: false },
  { id: 'S004', name: 'Diana Ross', present: false },
  { id: 'S005', name: 'Ethan Hunt', present: false },
];

const AttendanceMarking: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(dummyStudents);
  const { toast } = useToast()

  const handleAttendanceChange = (id: string) => {
    setStudents(students.map(student =>
      student.id === id ? { ...student, present: !student.present } : student
    ));
  };

  const handleSubmit = async () => {
    // Here you would typically send the data to your backend
    // For now, we'll just simulate an API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Attendance Marked",
      description: "Attendance has been successfully recorded.",
    })
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Present</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={student.present}
                    onCheckedChange={() => handleAttendanceChange(student.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit}>Submit Attendance</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceMarking;