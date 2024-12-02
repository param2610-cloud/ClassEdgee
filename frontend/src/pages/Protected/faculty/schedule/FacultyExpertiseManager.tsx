import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAtom } from 'jotai';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast'; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useParams } from 'react-router-dom';
import { domain } from '@/lib/constant';
import { Faculty, SubjectDetail } from '@/interface/general';
import { departmentIdAtom, institutionIdAtom } from '@/store/atom';

const FacultyExpertiseManager = () => {
  const {course_id,semester_id} = useParams()
  console.log(course_id,semester_id);
  
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [subjects, setSubjects] = useState<SubjectDetail[]>([]);
  const { toast } = useToast();

  const [instituteId, setInstituteId] = useAtom(institutionIdAtom);
  const [department_id, setdepartment_id] = useAtom(departmentIdAtom);

  // Fetch subjects and faculty data
  useEffect(() => {
    const fetchData = async () => {
      if (!department_id || !instituteId) {
        setdepartment_id(localStorage.getItem('department_id'));
        setInstituteId(localStorage.getItem('institution_id'));
        return;
      }

      if (!course_id || !semester_id) return;

      setLoading(true);
      try {
        const [subjectsRes, facultyRes] = await Promise.all([
          axios.get(`${domain}/api/v1/curriculum/subject/list-of-subjects-for-semester/${course_id}/${semester_id}`),
          axios.get(`${domain}/api/v1/department/list-of-faculty_of_department/${department_id}/${instituteId}`)
        ]);

        setSubjects(subjectsRes.data.data.subjects.subject_details);
        setFaculty(facultyRes.data.faculty);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data"
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [course_id, semester_id, department_id, instituteId]);

  const handleFacultyChange = (facultyId:string) => {
    const selected = faculty.find((f:Faculty) => f.faculty_id === parseInt(facultyId)) as Faculty;
    setSelectedFaculty(selected);
  };

  const isSubjectMapped = (subjectId: number) => {
    return selectedFaculty?.faculty_subject_mapping?.some(
      (mapping: any) => mapping.subject_id === subjectId
    );
  };

  const handleExpertiseToggle = async (subjectId: number) => {
    if (!selectedFaculty) return;

    setLoading(true);
    try {
      if (isSubjectMapped(subjectId)) {
        // Delete mapping
        await axios.delete(
          `${domain}/api/v1/faculty/${selectedFaculty.faculty_id}/${subjectId}/expertise`
        );
        toast({
          title: "Success",
          description: "Expertise removed successfully"
        });
      } else {
        // Add mapping
        await axios.patch(
          `${domain}/api/v1/faculty/${selectedFaculty.faculty_id}/${subjectId}/expertise`
        );
        toast({
          title: "Success",
          description: "Expertise added successfully"
        });
      }
      
      // Refresh faculty data
      const facultyRes = await axios.get(
        `${domain}/api/v1/department/list-of-faculty_of_department/${department_id}/${instituteId}`
      );
      setFaculty(facultyRes.data.faculty);
      setSelectedFaculty(
        facultyRes.data.faculty.find((f:Faculty) => f.faculty_id === selectedFaculty.faculty_id)
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update expertise"
      });
    }
    setLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Faculty Expertise Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Faculty Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Faculty</label>
            <Select 
              onValueChange={handleFacultyChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select faculty member" />
              </SelectTrigger>
              <SelectContent>
                {faculty.map((f) => (
                  <SelectItem 
                    key={f.faculty_id} 
                    value={f.faculty_id.toString()}
                  >
                    {f.users?.first_name} {f.users?.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Card>
              <CardHeader>
                Expertice
              </CardHeader>
              <CardContent className='flex gap-3'>
                {selectedFaculty && selectedFaculty.expertise.map((subject:string) => (
                  <div className='border p-2 rounded-md'>
                    {subject}
                  </div>
                ))}
                </CardContent>
            </Card>
          </div>

          {/* Subjects Table */}
          {selectedFaculty && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Subject Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject:SubjectDetail) => (
                  <TableRow key={subject.subject_id}>
                    <TableCell>{subject.subject_code}</TableCell>
                    <TableCell>{subject.subject_name}</TableCell>
                    <TableCell>{subject.subject_type}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={isSubjectMapped(subject.subject_id) ? "destructive" : "default"}
                        disabled={loading}
                        onClick={() => handleExpertiseToggle(subject.subject_id)}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isSubjectMapped(subject.subject_id) ? (
                          "Remove Expertise"
                        ) : (
                          "Add Expertise"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FacultyExpertiseManager;