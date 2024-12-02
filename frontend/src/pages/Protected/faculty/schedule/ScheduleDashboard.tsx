import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/AuthContext';
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
import { domain } from '@/lib/constant';
import { Course, SyllabusStructure } from '@/interface/general';

const CourseSelector = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [syllabusOptions, setSyllabusOptions] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState('');

  // Array of semesters from 1 to 8
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${domain}/api/v1/curriculum/course?department_id=${user?.departments[0].department_id}&is_active=true`
        );
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    if (user?.departments[0].department_id) {
      fetchCourses();
    }
  }, [user?.departments[0].department_id]);

  useEffect(() => {
    const fetchSyllabus = async () => {
      if (!selectedCourse || !selectedSemester) return;

      try {
        const response = await fetch(
          `${domain}/api/v1/curriculum/syllabus/${selectedCourse}/${selectedSemester}`
        );
        if (!response.ok) throw new Error('Failed to fetch syllabus');
        const data = await response.json();
        setSyllabusOptions(data);
      } catch (error) {
        console.error('Error fetching syllabus:', error);
      }
    };

    if (selectedCourse && selectedSemester) {
      fetchSyllabus();
    }
  }, [selectedCourse, selectedSemester]);

  const handleSyllabusSelect = (syllabusId:string) => {
    setSelectedSyllabus(syllabusId);
    navigate(`/p/schedule/course/${selectedCourse}/semester/${selectedSemester}/${syllabusId}/subject-assignment`);
  };

  return (
    <Card className="w-full max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Course Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Course</label>
          <Select
            value={selectedCourse}
            onValueChange={setSelectedCourse}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course:Course) => (
                <SelectItem key={course.course_id} value={course.course_id.toString()}>
                  {course.course_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Semester</label>
          <Select
            value={selectedSemester}
            onValueChange={setSelectedSemester}
            disabled={!selectedCourse}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester.toString()}>
                  Semester {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Syllabus</label>
          <Select
            value={selectedSyllabus}
            onValueChange={handleSyllabusSelect}
            disabled={!selectedSemester || syllabusOptions.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select syllabus" />
            </SelectTrigger>
            <SelectContent>
              {syllabusOptions.map((syllabus:SyllabusStructure) => (
                <SelectItem 
                  key={syllabus.syllabus_id} 
                  value={syllabus.syllabus_id.toString()}
                >
                  Syllabus ID: {syllabus.syllabus_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseSelector;