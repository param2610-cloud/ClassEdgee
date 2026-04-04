import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, DoorOpen, GraduationCap, Users } from "lucide-react";
import { getCoordinators, getSystemCounts, CoordinatorRow } from "@/api/dashboard.api";
import { DataTable, ErrorState, PageHeader, StatCard } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const institutionId = user?.institution_id;

  const countsQuery = useQuery({
    queryKey: ["coordinator-dashboard-counts", institutionId],
    queryFn: () => getSystemCounts(institutionId),
  });

  const coordinatorsQuery = useQuery({
    queryKey: ["coordinator-dashboard-coordinators", institutionId],
    queryFn: () => getCoordinators(institutionId, 8),
  });

  const columns = useMemo<ColumnDef<CoordinatorRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => {
          const first = row.original.first_name || "";
          const last = row.original.last_name || "";
          const fullName = `${first} ${last}`.trim();
          return fullName || "Coordinator";
        },
      },
      {
        accessorKey: "college_uid",
        header: "College UID",
        cell: ({ row }) => row.original.college_uid || "N/A",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "N/A",
      },
    ],
    []
  );

  if (countsQuery.isError) {
    return (
      <ErrorState
        message="Failed to load coordinator dashboard"
        onRetry={() => {
          countsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Coordinator Dashboard"
        description="Department-level academic operations at a glance."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={countsQuery.data?.students} icon={GraduationCap} />
        <StatCard label="Faculty" value={countsQuery.data?.faculty} icon={Users} />
        <StatCard label="Sections" value={countsQuery.data?.sections} icon={BookOpen} />
        <StatCard label="Rooms" value={countsQuery.data?.rooms} icon={DoorOpen} />
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={coordinatorsQuery.data ?? []}
          isLoading={coordinatorsQuery.isLoading}
          error={coordinatorsQuery.error}
          onRetry={() => {
            coordinatorsQuery.refetch();
          }}
          emptyMessage="No coordinators found for this institution."
        />
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
