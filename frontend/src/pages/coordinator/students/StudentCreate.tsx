import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as XLSX from "xlsx";
import { z } from "zod";
import {
  createCoordinatorStudent,
  getDepartmentsForInstitution,
  uploadStudentsBulk,
} from "@/api/student.api";
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

const createStudentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

type CreateStudentValues = z.infer<typeof createStudentSchema>;

const StudentCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const institutionId = user?.institution_id;

  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [bulkResult, setBulkResult] = useState<Record<string, unknown> | null>(null);

  const departmentsQuery = useQuery({
    queryKey: ["coordinator-departments", institutionId],
    queryFn: () => getDepartmentsForInstitution(institutionId as number),
    enabled: Boolean(institutionId),
  });

  const createMutation = useMutation({
    mutationFn: createCoordinatorStudent,
    onSuccess: () => {
      toast({
        title: "Student created",
        description: "The new student record has been saved.",
      });
      navigate("/coordinator/students");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create student";
      toast({
        title: "Create failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: uploadStudentsBulk,
    onSuccess: (result) => {
      setBulkResult(result as Record<string, unknown>);
      toast({
        title: "Bulk upload complete",
        description: "Student upload request finished successfully.",
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
  } = useForm<CreateStudentValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      currentSemester: 1,
      batchYear: new Date().getFullYear(),
    },
  });

  const previewHeaders = useMemo(() => {
    if (!previewRows.length) return [];
    return Object.keys(previewRows[0]).slice(0, 6);
  }, [previewRows]);

  const onManualSubmit = (values: CreateStudentValues) => {
    if (!institutionId) {
      toast({
        title: "Missing institution",
        description: "Please login again before creating a student.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      ...values,
      institution_id: institutionId,
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
        title="Create Student"
        description="Add students manually or upload in bulk."
        breadcrumbs={[
          { label: "Dashboard", href: "/coordinator" },
          { label: "Students", href: "/coordinator/students" },
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
              <CardTitle>Student Details</CardTitle>
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
                  <Button type="button" variant="outline" onClick={() => navigate("/coordinator/students")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || departmentsQuery.isLoading}>
                    {createMutation.isPending ? "Saving..." : "Create Student"}
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

export default StudentCreate;
