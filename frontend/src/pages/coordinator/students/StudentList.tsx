import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";
import {
  deleteCoordinatorStudent,
  getCoordinatorStudents,
  getDepartmentsForInstitution,
} from "@/api/student.api";
import { DataTable, PageHeader, StatCard } from "@/components/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Student } from "@/interface/general";

const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
const batchYearOptions = Array.from({ length: 10 }, (_, index) => String(new Date().getFullYear() - index));

const parsePercent = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${numeric.toFixed(1)}%` : "N/A";
};

const getUserId = (student: Student) => Number(student.users?.user_id ?? student.user_id ?? 0);

const StudentList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const institutionId = user?.institution_id;

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [semester, setSemester] = useState("all");
  const [batchYear, setBatchYear] = useState("all");
  const [page, setPage] = useState(1);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, department, semester, batchYear]);

  const departmentsQuery = useQuery({
    queryKey: ["coordinator-departments", institutionId],
    queryFn: () => getDepartmentsForInstitution(institutionId as number),
    enabled: Boolean(institutionId),
  });

  const studentsQuery = useQuery({
    queryKey: ["coordinator-students", { page, search, department, semester, batchYear }],
    queryFn: () =>
      getCoordinatorStudents({
        page,
        pageSize: 10,
        search: search.trim(),
        department: department === "all" ? "" : department,
        semester: semester === "all" ? "" : semester,
        batchYear: batchYear === "all" ? "" : batchYear,
        sortBy: "created_at",
        sortOrder: "desc",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoordinatorStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["coordinator-students"] });
      setStudentToDelete(null);
      toast({
        title: "Student deleted",
        description: "The student record has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Unable to delete the student right now.",
        variant: "destructive",
      });
    },
  });

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
          const firstName = row.original.users?.first_name || "";
          const lastName = row.original.users?.last_name || "";
          const fullName = `${firstName} ${lastName}`.trim();
          return fullName || "Student";
        },
      },
      {
        accessorKey: "enrollment_number",
        header: "Enrollment No",
        cell: ({ row }) => row.original.enrollment_number || "N/A",
      },
      {
        id: "section",
        header: "Section",
        cell: ({ row }) => row.original.sections?.section_name || "N/A",
      },
      {
        id: "department",
        header: "Department",
        cell: ({ row }) => row.original.departments?.department_name || "N/A",
      },
      {
        id: "attendance",
        header: "Attendance %",
        cell: ({ row }) => {
          const attendanceValue =
            (row.original as Student & { attendance_percentage?: number }).attendance_percentage;
          return parsePercent(attendanceValue);
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const userId = getUserId(row.original);
          return (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/coordinator/students/${userId}/edit`}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setStudentToDelete(row.original);
                }}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const pagination = studentsQuery.data?.pagination;

  return (
    <div>
      <PageHeader
        title="Student Management"
        description="Search, filter, and manage student records."
        breadcrumbs={[{ label: "Dashboard", href: "/coordinator" }, { label: "Students" }]}
        actions={
          <Button asChild>
            <Link to="/coordinator/students/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Search by name or UID"
        />
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {(departmentsQuery.data ?? []).map((dept) => (
              <SelectItem key={dept.department_id} value={dept.department_name}>
                {dept.department_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={semester} onValueChange={setSemester}>
          <SelectTrigger>
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesterOptions.map((option) => (
              <SelectItem key={option} value={option}>
                Semester {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={batchYear} onValueChange={setBatchYear}>
          <SelectTrigger>
            <SelectValue placeholder="Batch Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batch Years</SelectItem>
            {batchYearOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setDepartment("all");
            setSemester("all");
            setBatchYear("all");
          }}
        >
          Reset Filters
        </Button>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Students"
          value={pagination?.total}
          icon={Users}
        />
      </div>

      <DataTable
        columns={columns}
        data={studentsQuery.data?.data ?? []}
        isLoading={studentsQuery.isLoading}
        error={studentsQuery.error || departmentsQuery.error}
        onRetry={() => {
          studentsQuery.refetch();
          departmentsQuery.refetch();
        }}
        emptyMessage="No students match the selected filters."
      />

      {pagination ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || studentsQuery.isFetching}
              onClick={() => {
                setPage((current) => Math.max(current - 1, 1));
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || studentsQuery.isFetching}
              onClick={() => {
                setPage((current) => current + 1);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={Boolean(studentToDelete)}
        onOpenChange={(open) => {
          if (!open) setStudentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove the student account and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                const id = studentToDelete ? getUserId(studentToDelete) : 0;
                if (!id) {
                  setStudentToDelete(null);
                  return;
                }
                deleteMutation.mutate(id);
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentList;
