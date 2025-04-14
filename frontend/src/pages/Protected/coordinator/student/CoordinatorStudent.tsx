import  { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Pencil, 
  Trash, 
  ChevronLeft,
  ChevronRight,
  X 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { domain } from '@/lib/constant';
import { Student, Department } from '@/interface/general';
import { debounce } from 'lodash';
import { useAtom } from 'jotai';
import { institutionIdAtom } from '@/store/atom';

interface StudentResponse {
  success: boolean;
  data: Student[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const CoordinatorStudentAdvanced = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [batchYearFilter, setBatchYearFilter] = useState('');
  const [sortBy, ] = useState('created_at');
  const [sortOrder, ] = useState('desc');
  const [institution_id,] = useAtom(institutionIdAtom);

  // Predefined semester and batch year options
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const batchYears = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${domain}/api/v1/department/list-of-department`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Institution-Id': `${institution_id}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      
      const data = await response.json();
      console.log(data);
      
      setDepartments(data.department);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Fetch students
  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchTerm,
        department: departmentFilter,
        semester: semesterFilter,
        batchYear: batchYearFilter,
        sortBy,
        sortOrder
      });

      const response = await fetch(`${domain}/api/v1/student/list-of-student?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data: StudentResponse = await response.json();
      setStudents(data.data);
      setPagination({
        page: data.pagination.page,
        pageSize: data.pagination.pageSize,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search to reduce API calls
  const debouncedFetchStudents = useMemo(
    () => debounce(fetchStudents, 2000),
    [searchTerm, departmentFilter, semesterFilter, batchYearFilter, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchDepartments();
    fetchStudents();
  }, []);

  useEffect(() => {
    debouncedFetchStudents(1);
  }, [searchTerm, departmentFilter, semesterFilter, batchYearFilter, sortBy, sortOrder]);

  const deleteStudent = async (collegeUid: string | undefined) => {
    try {
      await fetch(`${domain}/api/v1/student/delete-student/${collegeUid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchStudents(pagination.page);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setSemesterFilter('');
    setBatchYearFilter('');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchStudents(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <Button onClick={() => navigate('/p/student/create')}>
          Create Student
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-5 gap-4">
        <Input
          placeholder="Search students...(College UID, First Or Last Name)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select 
          value={departmentFilter} 
          onValueChange={setDepartmentFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept:Department) => (
              <SelectItem key={dept.department_id} value={dept.department_name.toString()}>
                {dept.department_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={semesterFilter} 
          onValueChange={setSemesterFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map(sem => (
              <SelectItem key={sem} value={sem.toString()}>
                Semester {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={batchYearFilter} 
          onValueChange={setBatchYearFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Batch Year" />
          </SelectTrigger>
          <SelectContent>
            {batchYears.map(year => (
              <SelectItem key={year} value={year.toString()}>
                Batch {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchTerm || departmentFilter || semesterFilter || batchYearFilter) && (
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="flex items-center"
          >
            <X className="mr-2 h-4 w-4" /> Clear Filters
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Semester</TableHead>
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
                  <Badge variant="secondary">
                    {student.departments?.department_name || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    Semester {student.current_semester}
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
                    onClick={() => navigate(`/p/student/edit/${student.users?.user_id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteStudent(student.users?.college_uid)}
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {(pagination.page - 1) * pagination.pageSize + 1} - 
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} 
          {' '}of {pagination.total} students
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorStudentAdvanced;