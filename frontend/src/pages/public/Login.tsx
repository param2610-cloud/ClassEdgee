import { useEffect, useState } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { login } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthRole } from "@/store/auth.store";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "faculty", "coordinator", "admin"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roleRootMap: Record<AuthRole, string> = {
  admin: "/admin",
  coordinator: "/coordinator",
  faculty: "/faculty",
  student: "/student",
};

const Login = () => {
  usePageTitle("Sign In");

  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
    },
  });

  useEffect(() => {
    if (!user) return;
    navigate(roleRootMap[user.role], { replace: true });
  }, [navigate, user]);

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError("");

    try {
      const result = await login(values.email, values.password, values.role);
      navigate(roleRootMap[result.user.role], { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to sign in";
      setSubmitError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Use your role, email, and password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <Link to="#" className="hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
