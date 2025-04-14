import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import for animations
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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const popIn = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 260, damping: 20 } 
  }
};

const cardHover = {
  scale: 1.03,
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  transition: { duration: 0.2 }
};

const DepartmentDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [department, setDepartment] = useState<Department | null>(null);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [institution_id, setInstitutionId] = useAtom(institutionIdAtom);
  const { toast } = useToast();
  const [newSection, setNewSection] = useState({
    section_name: '',
    batch_year: new Date().getFullYear(),
    max_capacity: 60,
    semester: 1,
    student_count: 0,
    academic_year: new Date().getFullYear(),
    department_id: null as number | null,
    institution_id: institution_id
  });

  useEffect(() => {
    if (!institution_id) {
      setInstitutionId(Number(localStorage.getItem('institution_id')) || null);
    }
    if (id) {
      fetchDepartmentDetailsByID();
    }
    if (profileData) {
      fetchDepartmentDetails();
    } else {
      fetchProfile();
    }
  }, [user?.user_id, profileData, id]);

  useEffect(() => {
    if (department?.department_id) {
      setNewSection(prev => ({
        ...prev,
        department_id: department.department_id
      }));
    }
  }, [department]);

  const fetchProfile = async () => {
    const response = await axios.get(`${domain}/api/v1/faculty/get-faculty/${user?.user_id}`);
    const { data } = response.data;
    setProfileData(data);
  };

  const fetchDepartmentDetails = async () => {
    try {
      const response = await axios.get(`${domain}/api/v1/department/${profileData?.departments[0].department_id}/${institution_id}`);
      const data = await response.data.department;
      setDepartment(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching department details:', error);
      setLoading(false);
    }
  };

  const fetchDepartmentDetailsByID = async () => {
    try {
      const response = await axios.get(`${domain}/api/v1/department/${id}/${institution_id}`);
      const data = await response.data.department;
      setDepartment(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching department details:', error);
      setLoading(false);
    }
  };

  const handleCreateSection = async () => {
    try {
      if (!newSection.department_id || !institution_id) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Department and Institution information is required',
        });
        return;
      }

      const response = await axios.post(`${domain}/api/v1/section/add-section`, {
        ...newSection,
        department_id: parseInt(newSection.department_id.toString()),
        institution_id: institution_id
      });

      if (response.status === 200) {
        if (id) {
          fetchDepartmentDetailsByID();
        }
        fetchDepartmentDetails();
        toast({
          title: 'Success',
          description: 'Section created successfully',
        });

        setNewSection({
          section_name: '',
          batch_year: new Date().getFullYear(),
          max_capacity: 60,
          semester: 1,
          student_count: 0,
          academic_year: new Date().getFullYear(),
          department_id: department?.department_id || null,
          institution_id: institution_id
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Error creating section',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-2/3 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
        
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse mb-8"></div>
        <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 max-w-7xl"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className='flex w-full justify-between'>
        <motion.div variants={popIn}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {department?.department_name}
            </h1>
            <p className="text-gray-500 text-lg">
              Department Code: {department?.department_code}
            </p>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={()=>navigate(`/p/department/${department?.department_id}/add-hod`)}
            className="transition-all duration-300 hover:shadow-lg"
          >
            {department?.hod_user_id ? 'Edit HOD' : 'Add HOD'}
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div variants={popIn} custom={0} whileHover={cardHover}>
          <Card className="overflow-hidden border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-all">
            <CardContent className="flex items-center p-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Faculty</p>
                <motion.p 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {department?.faculty?.length || 0}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={popIn} custom={1} whileHover={cardHover}>
          <Card className="overflow-hidden border-l-4 border-green-500 shadow-md hover:shadow-lg transition-all">
            <CardContent className="flex items-center p-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <GraduationCap className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <motion.p 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {department?.students?.length || 0}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={popIn} custom={2} whileHover={cardHover}>
          <Card className="overflow-hidden border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-all">
            <CardContent className="flex items-center p-6">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Courses</p>
                <motion.p 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {department?.courses?.length || 0}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={popIn} custom={3} whileHover={cardHover}>
          <Card className="overflow-hidden border-l-4 border-orange-500 shadow-md hover:shadow-lg transition-all">
            <CardContent className="flex items-center p-6">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <UserPlus className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Sections</p>
                <motion.p 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {department?.sections?.length || 0}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        variants={fadeIn} 
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card className="shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                className="flex items-center p-2 rounded-md hover:bg-gray-50"
                whileHover={{ x: 5 }}
              >
                <div className="bg-blue-100 p-2 rounded-full mr-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <span>{department?.contact_email || 'N/A'}</span>
              </motion.div>
              <motion.div 
                className="flex items-center p-2 rounded-md hover:bg-gray-50"
                whileHover={{ x: 5 }}
              >
                <div className="bg-green-100 p-2 rounded-full mr-2">
                  <Phone className="h-5 w-5 text-green-500" />
                </div>
                <span>{department?.contact_phone || 'N/A'}</span>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        variants={fadeIn}
        transition={{ delay: 0.4 }}
      >
        <Card className="mb-8 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sections</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-blue-500 hover:bg-blue-600 transition-colors duration-300">
                    Create New Section
                  </Button>
                </motion.div>
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
                      className="transition-all focus:ring-2 focus:ring-blue-500"
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
                      className="transition-all focus:ring-2 focus:ring-blue-500"
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
                      className="transition-all focus:ring-2 focus:ring-blue-500"
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
                      className="transition-all focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={handleCreateSection}
                      className="w-full bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
                    >
                      Create Section
                    </Button>
                  </motion.div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="overflow-x-auto">
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
                {department?.sections?.map((section, index) => (
                  <motion.tr
                    key={section.section_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {section.section_name}
                    </TableCell>
                    <TableCell>{section.batch_year}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        {section.student_count}
                      </div>
                    </TableCell>
                    <TableCell>{section.max_capacity}</TableCell>
                    <TableCell>{section.semester}</TableCell>
                    <TableCell>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/p/department/${department.department_id}/section/${section.section_id}`)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          View Details
                        </Button>
                      </motion.div>
                    </TableCell>
                  </motion.tr>
                ))}
                {department?.sections?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No sections found. Create your first section!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DepartmentDetails;