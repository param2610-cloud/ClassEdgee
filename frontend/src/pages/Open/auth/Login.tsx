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
import { Briefcase, GraduationCap, LockIcon, MailIcon, School, ShieldCheck, UserIcon, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(UserRole.STUDENT);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [, setRoleAtom] = useAtom(roleAtom);
  const [, setInstitutionId] = useAtom(institutionIdAtom);

  const credentials = {
    [UserRole.ADMIN]: { email: 'gpampa138@gmail.com', password: 'classedgee' },
    [UserRole.COORDINATOR]: { email: 'coordinator@dsec.com', password: 'classedgee' },
    [UserRole.FACULTY]: { email: 'harsh.acharya@dsec.edu', password: 'classedgee' },
    [UserRole.STUDENT]: { email: 'ela.chakraborty38@dsec.com', password: 'classedgee' },
  };

  const handleDemoLogin = (selectedRole: UserRole) => {
    const creds = credentials[selectedRole];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setRole(selectedRole);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate("/p/", { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Email and password are required");
      return;
    }
    setIsSubmitting(true);
    setMessage('');

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
      console.log(error)
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-700 via-blue-200 to-green-600 min-h-screen flex items-center justify-center">
      <div
        className={`w-full max-w-md px-4 transition-opacity duration-500 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <Card
          className={`w-full transform transition-all duration-700 bg-white/80 backdrop-blur-sm ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
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
              <div
                className={`space-y-2 transition-all duration-700 delay-700`}
              >
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
                    <SelectItem value={UserRole.COORDINATOR}>
                      Co-ordinator
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className={`space-y-2 transition-all duration-700 delay-1000`}
              >
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

              <div
                className={`space-y-2 transition-all duration-700 delay-1000`}
              >
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
                <Alert
                  variant="destructive"
                  className="animate-in fade-in slide-in-from-top duration-500"
                >
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className={`w-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  mounted
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                disabled={isSubmitting || isAuthLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : "Sign in"}
              </Button>
            </form>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 text-gray-500 backdrop-blur-sm">
                  Or quick login as
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button variant="outline" onClick={() => handleDemoLogin(UserRole.ADMIN)} className="flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Admin</span>
              </Button>
              <Button variant="outline" onClick={() => handleDemoLogin(UserRole.COORDINATOR)} className="flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
                <Briefcase className="w-4 h-4 text-purple-500" />
                <span>Coordinator</span>
              </Button>
              <Button variant="outline" onClick={() => handleDemoLogin(UserRole.FACULTY)} className="flex items-center justify-center gap-2 hover:bg-green-50 transition-colors">
                <GraduationCap className="w-4 h-4 text-green-500" />
                <span>Faculty</span>
              </Button>
              <Button variant="outline" onClick={() => handleDemoLogin(UserRole.STUDENT)} className="flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors">
                <School className="w-4 h-4 text-orange-500" />
                <span>Student</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p
              className={`text-sm text-gray-500 transition-all duration-700 delay-1000 ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              Need help? Contact your administrator
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;