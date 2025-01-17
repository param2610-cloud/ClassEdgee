import React, { useEffect, useState, useMemo } from 'react';
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
  X,
  GraduationCap
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { domain } from '@/lib/constant';
import { debounce } from 'lodash';
import { useAtom } from 'jotai';
import { institutionIdAtom } from '@/store/atom';

interface Faculty {
  faculty_id: number;
  designation: string;
  expertise: string[];
  qualifications: string[];
  joining_date: string;
  users?: {
    user_id: number;
    college_uid: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_picture?: string;
  };
  departments?: {
    department_name: string;
  };
}

interface FacultyResponse {
  success: boolean;
  data: Faculty[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const CoordinatorFaculty = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 8, // Smaller page size since faculty count is typically lower
    total: 0,
    totalPages: 0
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [sortBy, setSortBy] = useState('joining_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [institution_id,] = useAtom(institutionIdAtom)

  // Predefined designation options
  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Visiting Faculty'
  ];

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${domain}/api/v1/department/list-of-department`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-Institution-Id': `${institution_id}`
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch departments');
      
      const data = await response.json();
      setDepartments(data.department);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchFaculty = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        search: searchTerm,
        department: departmentFilter,
        designation: designationFilter,
        sortBy,
        sortOrder
      });

      const response = await fetch(`${domain}/api/v1/faculty/list-of-faculty?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch faculty');
      
      const data: FacultyResponse = await response.json();
      setFaculty(data.data);
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

  const debouncedFetchFaculty = useMemo(
    () => debounce(fetchFaculty, 1000),
    [searchTerm, departmentFilter, designationFilter, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchDepartments();
    fetchFaculty();
  }, []);

  useEffect(() => {
    debouncedFetchFaculty(1);
  }, [searchTerm, departmentFilter, designationFilter, sortBy, sortOrder]);

  const deleteFaculty = async (collegeUid: string | undefined) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    
    try {
      await fetch(`${domain}/api/v1/faculty/delete-faculty/${collegeUid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchFaculty(pagination.page);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setDesignationFilter('');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchFaculty(newPage);
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
    <div className="flex flex-col flex-1 overflow-hidden w-full" id='faculty'>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Faculty Management</h1>
        <Button onClick={() => navigate('/p/faculty/create')}>
          Add Faculty Member
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-4">
        <Input
          placeholder="Search by ID, Name, or Email"
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
            {departments.map((dept) => (
              <SelectItem key={dept.department_id} value={dept.department_name}>
                {dept.department_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={designationFilter} 
          onValueChange={setDesignationFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Designation" />
          </SelectTrigger>
          <SelectContent>
            {designations.map(designation => (
              <SelectItem key={designation} value={designation}>
                {designation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchTerm || departmentFilter || designationFilter) && (
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
              <TableHead>Faculty ID</TableHead>
              <TableHead>Name & Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Expertise & Qualifications</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculty.map((member) => (
              <TableRow key={member.faculty_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.users?.profile_picture} />
                      <AvatarFallback>
                        {member.users?.first_name[0]}{member.users?.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {member.users?.college_uid}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="p-2 whitespace-nowrap">{member.users?.first_name} {member.users?.last_name}</span>
                    <Badge variant="secondary" className="w-fit">
                      {member.designation}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                  <span className="p-2 whitespace-nowrap">
                    {member.departments?.department_name || 'N/A'}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Expertise</h4>
                        <div className="flex flex-wrap gap-1">
                          {member.expertise.map((exp, i) => (
                            <Badge key={i} variant="secondary">{exp}</Badge>
                          ))}
                        </div>
                        <h4 className="text-sm font-semibold">Qualifications</h4>
                        <div className="flex flex-wrap gap-1">
                          {member.qualifications.map((qual, i) => (
                            <Badge key={i} variant="outline">{qual}</Badge>
                          ))}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{member.users?.phone_number}</span>
                    <span className="text-gray-500">{member.users?.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/p/faculty/edit/${member.users?.user_id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFaculty(member.users?.college_uid)}
                  >
                    <Trash color="red" className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {faculty.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No faculty members found matching your search criteria.
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {(pagination.page - 1) * pagination.pageSize + 1} - 
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} 
          {' '}of {pagination.total} faculty members
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

export default CoordinatorFaculty;