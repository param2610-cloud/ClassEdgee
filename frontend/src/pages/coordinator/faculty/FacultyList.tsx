import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";
import {
  deleteCoordinatorFaculty,
  getCoordinatorFaculty,
  getFacultyDepartments,
} from "@/api/faculty.api";
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
import { Faculty } from "@/interface/general";

const designationOptions = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Visiting Faculty",
];

const getUserId = (faculty: Faculty) => Number(faculty.users?.user_id ?? faculty.user_id ?? 0);

const FacultyList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const institutionId = user?.institution_id;

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [designation, setDesignation] = useState("all");
  const [page, setPage] = useState(1);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, department, designation]);

  const departmentsQuery = useQuery({
    queryKey: ["faculty-departments", institutionId],
    queryFn: () => getFacultyDepartments(institutionId as number),
    enabled: Boolean(institutionId),
  });

  const facultyQuery = useQuery({
    queryKey: ["coordinator-faculty", { page, search, department, designation }],
    queryFn: () =>
      getCoordinatorFaculty({
        page,
        pageSize: 8,
        search: search.trim(),
        department: department === "all" ? "" : department,
        designation: designation === "all" ? "" : designation,
        sortBy: "joining_date",
        sortOrder: "desc",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoordinatorFaculty,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["coordinator-faculty"] });
      setFacultyToDelete(null);
      toast({
        title: "Faculty deleted",
        description: "Faculty record has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Unable to delete faculty right now.",
        variant: "destructive",
      });
    },
  });

  const columns = useMemo<ColumnDef<Faculty>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
          const firstName = row.original.users?.first_name || "";
          const lastName = row.original.users?.last_name || "";
          const fullName = `${firstName} ${lastName}`.trim();
          return fullName || "Faculty";
        },
      },
      {
        id: "employee-id",
        header: "Employee ID",
        cell: ({ row }) => row.original.users?.college_uid || "N/A",
      },
      {
        id: "department",
        header: "Department",
        cell: ({ row }) => row.original.departments?.department_name || "N/A",
      },
      {
        id: "expertise",
        header: "Expertise",
        cell: ({ row }) => {
          const expertise = Array.isArray(row.original.expertise) ? row.original.expertise : [];
          if (!expertise.length) return "N/A";
          const visible = expertise.slice(0, 2).join(", ");
          return expertise.length > 2 ? `${visible} +${expertise.length - 2}` : visible;
        },
      },
      {
        id: "max-hours",
        header: "Max Weekly Hours",
        cell: ({ row }) => String(row.original.max_weekly_hours ?? "N/A"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const userId = getUserId(row.original);
          return (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/coordinator/faculty/${userId}/edit`}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setFacultyToDelete(row.original);
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

  const pagination = facultyQuery.data?.pagination;

  return (
    <div>
      <PageHeader
        title="Faculty Management"
        description="Manage faculty records and academic assignments."
        breadcrumbs={[{ label: "Dashboard", href: "/coordinator" }, { label: "Faculty" }]}
        actions={
          <Button asChild>
            <Link to="/coordinator/faculty/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Faculty
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Search by name, email, or UID"
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
        <Select value={designation} onValueChange={setDesignation}>
          <SelectTrigger>
            <SelectValue placeholder="Designation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Designations</SelectItem>
            {designationOptions.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setDepartment("all");
            setDesignation("all");
          }}
        >
          Reset Filters
        </Button>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <StatCard label="Total Faculty" value={pagination?.total} icon={Users} />
      </div>

      <DataTable
        columns={columns}
        data={facultyQuery.data?.data ?? []}
        isLoading={facultyQuery.isLoading}
        error={facultyQuery.error || departmentsQuery.error}
        onRetry={() => {
          facultyQuery.refetch();
          departmentsQuery.refetch();
        }}
        emptyMessage="No faculty records match the selected filters."
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
              disabled={pagination.page <= 1 || facultyQuery.isFetching}
              onClick={() => {
                setPage((current) => Math.max(current - 1, 1));
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || facultyQuery.isFetching}
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
        open={Boolean(facultyToDelete)}
        onOpenChange={(open) => {
          if (!open) setFacultyToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete faculty record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove the faculty account and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                const id = facultyToDelete ? getUserId(facultyToDelete) : 0;
                if (!id) {
                  setFacultyToDelete(null);
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

export default FacultyList;
