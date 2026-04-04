import api from "@/api/axios";

export type RoomType = "classroom" | "lab" | "seminar_hall" | "auditorium";
export type RoomStatus = "available" | "in_use" | "maintenance";

export interface BuildingSummary {
  building_id: number;
  building_name: string;
  floors: number;
  institution_id?: number;
  created_at?: string;
  location_coordinates?: unknown;
  rooms?: RoomSummary[];
}

export interface RoomSummary {
  room_id: number;
  room_number: string;
  room_type: RoomType;
  capacity: number;
  floor_number: number;
  wing?: string | null;
  area_sqft?: number | null;
  building_id?: number | null;
  status?: RoomStatus | null;
  last_maintenance_date?: string | null;
  next_maintenance_date?: string | null;
  buildings?: BuildingSummary;
}

interface CollectionResponse<T> {
  success?: boolean;
  data?: T[];
}

interface SingleResponse<T> {
  success?: boolean;
  data?: T;
}

export interface CreateRoomPayload {
  room_number: string;
  room_type: RoomType;
  capacity: number;
  floor_number: number;
  building_id?: number;
  wing?: string;
  area_sqft?: number;
}

export interface UpdateRoomPayload {
  room_type?: RoomType;
  capacity?: number;
  floor_number?: number;
  building_id?: number;
  wing?: string;
  area_sqft?: number;
}

export interface CreateBuildingPayload {
  building_name: string;
  floors: number;
  institution_id?: number;
}

export interface UpdateBuildingPayload {
  building_name?: string;
  floors?: number;
  institution_id?: number;
}

const asArray = <T>(payload: CollectionResponse<T> | undefined) =>
  Array.isArray(payload?.data) ? payload.data : [];

export const getRooms = async (): Promise<RoomSummary[]> => {
  const response = await api.get("/api/v1/room/list-of-rooms");
  return asArray<RoomSummary>(response.data as CollectionResponse<RoomSummary>);
};

export const createRoom = async (payload: CreateRoomPayload): Promise<RoomSummary> => {
  const response = await api.post("/api/v1/room", payload);
  return (response.data as SingleResponse<RoomSummary>).data as RoomSummary;
};

export const updateRoom = async (
  roomNumber: string,
  payload: UpdateRoomPayload
): Promise<RoomSummary> => {
  const response = await api.put(`/api/v1/room/${roomNumber}`, payload);
  return (response.data as SingleResponse<RoomSummary>).data as RoomSummary;
};

export const deleteRoom = async (roomNumber: string): Promise<void> => {
  await api.delete(`/api/v1/room/${roomNumber}`);
};

export const updateRoomStatus = async (
  roomNumber: string,
  status: RoomStatus
): Promise<RoomSummary> => {
  const response = await api.patch(`/api/v1/room/${roomNumber}/status`, { status });
  return (response.data as SingleResponse<RoomSummary>).data as RoomSummary;
};

export const getBuildings = async (): Promise<BuildingSummary[]> => {
  const response = await api.get("/api/v1/room/buildings");
  return asArray<BuildingSummary>(response.data as CollectionResponse<BuildingSummary>);
};

export const createBuilding = async (
  payload: CreateBuildingPayload
): Promise<BuildingSummary> => {
  const response = await api.post("/api/v1/room/buildings", payload);
  return (response.data as SingleResponse<BuildingSummary>).data as BuildingSummary;
};

export const updateBuilding = async (
  buildingId: number,
  payload: UpdateBuildingPayload
): Promise<BuildingSummary> => {
  const response = await api.patch(`/api/v1/room/buildings/${buildingId}`, payload);
  return (response.data as SingleResponse<BuildingSummary>).data as BuildingSummary;
};
