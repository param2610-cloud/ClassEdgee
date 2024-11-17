import  { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the form schema
const studentSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Invalid phone number'),
  enrollment_number: z.string().min(1, 'Enrollment number is required'),
  department_id: z.string().min(1, 'Department is required'),
  batch_year: z.string().min(4, 'Invalid batch year'),
  current_semester: z.string().min(1, 'Current semester is required'),
  guardian_name: z.string().min(2, 'Guardian name is required'),
  guardian_contact: z.string().min(10, 'Invalid guardian contact'),
  college_uid: z.string().min(1, 'College UID is required'),
  profile_picture: z.any().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset';
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';

export default function CreateStudentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      enrollment_number: '',
      department_id: '',
      batch_year: '',
      current_semester: '',
      guardian_name: '',
      guardian_contact: '',
      college_uid: '',
    },
  });

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      setIsLoading(true);
      
      let imageUrl = '';
      if (data.profile_picture instanceof File) {
        imageUrl = await handleImageUpload(data.profile_picture);
      }

      const studentData = {
        ...data,
        profile_picture: imageUrl,
      };

      await axios.post('/api/v1/students/create', studentData);
      
      toast({
        title: "Success!",
        description: "Student has been created successfully.",
        duration: 5000,
      });

      form.reset();
      setProfilePreview('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create student. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Student</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enrollment_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Computer Science</SelectItem>
                        <SelectItem value="2">Electrical Engineering</SelectItem>
                        <SelectItem value="3">Mechanical Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Year</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Semester</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardian_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardian_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian Contact</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="college_uid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College UID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile_picture"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            onChange(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfilePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    {profilePreview && (
                      <img 
                        src={profilePreview} 
                        alt="Profile preview" 
                        className="mt-2 w-24 h-24 rounded-full object-cover"
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Student"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}