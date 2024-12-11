import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import axios from 'axios';
import { institutionIdAtom, roleAtom } from '@/store/atom';
import { enhancedLocalStorage, useAuth } from '@/services/AuthContext';
import { UserRole } from '@/interface/general';
import { domain } from '@/lib/constant';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LockIcon, MailIcon, UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(UserRole.STUDENT);
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [, setRoleAtom] = useAtom(roleAtom);
  const [, setInstitutionId] = useAtom(institutionIdAtom);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/p/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Email and password are required");
      return;
    }

    try {
      const endpoint = `${domain}/api/v1/${role}/login`;
      const response = await axios.post(endpoint, {
        email,
        password
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        setRoleAtom(role);
        if (role === "faculty") {
          localStorage.setItem("department_id", response.data.faculty.faculty.department_id.toString());
        }
        setInstitutionId(response.data.userData.institution_id);
        localStorage.setItem('institution_id', response.data.userData.institution_id.toString());
        enhancedLocalStorage.setItem('accessToken', response.data.accessToken);
        enhancedLocalStorage.setItem('refreshToken', response.data.refreshToken);
        navigate("/p/");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setMessage(error.response.data.message || "An error occurred. Please try again later.");
        } else if (error.request) {
          setMessage("No response from server. Please try again later.");
        } else {
          setMessage("An error occurred. Please try again.");
        }
      } else {
        setMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 px-4 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Card className={`w-full max-w-md transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center transition-all duration-700 delay-300">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center transition-all duration-700 delay-500">
            Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className={`space-y-2 transition-all duration-700 delay-700`}>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger className="w-full">
                  <UserIcon className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.FACULTY}>Faculty</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                  <SelectItem value={UserRole.COORDINATOR}>Co-ordinator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`space-y-2 transition-all duration-700 delay-1000`}>
              <div className="relative group">
                <MailIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-primary" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 transition-all duration-300 hover:border-primary focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className={`space-y-2 transition-all duration-700 delay-1000`}>
              <div className="relative group">
                <LockIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-primary" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 transition-all duration-300 hover:border-primary focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {message && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top duration-500">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className={`w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className={`text-sm text-gray-500 transition-all duration-700 delay-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Need help? Contact your administrator
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;