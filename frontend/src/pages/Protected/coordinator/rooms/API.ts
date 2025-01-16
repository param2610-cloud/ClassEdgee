import { domain } from '@/lib/constant';
import axios from 'axios';


const api = axios.create({ baseURL: `${domain}/api/v1` });

export const roomAPI = {
  getRooms: () => api.get('/room/list-of-rooms'),
  createRoom: (data: any) => api.post('/room', data),
  getRoomDetails: (roomNumber: string) => api.get(`/room/room_details/${roomNumber}`),
  updateRoom: (roomNumber: string, data: any) => api.put(`/room/${roomNumber}`, data),
  deleteRoom: (roomNumber: string) => api.delete(`/room/${roomNumber}`),
  getRoomsOnFloor: (floorNumber: number) => api.get(`/room/floors/${floorNumber}`),
  updateMaintenance: (roomNumber: string, data: any) => api.patch(`/room/${roomNumber}/maintenance`, data),
  getBuildings: () => api.get('/room/buildings'),
  createBuilding: (data: any) => api.post('/room/buildings', data),
  getRoomsByBuilding: (buildingId: string) => api.get(`/room/buildings/${buildingId}/rooms`),
  updateBuilding: (buildingId: string, data: any) => api.patch(`/room/buildings/${buildingId}`, data),
  updateStatus: async (roomNumber: string, status: string) => {
    return axios.patch(`${domain}/api/v1/room/${roomNumber}/status`, { status });
  },
};