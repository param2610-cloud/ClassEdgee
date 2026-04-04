import { FormEvent, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Landmark, Pencil, PlusCircle } from "lucide-react";
import {
  BuildingSummary,
  createBuilding,
  getBuildings,
  updateBuilding,
} from "@/api/room.api";
import { DataTable, PageHeader, StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BuildingFormState {
  name: string;
  floors: string;
}

const emptyForm: BuildingFormState = {
  name: "",
  floors: "1",
};

const formatAddress = (location: unknown) => {
  if (!location) return "Not provided";
  if (typeof location === "string" && location.trim()) return location;

  if (typeof location === "object") {
    const value = location as Record<string, unknown>;

    if (typeof value.address === "string" && value.address.trim()) {
      return value.address;
    }

    if ("x" in value && "y" in value) {
      return `${String(value.x)}, ${String(value.y)}`;
    }
  }

  return "Not provided";
};

const BuildingManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const institutionId = user?.institution_id;

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingSummary | null>(null);
  const [form, setForm] = useState<BuildingFormState>(emptyForm);

  const buildingsQuery = useQuery({
    queryKey: ["buildings-management"],
    queryFn: getBuildings,
  });

  const saveBuildingMutation = useMutation({
    mutationFn: async ({ buildingId, name, floors }: { buildingId?: number; name: string; floors: number }) => {
      const payload = {
        building_name: name,
        floors,
        institution_id: institutionId,
      };

      if (buildingId) {
        return updateBuilding(buildingId, payload);
      }

      return createBuilding(payload);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["buildings-management"] });
      setEditingBuilding(null);
      setIsDialogOpen(false);
      setForm(emptyForm);

      toast({
        title: variables.buildingId ? "Building updated" : "Building created",
        description: variables.buildingId
          ? "Building details were updated successfully."
          : "Building was added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Unable to save building details right now.",
        variant: "destructive",
      });
    },
  });

  const buildings = buildingsQuery.data ?? [];

  const filteredBuildings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return buildings.filter((building) => {
      if (!term) return true;
      return building.building_name.toLowerCase().includes(term);
    });
  }, [buildings, search]);

  const stats = useMemo(() => {
    const totalBuildings = buildings.length;
    const totalRooms = buildings.reduce((acc, building) => acc + (building.rooms?.length ?? 0), 0);
    const totalFloors = buildings.reduce((acc, building) => acc + Number(building.floors || 0), 0);

    return { totalBuildings, totalRooms, totalFloors };
  }, [buildings]);

  const openCreateDialog = () => {
    setEditingBuilding(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (building: BuildingSummary) => {
    setEditingBuilding(building);
    setForm({
      name: building.building_name,
      floors: String(building.floors),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const floors = Number(form.floors);

    if (!form.name.trim() || !Number.isFinite(floors) || floors < 1) {
      toast({
        title: "Invalid building details",
        description: "Provide a building name and valid floor count.",
        variant: "destructive",
      });
      return;
    }

    saveBuildingMutation.mutate({
      buildingId: editingBuilding?.building_id,
      name: form.name.trim(),
      floors,
    });
  };

  const columns = useMemo<ColumnDef<BuildingSummary>[]>(
    () => [
      {
        accessorKey: "building_name",
        header: "Building Name",
      },
      {
        id: "address",
        header: "Address",
        cell: ({ row }) => formatAddress(row.original.location_coordinates),
      },
      {
        accessorKey: "floors",
        header: "Floors",
      },
      {
        id: "rooms",
        header: "Total Rooms",
        cell: ({ row }) => row.original.rooms?.length ?? 0,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              openEditDialog(row.original);
            }}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Building Management"
        description="Manage campus infrastructure blocks and floor capacity."
        breadcrumbs={[{ label: "Dashboard", href: "/coordinator" }, { label: "Buildings" }]}
        actions={
          <Button onClick={openCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Building
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <StatCard label="Total Buildings" value={stats.totalBuildings} icon={Building2} />
        <StatCard label="Total Floors" value={stats.totalFloors} icon={Landmark} />
        <StatCard label="Total Rooms" value={stats.totalRooms} icon={Building2} />
      </div>

      <div className="mb-6 flex gap-3">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Search by building name"
          className="max-w-sm"
        />
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
          }}
        >
          Reset
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredBuildings}
        isLoading={buildingsQuery.isLoading}
        error={buildingsQuery.error}
        onRetry={() => {
          buildingsQuery.refetch();
        }}
        emptyMessage="No building records found. Add a building to get started."
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingBuilding(null);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBuilding ? "Edit Building" : "Add Building"}</DialogTitle>
            <DialogDescription>
              {editingBuilding
                ? "Update building details used in room assignment and scheduling."
                : "Create a building record for infrastructure planning."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Building Name</label>
              <Input
                value={form.name}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, name: event.target.value }));
                }}
                placeholder="Academic Block A"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Floors</label>
              <Input
                type="number"
                min={1}
                value={form.floors}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, floors: event.target.value }));
                }}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingBuilding(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveBuildingMutation.isPending}>
                {saveBuildingMutation.isPending
                  ? "Saving..."
                  : editingBuilding
                    ? "Update Building"
                    : "Create Building"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildingManagement;
