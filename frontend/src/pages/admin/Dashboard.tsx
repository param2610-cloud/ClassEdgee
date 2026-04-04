import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Building2, LibraryBig, MonitorCog, UsersRound } from "lucide-react";
import { CoordinatorRow, getCoordinators, getSystemCounts } from "@/api/dashboard.api";
import { DataTable, ErrorState, PageHeader, StatCard } from "@/components/shared";

const AdminDashboard = () => {
  const countsQuery = useQuery({
    queryKey: ["admin-dashboard-counts"],
    queryFn: () => getSystemCounts(),
  });

  const coordinatorsQuery = useQuery({
    queryKey: ["admin-dashboard-coordinators"],
    queryFn: () => getCoordinators(undefined, 10),
  });

  const columns = useMemo<ColumnDef<CoordinatorRow>[]>(
    () => [
      {
        id: "name",
        header: "Coordinator",
        cell: ({ row }) => {
          const first = row.original.first_name || "";
          const last = row.original.last_name || "";
          const fullName = `${first} ${last}`.trim();
          return fullName || "Coordinator";
        },
      },
      {
        accessorKey: "institution_id",
        header: "Institution",
        cell: ({ row }) => row.original.institution_id || "N/A",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "N/A",
      },
      {
        accessorKey: "college_uid",
        header: "UID",
        cell: ({ row }) => row.original.college_uid || "N/A",
      },
    ],
    []
  );

  if (countsQuery.isError) {
    return (
      <ErrorState
        message="Failed to load admin dashboard"
        onRetry={() => {
          countsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Platform-wide coordination and capacity overview."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={countsQuery.data?.students} icon={UsersRound} />
        <StatCard label="Total Faculty" value={countsQuery.data?.faculty} icon={LibraryBig} />
        <StatCard label="Coordinators" value={countsQuery.data?.coordinators} icon={MonitorCog} />
        <StatCard label="Rooms" value={countsQuery.data?.rooms} icon={Building2} />
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
          emptyMessage="No coordinators available yet."
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
