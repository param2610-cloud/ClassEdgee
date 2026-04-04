import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  getFacultyByUserId,
  getFacultyDepartments,
  updateCoordinatorFaculty,
} from "@/api/faculty.api";
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

const editFacultySchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().optional(),
  departmentId: z.coerce.number().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  maxWeeklyHours: z.coerce.number().min(1).max(168).optional(),
  contractEndDate: z.string().optional(),
  expertise: z.string().optional(),
  qualifications: z.string().optional(),
  researchInterests: z.string().optional(),
  publications: z.string().optional(),
});

type EditFacultyValues = z.infer<typeof editFacultySchema>;

const toCsv = (values?: string[]) => (Array.isArray(values) ? values.join(", ") : "");
const fromCsv = (value?: string) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const EditFaculty = () => {
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
  } = useForm<EditFacultyValues>({
    resolver: zodResolver(editFacultySchema),
  });

  const facultyQuery = useQuery({
    queryKey: ["coordinator-faculty-item", userId],
    queryFn: () => getFacultyByUserId(userId),
    enabled: Number.isFinite(userId) && userId > 0,
  });

  const departmentsQuery = useQuery({
    queryKey: ["faculty-departments", institutionId],
    queryFn: () => getFacultyDepartments(institutionId as number),
    enabled: Boolean(institutionId),
  });

  useEffect(() => {
    const record = facultyQuery.data;
    if (!record) return;

    reset({
      firstName: record.first_name,
      lastName: record.last_name,
      email: record.email,
      phoneNumber: record.phone_number || "",
      profilePicture: record.profile_picture || "",
      departmentId: Number(record.faculty?.department_id || 0),
      designation: record.faculty?.designation || "",
      maxWeeklyHours: Number(record.faculty?.max_weekly_hours || 40),
      contractEndDate: record.faculty?.contract_end_date
        ? String(record.faculty.contract_end_date).slice(0, 10)
        : "",
      expertise: toCsv(record.faculty?.expertise),
      qualifications: toCsv(record.faculty?.qualifications),
      researchInterests: toCsv(record.faculty?.research_interests),
      publications: toCsv(record.faculty?.publications),
    });
  }, [facultyQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: EditFacultyValues) =>
      updateCoordinatorFaculty(userId, {
        user: {
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone_number: values.phoneNumber,
          profile_picture: values.profilePicture,
        },
        faculty: {
          department_id: values.departmentId,
          designation: values.designation,
          expertise: fromCsv(values.expertise),
          qualifications: fromCsv(values.qualifications),
          max_weekly_hours: values.maxWeeklyHours,
          contract_end_date: values.contractEndDate || null,
          research_interests: fromCsv(values.researchInterests),
          publications: fromCsv(values.publications),
        },
      }),
    onSuccess: () => {
      toast({
        title: "Faculty updated",
        description: "Faculty profile has been updated successfully.",
      });
      navigate("/coordinator/faculty");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update faculty";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EditFacultyValues) => {
    updateMutation.mutate(values);
  };

  if (!Number.isFinite(userId) || userId <= 0) {
    return <ErrorState message="Invalid faculty ID" />;
  }

  if (facultyQuery.isLoading || departmentsQuery.isLoading) {
    return <LoadingSkeleton variant="card" rows={2} />;
  }

  if (facultyQuery.isError) {
    return (
      <ErrorState
        message="Failed to load faculty details"
        onRetry={() => {
          facultyQuery.refetch();
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
        title="Edit Faculty"
        description="Update faculty profile and academic details."
        breadcrumbs={[
          { label: "Dashboard", href: "/coordinator" },
          { label: "Faculty", href: "/coordinator/faculty" },
          { label: "Edit" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Faculty Details</CardTitle>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePicture">Profile Picture URL</Label>
              <Input id="profilePicture" {...register("profilePicture")} />
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
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" {...register("designation")} />
              {errors.designation ? <p className="text-xs text-red-600">{errors.designation.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxWeeklyHours">Max Weekly Hours</Label>
              <Input id="maxWeeklyHours" type="number" {...register("maxWeeklyHours")} />
              {errors.maxWeeklyHours ? <p className="text-xs text-red-600">{errors.maxWeeklyHours.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractEndDate">Contract End Date</Label>
              <Input id="contractEndDate" type="date" {...register("contractEndDate")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expertise">Expertise (comma separated)</Label>
              <Input id="expertise" {...register("expertise")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="qualifications">Qualifications (comma separated)</Label>
              <Input id="qualifications" {...register("qualifications")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="researchInterests">Research Interests (comma separated)</Label>
              <Input id="researchInterests" {...register("researchInterests")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="publications">Publications (comma separated)</Label>
              <Input id="publications" {...register("publications")} />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/coordinator/faculty")}>Cancel</Button>
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

export default EditFaculty;
