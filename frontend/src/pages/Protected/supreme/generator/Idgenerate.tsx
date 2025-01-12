import  { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from '@/hooks/use-toast';
import { domain } from '@/lib/constant';
import { useAtom } from 'jotai';
import { institutionIdAtom } from '@/store/atom';
import { useNavigate } from 'react-router-dom';

// Zod validation schema
const coordinatorSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  collegeUid: z.string().min(4, { message: "College UID must be at least 4 characters" }),
  password: z.string().min(4, { message: "Password must be at least 4 characters" }),
  confirmPassword: z.string()
});

const getErrorMessage = (error: any) => {
  if (error.response?.data?.errorType) {
    switch (error.response.data.errorType) {
      case 'VALIDATION_ERROR':
        return error.response.data.message;
      case 'PASSWORD_STRENGTH_ERROR':
        return 'Password must be at least 8 characters long';
      case 'DUPLICATE_EMAIL':
        return 'This email address is already registered';
      case 'DUPLICATE_UID':
        return 'This College UID is already in use at this institution';
      case 'INVALID_INSTITUTION':
        return 'Invalid institution selected';
      case 'DATABASE_CONSTRAINT_ERROR':
        return `A conflict occurred with existing data: ${error.response.data.field}`;
      default:
        return 'An unexpected error occurred';
    }
  }
  return error.response?.data?.message || 'Failed to create coordinator';
};

const Idgenerate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [institution_Id] = useAtom(institutionIdAtom);
  const navigate = useNavigate();

  // Add useEffect to check for institution_id
  useEffect(() => {
    // Get institution_id from localStorage as fallback
    const storedInstitutionId = localStorage.getItem('institution_id');
    
    if (!institution_Id && !storedInstitutionId) {
      toast({
        title: 'Error',
        description: 'Institution ID not found. Please login again.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
  }, [institution_Id, navigate]);

  const form = useForm<z.infer<typeof coordinatorSchema>>({
    resolver: zodResolver(coordinatorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      collegeUid: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: z.infer<typeof coordinatorSchema>) => {
    try {
      setIsLoading(true);
      
      // Get institution_id from atom or localStorage
      const institutionId = institution_Id || parseInt(localStorage.getItem('institution_id') || '0');
      
      if (!institutionId) {
        throw new Error('Institution ID not found');
      }

      // Log for debugging
      console.log('Using institution_id:', institutionId);
      
      const response = await axios.post(`${domain}/api/v1/supreme/coordinator-create`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        college_uid: data.collegeUid,
        institution_id: institutionId, // Make sure this is a number
        password: data.password
      });

      if (response.data) {
        toast({
          title: 'Success',
          description: 'Coordinator created successfully',
        });
        form.reset();
        navigate('/p'); // Navigate to "/p" after success
      }
    } catch (error: any) {
      console.error('Error creating coordinator:', error);
      
      // Add specific handling for institution_id related errors
      if (error.message === 'Institution ID not found') {
        toast({
          title: 'Error',
          description: 'Please login again to refresh your session',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }
      
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Create Coordinator Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter first name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter last name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter email address" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collegeUid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College UID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter college UID" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter password" 
                        type="password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Confirm password" 
                        type="password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating...
                  </>
                ) : (
                  'Create Coordinator'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Idgenerate;
