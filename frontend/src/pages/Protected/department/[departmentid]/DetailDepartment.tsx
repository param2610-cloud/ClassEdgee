import  { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  Phone,
  Mail
} from 'lucide-react';
import { Department, User } from '@/interface/general';
import { domain } from '@/lib/constant';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAtom } from 'jotai';
import { institutionIdAtom } from '@/store/atom';
import { useAuth } from '@/services/AuthContext';

const DepartmentDetails = () => {
  const navigate = useNavigate()
  const {user} = useAuth()
  const {id} = useParams()
  const [department, setDepartment] = useState<Department|null>(null);
  const [profileData,setProfileData] = useState<User|null>(null)
  const [loading, setLoading] = useState(true);
  const [institution_id,setInstitutionId] = useAtom(institutionIdAtom)
  console.log(institution_id);
  useEffect(()=>{
    if(!institution_id){
      console.log('no institution id',institution_id);
      
      setInstitutionId(localStorage.getItem('institution_id') as string)
      console.log('after institution id',institution_id);
    }
    if(!profileData && !id){
      fetchProfile()
    }else{
      fetchDepartmentDetails()
    } 
    if(!profileData && id){
      fetchDepartmentDetailsByID()
    }
  },[institution_id,user,profileData,id])
  const fetchProfile = async () => {
    const response = await axios.get(`${domain}/api/v1/faculty/get-faculty/${user?.user_id}`);
  const { data } = response.data; 
  setProfileData(data);
  }
  const {toast} = useToast()
  const [newSection, setNewSection] = useState({
    section_name: '',
    batch_year: new Date().getFullYear(),
    max_capacity: 60,
    semester: 1,
    student_count: 0,
    academic_year: new Date().getFullYear(),
    department_id:department?.department_id,
    institution_id:institution_id
  });


  const fetchDepartmentDetails = async () => {
    try {
      console.log(profileData);
      
      const response = await axios.get(`${domain}/api/v1/department/${profileData?.departments[0].department_id}/${institution_id}`,);
      const data = await response.data.department;
      setDepartment(data);
      console.log(data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching department details:', error);
      setLoading(false);
    }
  };
  const fetchDepartmentDetailsByID = async () => {
    try {
      console.log(profileData);
      
      const response = await axios.get(`${domain}/api/v1/department/${id}/${institution_id}`,);
      const data = await response.data.department;
      setDepartment(data);
      console.log(data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching department details:', error);
      setLoading(false);
    }
  };

  const handleCreateSection = async () => {
    // Implementation for creating new section
    try {
      const response = await axios.post(`${domain}/api/v1/section/add-section`, newSection);
      if(response.status === 200){
        fetchDepartmentDetails();
        toast({
          title: 'Success',
          description: 'Section created successfully',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error creating section',
      })
    }
    console.log('Creating new section:', newSection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className='flex w-full justify-between'>
      <div>
      {/* Department Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {department?.department_name}
        </h1>
        <p className="text-gray-500 text-lg">
          Department Code: {department?.department_code}
        </p>
      </div>
      </div>
      <div>
        <Button onClick={()=>navigate(`/p/department/${department?.department_id}/add-hod`)}>
          {department?.hod_user_id ? 'Edit HOD' : 'Add HOD'}
        </Button>
      </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Total Faculty</p>
              <p className="text-2xl font-bold">{department?.faculty?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <GraduationCap className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold">{department?.students?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <BookOpen className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Active Courses</p>
              <p className="text-2xl font-bold">{department?.courses?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <UserPlus className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Active Sections</p>
              <p className="text-2xl font-bold">{department?.sections?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <span>{department?.contact_email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-2" />
              <span>{department?.contact_phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Management */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sections</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                Create New Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Section</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label>Section Name</label>
                  <Input
                    value={newSection.section_name}
                    onChange={(e) => setNewSection({
                      ...newSection,
                      section_name: e.target.value
                    })}
                    placeholder="e.g., CSE-A"
                  />
                </div>
                <div className="grid gap-2">
                  <label>Batch Year</label>
                  <Input
                    type="number"
                    value={newSection.batch_year}
                    onChange={(e) => setNewSection({
                      ...newSection,
                      batch_year: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <label>Maximum Capacity</label>
                  <Input
                    type="number"
                    value={newSection.max_capacity}
                    onChange={(e) => setNewSection({
                      ...newSection,
                      max_capacity: parseInt(e.target.value)
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <label>Semester</label>
                  <Input
                    type="number"
                    value={newSection.semester}
                    onChange={(e) => setNewSection({
                      ...newSection,
                      semester: parseInt(e.target.value)
                    })}
                  />
                </div>
                <Button onClick={handleCreateSection}>
                  Create Section
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section Name</TableHead>
                <TableHead>Batch Year</TableHead>
                <TableHead>Current Students</TableHead>
                <TableHead>Max Capacity</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {department?.sections?.map((section) => (
                <TableRow key={section.section_id}>
                  <TableCell className="font-medium">
                    {section.section_name}
                  </TableCell>
                  <TableCell>{section.batch_year}</TableCell>
                  <TableCell>{section.student_count}</TableCell>
                  <TableCell>{section.max_capacity}</TableCell>
                  <TableCell>{section.semester}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/p/department/${profileData?.departments[0].department_id}/section/${section.section_id}`)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      
    </div>
  );
};

export default DepartmentDetails;