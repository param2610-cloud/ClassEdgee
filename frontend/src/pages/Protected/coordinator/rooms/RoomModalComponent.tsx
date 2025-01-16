import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Room {
  room_number: string;
  room_type: string;
  capacity: number;
  floor_number: number;
  wing: string;
  building_id: string;
  area_sqft: number;
  features: Record<string, any>;
}

interface Building {
  building_id: string;
  building_name: string;
}

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room;
  buildings: Building[];
  onSubmit: (formData: Room) => void;
}

export default function RoomModal({ isOpen, onClose, room, buildings, onSubmit }: RoomModalProps) {
  const [formData, setFormData] = useState<Room>({
    room_number: '',
    room_type: 'classroom',
    capacity: 0,
    floor_number: 0,
    wing: '',
    building_id: '',
    area_sqft: 0,
    features: {},
  });

  useEffect(() => {
    if (room) {
      setFormData(room);
    }
  }, [room]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Room Number
            </label>
            <input
              type="text"
              name="room_number"
              value={formData.room_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Room Type
            </label>
            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="classroom">Classroom</option>
              <option value="lab">Lab</option>
              <option value="seminar_hall">Seminar Hall</option>
              <option value="auditorium">Auditorium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Building
            </label>
            <select
              name="building_id"
              value={formData.building_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Building</option>
              {buildings.map((building: Building) => (
                <option key={building.building_id} value={building.building_id}>
                  {building.building_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Floor Number
              </label>
              <input
                type="number"
                name="floor_number"
                value={formData.floor_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              {room ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}