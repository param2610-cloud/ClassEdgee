import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  getDepartmentsForInstitution,
  getStudentByUserId,
  updateCoordinatorStudent,
} from "@/api/student.api";
import { ErrorState, LoadingSkeleton, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const editStudentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z.string().min(10, "Phone number is too short"),
  departmentId: z.coerce.number().min(1, "Department is required"),
  enrollmentNumber: z.string().min(1, "Enrollment number is required"),
  batchYear: z.coerce.number().min(2000, "Enter a valid batch year"),
  currentSemester: z.coerce.number().min(1).max(8),
  guardianName: z.string().min(2, "Guardian name is required"),
  guardianContact: z.string().min(10, "Guardian contact is too short"),
  collegeUid: z.string().min(1, "College UID is required"),
  profilePictureUrl: z.string().optional(),
});

type EditStudentValues = z.infer<typeof editStudentSchema>;

const StudentEdit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const userId = Number(id);
  const institutionId = user?.institution_id;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditStudentValues>({
    resolver: zodResolver(editStudentSchema),
  });

  const studentQuery = useQuery({
    queryKey: ["coordinator-student", userId],
    queryFn: () => getStudentByUserId(userId),
    enabled: Number.isFinite(userId) && userId > 0,
  });

  const departmentsQuery = useQuery({
    queryKey: ["coordinator-departments", institutionId],
    queryFn: () => getDepartmentsForInstitution(institutionId as number),
    enabled: Boolean(institutionId),
  });

  useEffect(() => {
    const record = studentQuery.data;
    if (!record) return;

    reset({
      firstName: record.first_name,
      lastName: record.last_name,
      email: record.email,
      phoneNumber: record.phone_number || "",
      departmentId: Number(record.students?.department_id || 0),
      enrollmentNumber: record.students?.enrollment_number || "",
      batchYear: Number(record.students?.batch_year || new Date().getFullYear()),
      currentSemester: Number(record.students?.current_semester || 1),
      guardianName: record.students?.guardian_name || "",
      guardianContact: record.students?.guardian_contact || "",
      collegeUid: record.college_uid,
      profilePictureUrl: record.profile_picture || "",
    });
  }, [studentQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: EditStudentValues) =>
      updateCoordinatorStudent(userId, {
        ...values,
      }),
    onSuccess: () => {
      toast({
        title: "Student updated",
        description: "The student profile has been updated successfully.",
      });
      navigate("/coordinator/students");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update student";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EditStudentValues) => {
    updateMutation.mutate(values);
  };

  if (!Number.isFinite(userId) || userId <= 0) {
    return <ErrorState message="Invalid student ID" />;
  }

  if (studentQuery.isLoading || departmentsQuery.isLoading) {
    return <LoadingSkeleton variant="card" rows={2} />;
  }

  if (studentQuery.isError) {
    return (
      <ErrorState
        message="Failed to load student details"
        onRetry={() => {
          studentQuery.refetch();
        }}
      />
    );
  }

  if (departmentsQuery.isError) {
    return (
      <ErrorState
        message="Failed to load departments"
        onRetry={() => {
          departmentsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Student"
        description="Update student profile and academic information."
        breadcrumbs={[
          { label: "Dashboard", href: "/coordinator" },
          { label: "Students", href: "/coordinator/students" },
          { label: "Edit" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName ? <p className="text-xs text-red-600">{errors.firstName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName ? <p className="text-xs text-red-600">{errors.lastName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" {...register("phoneNumber")} />
              {errors.phoneNumber ? <p className="text-xs text-red-600">{errors.phoneNumber.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="collegeUid">College UID</Label>
              <Input id="collegeUid" {...register("collegeUid")} />
              {errors.collegeUid ? <p className="text-xs text-red-600">{errors.collegeUid.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
              <Input id="enrollmentNumber" {...register("enrollmentNumber")} />
              {errors.enrollmentNumber ? <p className="text-xs text-red-600">{errors.enrollmentNumber.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {(departmentsQuery.data ?? []).map((department) => (
                        <SelectItem key={department.department_id} value={String(department.department_id)}>
                          {department.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.departmentId ? <p className="text-xs text-red-600">{errors.departmentId.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchYear">Batch Year</Label>
              <Input id="batchYear" type="number" {...register("batchYear")} />
              {errors.batchYear ? <p className="text-xs text-red-600">{errors.batchYear.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSemester">Current Semester</Label>
              <Input id="currentSemester" type="number" min={1} max={8} {...register("currentSemester")} />
              {errors.currentSemester ? <p className="text-xs text-red-600">{errors.currentSemester.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input id="guardianName" {...register("guardianName")} />
              {errors.guardianName ? <p className="text-xs text-red-600">{errors.guardianName.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianContact">Guardian Contact</Label>
              <Input id="guardianContact" {...register("guardianContact")} />
              {errors.guardianContact ? <p className="text-xs text-red-600">{errors.guardianContact.message}</p> : null}
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/coordinator/students")}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEdit;
