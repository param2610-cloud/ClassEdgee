import { FormEvent, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, DoorOpen, Pencil, PlusCircle, Trash2, Wrench } from "lucide-react";
import {
  createRoom,
  CreateRoomPayload,
  deleteRoom,
  getBuildings,
  getRooms,
  RoomStatus,
  RoomSummary,
  RoomType,
  updateRoom,
  updateRoomStatus,
} from "@/api/room.api";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ROOM_TYPES: RoomType[] = ["classroom", "lab", "seminar_hall", "auditorium"];
const ROOM_STATUSES: RoomStatus[] = ["available", "in_use", "maintenance"];

interface RoomFormState {
  roomNumber: string;
  roomType: RoomType;
  capacity: string;
  floorNumber: string;
  buildingId: string;
  wing: string;
}

const emptyForm: RoomFormState = {
  roomNumber: "",
  roomType: "classroom",
  capacity: "40",
  floorNumber: "1",
  buildingId: "all",
  wing: "",
};

const formatRoomType = (value: RoomType) =>
  value
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusClasses = (status: RoomStatus) => {
  if (status === "available") return "bg-green-100 text-green-700";
  if (status === "in_use") return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
};

const RoomManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RoomStatus>("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomSummary | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<RoomSummary | null>(null);
  const [form, setForm] = useState<RoomFormState>(emptyForm);

  const roomsQuery = useQuery({
    queryKey: ["rooms-management"],
    queryFn: getRooms,
  });

  const buildingsQuery = useQuery({
    queryKey: ["buildings-management"],
    queryFn: getBuildings,
  });

  const saveRoomMutation = useMutation({
    mutationFn: async ({ roomNumber, payload }: { roomNumber?: string; payload: CreateRoomPayload }) => {
      if (roomNumber) {
        const { room_number, ...updatePayload } = payload;
        return updateRoom(roomNumber, updatePayload);
      }

      return createRoom(payload);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["rooms-management"] });
      setIsDialogOpen(false);
      setEditingRoom(null);
      setForm(emptyForm);

      toast({
        title: variables.roomNumber ? "Room updated" : "Room created",
        description: variables.roomNumber
          ? "Room details were updated successfully."
          : "Room was added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Unable to save room details right now.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms-management"] });
      setRoomToDelete(null);
      toast({
        title: "Room deleted",
        description: "Room has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Unable to delete this room right now.",
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ roomNumber, status }: { roomNumber: string; status: RoomStatus }) =>
      updateRoomStatus(roomNumber, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms-management"] });
      toast({
        title: "Status updated",
        description: "Room status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Status update failed",
        description: "Unable to update room status.",
        variant: "destructive",
      });
    },
  });

  const rooms = roomsQuery.data ?? [];
  const buildings = buildingsQuery.data ?? [];

  const buildingNameById = useMemo(
    () => new Map(buildings.map((building) => [building.building_id, building.building_name])),
    [buildings]
  );

  const filteredRooms = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const buildingName = room.building_id ? buildingNameById.get(room.building_id) ?? "" : "";
      const matchesSearch =
        !term ||
        room.room_number.toLowerCase().includes(term) ||
        (room.wing ?? "").toLowerCase().includes(term) ||
        buildingName.toLowerCase().includes(term);

      const matchesStatus = statusFilter === "all" || room.status === statusFilter;
      const matchesBuilding =
        buildingFilter === "all" || String(room.building_id ?? "") === buildingFilter;

      return matchesSearch && matchesStatus && matchesBuilding;
    });
  }, [rooms, search, statusFilter, buildingFilter, buildingNameById]);

  const roomStats = useMemo(() => {
    const totalRooms = rooms.length;
    const available = rooms.filter((room) => room.status === "available").length;
    const maintenance = rooms.filter((room) => room.status === "maintenance").length;

    return { totalRooms, available, maintenance };
  }, [rooms]);

  const openCreateDialog = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (room: RoomSummary) => {
    setEditingRoom(room);
    setForm({
      roomNumber: room.room_number,
      roomType: room.room_type,
      capacity: String(room.capacity),
      floorNumber: String(room.floor_number),
      buildingId: room.building_id ? String(room.building_id) : "all",
      wing: room.wing ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const capacity = Number(form.capacity);
    const floorNumber = Number(form.floorNumber);

    if (!form.roomNumber.trim() || !Number.isFinite(capacity) || !Number.isFinite(floorNumber)) {
      toast({
        title: "Invalid room details",
        description: "Provide a valid room number, floor, and capacity.",
        variant: "destructive",
      });
      return;
    }

    const payload: CreateRoomPayload = {
      room_number: form.roomNumber.trim(),
      room_type: form.roomType,
      capacity,
      floor_number: floorNumber,
      wing: form.wing.trim() || undefined,
      building_id: form.buildingId === "all" ? undefined : Number(form.buildingId),
    };

    saveRoomMutation.mutate({
      roomNumber: editingRoom?.room_number,
      payload,
    });
  };

  const columns = useMemo<ColumnDef<RoomSummary>[]>(
    () => [
      {
        accessorKey: "room_number",
        header: "Room Number",
      },
      {
        id: "building",
        header: "Building",
        cell: ({ row }) => {
          const buildingId = row.original.building_id;
          if (!buildingId) return "Unassigned";
          return buildingNameById.get(buildingId) ?? "Unassigned";
        },
      },
      {
        accessorKey: "capacity",
        header: "Capacity",
      },
      {
        accessorKey: "room_type",
        header: "Type",
        cell: ({ row }) => formatRoomType(row.original.room_type),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = (row.original.status ?? "available") as RoomStatus;
          return (
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(status)}`}>
              {formatRoomType(status as RoomType)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const status = (row.original.status ?? "available") as RoomStatus;

          return (
            <div className="flex min-w-[270px] items-center gap-2">
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
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  setRoomToDelete(row.original);
                }}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
              <Select
                value={status}
                onValueChange={(value) => {
                  statusMutation.mutate({
                    roomNumber: row.original.room_number,
                    status: value as RoomStatus,
                  });
                }}
                disabled={statusMutation.isPending}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_STATUSES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {formatRoomType(option as RoomType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      },
    ],
    [buildingNameById, statusMutation.isPending]
  );

  return (
    <div>
      <PageHeader
        title="Room Management"
        description="Manage room inventory, capacity, and operational status."
        breadcrumbs={[{ label: "Dashboard", href: "/coordinator" }, { label: "Rooms" }]}
        actions={
          <Button onClick={openCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <StatCard label="Total Rooms" value={roomStats.totalRooms} icon={DoorOpen} />
        <StatCard label="Available Rooms" value={roomStats.available} icon={Building2} variant="success" />
        <StatCard
          label="Maintenance"
          value={roomStats.maintenance}
          icon={Wrench}
          variant={roomStats.maintenance > 0 ? "warning" : "default"}
        />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Search by room number, wing, or building"
        />
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            {buildings.map((building) => (
              <SelectItem key={building.building_id} value={String(building.building_id)}>
                {building.building_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ROOM_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {formatRoomType(option as RoomType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setBuildingFilter("all");
            setStatusFilter("all");
          }}
        >
          Reset Filters
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredRooms}
        isLoading={roomsQuery.isLoading}
        error={roomsQuery.error || buildingsQuery.error}
        onRetry={() => {
          roomsQuery.refetch();
          buildingsQuery.refetch();
        }}
        emptyMessage="No rooms match the selected filters."
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingRoom(null);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "Add Room"}</DialogTitle>
            <DialogDescription>
              {editingRoom
                ? "Update room details and availability metadata."
                : "Create a room record for scheduling and attendance operations."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Number</label>
                <Input
                  value={form.roomNumber}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, roomNumber: event.target.value }));
                  }}
                  placeholder="A-101"
                  disabled={Boolean(editingRoom)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Type</label>
                <Select
                  value={form.roomType}
                  onValueChange={(value) => {
                    setForm((prev) => ({ ...prev, roomType: value as RoomType }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {formatRoomType(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Building</label>
                <Select
                  value={form.buildingId}
                  onValueChange={(value) => {
                    setForm((prev) => ({ ...prev, buildingId: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Unassigned</SelectItem>
                    {buildings.map((building) => (
                      <SelectItem key={building.building_id} value={String(building.building_id)}>
                        {building.building_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Floor</label>
                <Input
                  type="number"
                  min={1}
                  value={form.floorNumber}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, floorNumber: event.target.value }));
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, capacity: event.target.value }));
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Wing</label>
                <Input
                  value={form.wing}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, wing: event.target.value }));
                  }}
                  placeholder="East / West / North"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingRoom(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveRoomMutation.isPending}>
                {saveRoomMutation.isPending
                  ? "Saving..."
                  : editingRoom
                    ? "Update Room"
                    : "Create Room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(roomToDelete)}
        onOpenChange={(open) => {
          if (!open) setRoomToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove room {roomToDelete?.room_number}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (!roomToDelete?.room_number) {
                  setRoomToDelete(null);
                  return;
                }
                deleteMutation.mutate(roomToDelete.room_number);
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

export default RoomManagement;
