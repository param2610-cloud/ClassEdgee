import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, UserCheck, Users } from "lucide-react";
import { getStudentAttendanceDetail, StudentSubjectAttendance } from "@/api/attendance.api";
import { DataTable, ErrorState, PageHeader, StatCard } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

const AttendanceSummary = () => {
  const { user } = useAuth();
  const userId = user?.user_id;

  const detailQuery = useQuery({
    queryKey: ["student-attendance-detail", userId],
    queryFn: () => getStudentAttendanceDetail(userId as number),
    enabled: Boolean(userId),
  });

  const columns = useMemo<ColumnDef<StudentSubjectAttendance>[]>(
    () => [
      {
        accessorKey: "subjectName",
        header: "Subject",
      },
      {
        accessorKey: "totalClasses",
        header: "Total Classes",
      },
      {
        accessorKey: "attendedClasses",
        header: "Attended",
      },
      {
        id: "percentage",
        header: "Attendance %",
        cell: ({ row }) => `${row.original.attendancePercentage.toFixed(1)}%`,
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const isAtRisk = row.original.status === "at-risk";
          return (
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                isAtRisk ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {isAtRisk ? "At Risk" : "Healthy"}
            </span>
          );
        },
      },
    ],
    []
  );

  if (!userId) {
    return (
      <ErrorState message="Unable to identify student account for attendance summary." />
    );
  }

  const summary = detailQuery.data;

  return (
    <div>
      <PageHeader
        title="Attendance Summary"
        description="Track your overall attendance and subject-wise performance."
        breadcrumbs={[{ label: "Dashboard", href: "/student" }, { label: "Attendance" }]}
      />

      {summary?.atRisk ? (
        <Alert variant="destructive" className="mb-4">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Attendance shortage risk</AlertTitle>
          <AlertDescription>
            You are below 75% overall attendance. Improve your attendance to avoid shortage.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Overall Attendance"
          value={summary ? `${summary.overallPercentage.toFixed(1)}%` : undefined}
          icon={ShieldAlert}
          variant={(summary?.overallPercentage ?? 0) < 75 ? "danger" : "success"}
        />
        <StatCard label="Total Classes" value={summary?.totalClasses} icon={Users} />
        <StatCard label="Classes Attended" value={summary?.attendedClasses} icon={UserCheck} />
      </div>

      <DataTable
        columns={columns}
        data={summary?.subjects ?? []}
        isLoading={detailQuery.isLoading}
        error={detailQuery.error}
        onRetry={() => {
          detailQuery.refetch();
        }}
        emptyMessage="No attendance records found yet."
      />
    </div>
  );
};

export default AttendanceSummary;
