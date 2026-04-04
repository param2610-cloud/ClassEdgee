import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Clock3, Layers3, School2 } from "lucide-react";
import {
  DashboardClassRow,
  getFacultyDashboardSummary,
} from "@/api/dashboard.api";
import { DataTable, EmptyState, ErrorState, PageHeader, StatCard } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";

const formatDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "--";
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const FacultyDashboard = () => {
  const { user } = useAuth();
  const userId = user?.user_id;

  const summaryQuery = useQuery({
    queryKey: ["faculty-dashboard-summary", userId],
    queryFn: () => getFacultyDashboardSummary(userId as number),
    enabled: Boolean(userId),
  });

  const columns = useMemo<ColumnDef<DashboardClassRow>[]>(
    () => [
      {
        accessorKey: "courses.course_name",
        header: "Course",
        cell: ({ row }) => row.original.courses?.course_name || "Course",
      },
      {
        accessorKey: "sections.section_name",
        header: "Section",
        cell: ({ row }) => row.original.sections?.section_name || "N/A",
      },
      {
        accessorKey: "rooms.room_number",
        header: "Room",
        cell: ({ row }) => row.original.rooms?.room_number || "N/A",
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.date_of_class),
      },
      {
        id: "time",
        header: "Time",
        cell: ({ row }) => {
          const start = formatTime(row.original.timeslots?.start_time);
          const end = formatTime(row.original.timeslots?.end_time);
          return `${start} - ${end}`;
        },
      },
    ],
    []
  );

  if (summaryQuery.isError) {
    return (
      <ErrorState
        message="Failed to load faculty dashboard"
        onRetry={() => {
          summaryQuery.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Faculty Dashboard"
        description="Monitor classes and attendance actions for the day."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Faculty ID"
          value={summaryQuery.data?.facultyId ?? "N/A"}
          icon={School2}
        />
        <StatCard
          label="Total Classes"
          value={summaryQuery.data?.totalClasses}
          icon={Layers3}
        />
        <StatCard
          label="Classes Today"
          value={summaryQuery.data?.todayClasses}
          icon={Clock3}
        />
        <StatCard
          label="Pending Attendance"
          value={summaryQuery.data?.pendingAttendance}
          icon={ClipboardCheck}
          variant={(summaryQuery.data?.pendingAttendance ?? 0) > 0 ? "warning" : "success"}
        />
      </div>

      <div className="mt-6">
        {!summaryQuery.isLoading && (summaryQuery.data?.recentClasses.length ?? 0) === 0 ? (
          <EmptyState
            title="No class records yet"
            description="Classes will appear here once your schedule is available."
          />
        ) : (
          <DataTable
            columns={columns}
            data={summaryQuery.data?.recentClasses ?? []}
            isLoading={summaryQuery.isLoading}
            error={summaryQuery.error}
            onRetry={() => {
              summaryQuery.refetch();
            }}
            emptyMessage="No classes available."
          />
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
