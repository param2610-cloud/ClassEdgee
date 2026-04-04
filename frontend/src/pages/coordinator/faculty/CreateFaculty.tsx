import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as XLSX from "xlsx";
import { z } from "zod";
import {
  createCoordinatorFaculty,
  getFacultyDepartments,
  uploadFacultyBulk,
} from "@/api/faculty.api";
import { ErrorState, PageHeader } from "@/components/shared";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const createFacultySchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().optional(),
  employeeId: z.string().min(1, "Employee ID is required"),
  departmentId: z.coerce.number().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  contractEndDate: z.string().optional(),
  maxWeeklyHours: z.coerce.number().min(1).max(168),
  expertise: z.string().optional(),
  qualifications: z.string().optional(),
  researchInterests: z.string().optional(),
  publications: z.string().optional(),
  profilePictureUrl: z.string().optional(),
});

type CreateFacultyValues = z.infer<typeof createFacultySchema>;

const parseCsvField = (value?: string) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const CreateFaculty = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const institutionId = user?.institution_id;

  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [bulkResult, setBulkResult] = useState<Record<string, unknown> | null>(null);

  const departmentsQuery = useQuery({
    queryKey: ["faculty-departments", institutionId],
    queryFn: () => getFacultyDepartments(institutionId as number),
    enabled: Boolean(institutionId),
  });

  const createMutation = useMutation({
    mutationFn: createCoordinatorFaculty,
    onSuccess: () => {
      toast({
        title: "Faculty created",
        description: "The new faculty member has been saved.",
      });
      navigate("/coordinator/faculty");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create faculty";
      toast({
        title: "Create failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: uploadFacultyBulk,
    onSuccess: (result) => {
      setBulkResult(result as Record<string, unknown>);
      toast({
        title: "Bulk upload complete",
        description: "Faculty upload request finished successfully.",
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Bulk upload failed";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFacultyValues>({
    resolver: zodResolver(createFacultySchema),
    defaultValues: {
      maxWeeklyHours: 40,
    },
  });

  const previewHeaders = useMemo(() => {
    if (!previewRows.length) return [];
    return Object.keys(previewRows[0]).slice(0, 6);
  }, [previewRows]);

  const onManualSubmit = (values: CreateFacultyValues) => {
    if (!institutionId) {
      toast({
        title: "Missing institution",
        description: "Please login again before creating faculty.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber,
      departmentId: values.departmentId,
      employeeId: values.employeeId,
      designation: values.designation,
      joiningDate: values.joiningDate,
      contractEndDate: values.contractEndDate,
      maxWeeklyHours: values.maxWeeklyHours,
      expertise: parseCsvField(values.expertise),
      qualifications: parseCsvField(values.qualifications),
      researchInterests: parseCsvField(values.researchInterests),
      publications: parseCsvField(values.publications),
      profilePictureUrl: values.profilePictureUrl,
      institute_id: institutionId,
    });
  };

  const onBulkFileChange = async (file: File | null) => {
    setBulkFile(file);
    setPreviewRows([]);
    setBulkResult(null);

    if (!file) return;

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
      defval: "",
    });

    setPreviewRows(rows.slice(0, 5));
  };

  if (!institutionId) {
    return <ErrorState message="Institution context missing. Please login again." />;
  }

  return (
    <div>
      <PageHeader
        title="Create Faculty"
        description="Add faculty manually or upload in bulk."
        breadcrumbs={[
          { label: "Dashboard", href: "/coordinator" },
          { label: "Faculty", href: "/coordinator/faculty" },
          { label: "Create" },
        ]}
      />

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2 md:w-[320px]">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onManualSubmit)}>
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
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" {...register("phoneNumber")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input id="employeeId" {...register("employeeId")} />
                  {errors.employeeId ? <p className="text-xs text-red-600">{errors.employeeId.message}</p> : null}
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
                            <SelectItem
                              key={department.department_id}
                              value={String(department.department_id)}
                            >
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
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input id="joiningDate" type="date" {...register("joiningDate")} />
                  {errors.joiningDate ? <p className="text-xs text-red-600">{errors.joiningDate.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractEndDate">Contract End Date</Label>
                  <Input id="contractEndDate" type="date" {...register("contractEndDate")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxWeeklyHours">Max Weekly Hours</Label>
                  <Input id="maxWeeklyHours" type="number" {...register("maxWeeklyHours")} />
                  {errors.maxWeeklyHours ? <p className="text-xs text-red-600">{errors.maxWeeklyHours.message}</p> : null}
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profilePictureUrl">Profile Picture URL (optional)</Label>
                  <Input id="profilePictureUrl" {...register("profilePictureUrl")} />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => navigate("/coordinator/faculty")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || departmentsQuery.isLoading}>
                    {createMutation.isPending ? "Saving..." : "Create Faculty"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  onBulkFileChange(file);
                }}
              />

              {previewRows.length > 0 ? (
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">Preview (first 5 rows)</p>
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          {previewHeaders.map((header) => (
                            <th key={header} className="border-b px-2 py-1 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, index) => (
                          <tr key={index}>
                            {previewHeaders.map((header) => (
                              <td key={`${header}-${index}`} className="border-b px-2 py-1">
                                {String(row[header] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBulkFile(null);
                    setPreviewRows([]);
                    setBulkResult(null);
                  }}
                >
                  Clear
                </Button>
                <Button
                  disabled={!bulkFile || bulkUploadMutation.isPending}
                  onClick={() => {
                    if (!bulkFile) return;
                    bulkUploadMutation.mutate(bulkFile);
                  }}
                >
                  {bulkUploadMutation.isPending ? "Uploading..." : "Upload File"}
                </Button>
              </div>

              {bulkResult ? (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p>Processed: {String(bulkResult.total_records ?? "N/A")}</p>
                  <p>Created: {String(bulkResult.created ?? "N/A")}</p>
                  <p>Failed: {String(bulkResult.failed ?? "N/A")}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateFaculty;
