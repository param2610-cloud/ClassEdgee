import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { Download, Mail, TriangleAlert, Users } from "lucide-react";
import {
  getAttendanceDepartments,
  getAttendanceSections,
  getCoordinatorAttendanceDashboard,
  getLowAttendanceReport,
  sendLowAttendanceEmails,
} from "@/api/attendance.api";
import { DataTable, PageHeader, StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Section } from "@/interface/general";

interface AttendanceRow {
  classId: number;
  className: string;
  section: string;
  department: string;
  date: string;
  presentCount: number;
  absentCount: number;
  method: string;
}

const toDateInput = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatMethod = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getMethodVariant = (method: string): "default" | "secondary" | "destructive" | "outline" => {
  const normalized = method.toLowerCase();
  if (normalized === "manual") return "outline";
  if (normalized === "facial") return "secondary";
  return "default";
};

const AttendanceDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const today = new Date();
  const oneMonthBack = new Date();
  oneMonthBack.setDate(today.getDate() - 30);

  const [departmentId, setDepartmentId] = useState("all");
  const [sectionId, setSectionId] = useState("all");
  const [startDate, setStartDate] = useState(toDateInput(oneMonthBack));
  const [endDate, setEndDate] = useState(toDateInput(today));
  const [threshold, setThreshold] = useState("75");

  const filters = useMemo(
    () => ({
      departmentId: departmentId === "all" ? undefined : Number(departmentId),
      sectionId: sectionId === "all" ? undefined : Number(sectionId),
      startDate,
      endDate,
      threshold: Number(threshold) || 75,
    }),
    [departmentId, sectionId, startDate, endDate, threshold]
  );

  const departmentsQuery = useQuery({
    queryKey: ["attendance-departments", user?.institution_id],
    queryFn: () => getAttendanceDepartments(user?.institution_id),
    enabled: Boolean(user?.institution_id),
  });

  const sectionsQuery = useQuery({
    queryKey: ["attendance-sections"],
    queryFn: getAttendanceSections,
  });

  const dashboardQuery = useQuery({
    queryKey: ["coordinator-attendance-dashboard", filters],
    queryFn: () => getCoordinatorAttendanceDashboard(filters),
  });

  const lowAttendanceQuery = useQuery({
    queryKey: ["coordinator-low-attendance", filters.departmentId, filters.threshold],
    queryFn: () => getLowAttendanceReport(filters),
  });

  const sendEmailsMutation = useMutation({
    mutationFn: sendLowAttendanceEmails,
    onSuccess: (response) => {
      const affected = Array.isArray(response.affectedStudents)
        ? response.affectedStudents.length
        : 0;
      toast({
        title: "Warning emails sent",
        description: affected
          ? `Sent attendance warning emails to ${affected} students.`
          : response.message || "Attendance warning emails were sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Email send failed",
        description: "Unable to send warning emails right now.",
        variant: "destructive",
      });
    },
  });

  const filteredSections = useMemo(() => {
    const allSections = sectionsQuery.data ?? [];

    if (departmentId === "all") return allSections;

    return allSections.filter(
      (section: Section) => Number(section.department_id) === Number(departmentId)
    );
  }, [sectionsQuery.data, departmentId]);

  const rows = dashboardQuery.data?.records ?? [];

  const columns = useMemo<ColumnDef<AttendanceRow>[]>(
    () => [
      {
        accessorKey: "section",
        header: "Section",
      },
      {
        accessorKey: "className",
        header: "Class",
      },
      {
        accessorKey: "date",
        header: "Date",
      },
      {
        accessorKey: "presentCount",
        header: "Present",
      },
      {
        accessorKey: "absentCount",
        header: "Absent",
      },
      {
        id: "method",
        header: "Method",
        cell: ({ row }) => {
          const method = row.original.method;
          return (
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                getMethodVariant(method) === "outline"
                  ? "bg-slate-100 text-slate-700"
                  : getMethodVariant(method) === "secondary"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-violet-100 text-violet-700"
              }`}
            >
              {formatMethod(method)}
            </span>
          );
        },
      },
    ],
    []
  );

  const exportToExcel = () => {
    if (!rows.length) {
      toast({
        title: "No data to export",
        description: "Apply filters and load attendance rows before exporting.",
      });
      return;
    }

    const exportRows = rows.map((row) => ({
      Section: row.section,
      Class: row.className,
      Department: row.department,
      Date: row.date,
      Present: row.presentCount,
      Absent: row.absentCount,
      Method: formatMethod(row.method),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `attendance-report-${toDateInput(new Date())}.xlsx`);
  };

  const dashboardStats = dashboardQuery.data?.stats;
  const lowAttendanceCount = lowAttendanceQuery.data?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Attendance Dashboard"
        description="Track attendance health by section, date range, and verification method."
        breadcrumbs={[{ label: "Dashboard", href: "/coordinator" }, { label: "Attendance" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button
              onClick={() => {
                sendEmailsMutation.mutate();
              }}
              disabled={sendEmailsMutation.isPending || lowAttendanceCount === 0}
            >
              <Mail className="mr-2 h-4 w-4" />
              {sendEmailsMutation.isPending ? "Sending..." : "Send Warnings"}
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <StatCard
          label="Overall Attendance"
          value={
            dashboardStats
              ? `${dashboardStats.overallAttendancePercentage.toFixed(1)}%`
              : undefined
          }
          icon={Users}
          variant={
            (dashboardStats?.overallAttendancePercentage ?? 0) < 75
              ? "danger"
              : "success"
          }
        />
        <StatCard
          label="Students Below Threshold"
          value={lowAttendanceQuery.isLoading ? undefined : lowAttendanceCount}
          icon={TriangleAlert}
          variant={lowAttendanceCount > 0 ? "danger" : "success"}
        />
        <StatCard
          label="Classes Without Attendance Today"
          value={dashboardStats?.classesWithoutAttendanceToday}
          icon={TriangleAlert}
          variant={(dashboardStats?.classesWithoutAttendanceToday ?? 0) > 0 ? "warning" : "success"}
        />
        <StatCard label="Classes in Range" value={dashboardStats?.totalClasses} icon={Users} />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <Select
          value={departmentId}
          onValueChange={(value) => {
            setDepartmentId(value);
            setSectionId("all");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {(departmentsQuery.data ?? []).map((department) => (
              <SelectItem key={department.department_id} value={String(department.department_id)}>
                {department.department_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sectionId} onValueChange={setSectionId}>
          <SelectTrigger>
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {filteredSections.map((section) => (
              <SelectItem key={section.section_id} value={String(section.section_id)}>
                {section.section_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={startDate}
          onChange={(event) => {
            setStartDate(event.target.value);
          }}
        />
        <Input
          type="date"
          value={endDate}
          onChange={(event) => {
            setEndDate(event.target.value);
          }}
        />
        <Input
          type="number"
          min={1}
          max={100}
          value={threshold}
          onChange={(event) => {
            setThreshold(event.target.value);
          }}
          placeholder="Threshold %"
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={dashboardQuery.isLoading}
        error={
          dashboardQuery.error ||
          sectionsQuery.error ||
          departmentsQuery.error ||
          lowAttendanceQuery.error
        }
        onRetry={() => {
          dashboardQuery.refetch();
          sectionsQuery.refetch();
          departmentsQuery.refetch();
          lowAttendanceQuery.refetch();
        }}
        emptyMessage="No attendance records found for the selected filters."
      />
    </div>
  );
};

export default AttendanceDashboard;
