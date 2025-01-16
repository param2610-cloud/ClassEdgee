import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Wrench, AlertCircle, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { roomAPI } from './API';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Room {
  room_id: number;
  room_number: string;
  room_type: 'classroom' | 'lab' | 'seminar_hall' | 'auditorium';
  capacity: number;
  floor_number: number;
  wing?: string;
  building_id?: number;
  area_sqft?: number;
  features?: Record<string, any>;
  status: 'available' | 'in_use' | 'maintenance';
  last_maintenance_date?: string;
  next_maintenance_date?: string;
}

interface Building {
  building_id: number;
  building_name: string;
  floors: number;
}

interface Feature {
  feature_id: number;
  feature_name: string;
  quantity: number;
  status: 'functional' | 'maintenance';
}

const RoomForm = ({ onSubmit, onCancel, initialData, buildings, selectedRoom }: {
  onSubmit: (formData: Room) => void;
  onCancel: () => void;
  initialData: Room;
  buildings: Building[];
  selectedRoom: Room | null;
}) => {
  const [formData, setFormData] = useState<Room>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Room Number</label>
          <input
            type="text"
            value={formData.room_number}
            onChange={(e) => setFormData({...formData, room_number: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Room Type</label>
          <select
            value={formData.room_type}
            onChange={(e) => setFormData({...formData, room_type: e.target.value as Room['room_type']})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="classroom">Classroom</option>
            <option value="lab">Laboratory</option>
            <option value="seminar_hall">Seminar Hall</option>
            <option value="auditorium">Auditorium</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Building</label>
          <select
            value={formData.building_id}
            onChange={(e) => setFormData({...formData, building_id: Number(e.target.value)})}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Building</option>
            {buildings.map((building) => (
              <option key={building.building_id} value={building.building_id}>
                {building.building_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Floor</label>
          <input
            type="number"
            value={formData.floor_number}
            onChange={(e) => setFormData({...formData, floor_number: Number(e.target.value)})}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Capacity</label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Wing</label>
          <input
            type="text"
            value={formData.wing || ''}
            onChange={(e) => setFormData({...formData, wing: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          {selectedRoom ? 'Update' : 'Create'} Room
        </button>
      </div>
    </form>
  );
};

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const initialFormState: Room = {
    room_id: 0,
    room_number: '',
    room_type: 'classroom',
    capacity: 0,
    floor_number: 1,
    status: 'available',
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [roomsResponse, buildingsResponse] = await Promise.all([
        roomAPI.getRooms(),
        roomAPI.getBuildings()
      ]);
      setRooms(roomsResponse.data.data);
      setBuildings(buildingsResponse.data.data);
    } catch (error) {
      setError('Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (submittedData: Room) => {
    setError('');
    try {
      if (selectedRoom) {
        await roomAPI.updateRoom(selectedRoom.room_number, submittedData);
      } else {
        await roomAPI.createRoom(submittedData);
      }
      
      await loadInitialData();
      setIsModalOpen(false);
      setSelectedRoom(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save room');
    }
  };

  const handleDelete = async (roomNumber: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await roomAPI.deleteRoom(roomNumber);
      await loadInitialData();
    } catch (error) {
      setError('Failed to delete room');
    }
  };

  const handleMaintenance = async (room: Room) => {
    try {
      await roomAPI.updateMaintenance(room.room_number, {
        status: 'maintenance',
        last_maintenance_date: new Date().toISOString(),
        next_maintenance_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      await loadInitialData();
    } catch (error) {
        console.log(error);
        
      setError('Failed to update maintenance status');
    }
  };

  const handleStatusChange = async (room: Room, newStatus: Room['status']) => {
    try {
      await roomAPI.updateStatus(room.room_number, newStatus);
      await loadInitialData();
    } catch (error) {
      setError('Failed to update room status');
    }
  };

  const StatusDropdown = ({ room }: { room: Room }) => (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
        room.status === 'available' ? 'text-green-500' :
        room.status === 'in_use' ? 'text-blue-500' :
        'text-yellow-500'
      }`}>
        {room.status}
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => handleStatusChange(room, 'available')}
          className="text-green-500"
        >
          Available
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(room, 'in_use')}
          className="text-blue-500"
        >
          In Use
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange(room, 'maintenance')}
          className="text-yellow-500"
        >
          Maintenance
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <PlusCircle className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.room_id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">{room.room_number}</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(room.room_number)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMaintenance(room)}
                  className="p-2 text-yellow-500 hover:bg-yellow-50 rounded"
                >
                  <Wrench className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-gray-500">Type</div>
                <div className="text-sm font-medium">{room.room_type}</div>
                <div className="text-sm text-gray-500">Capacity</div>
                <div className="text-sm font-medium">{room.capacity}</div>
                <div className="text-sm text-gray-500">Floor</div>
                <div className="text-sm font-medium">{room.floor_number}</div>
                <div className="text-sm text-gray-500">Status</div>
                <div>
                  <StatusDropdown room={room} />
                </div>
                <div className="text-sm text-gray-500">Next Maintenance</div>
                <div className="text-sm font-medium">
                  {formatDate(room.next_maintenance_date)}
                </div>
                
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>
          <RoomForm
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedRoom(null);
            }}
            initialData={selectedRoom || initialFormState}
            buildings={buildings}
            selectedRoom={selectedRoom}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagement;