import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Info, 
  Search 
} from 'lucide-react';
import { domain } from '@/lib/constant';

const Createroom = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    room_type: 'classroom',
    capacity: '',
    floor_number: 1,
    wing: '',
    area_sqft: '',
    features: null
  });

  const roomTypes = [
    'classroom', 
    'lab', 
    'seminar_hall', 
    'auditorium'
  ];

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${domain}/api/v1/room/floors/${selectedFloor}`);
      setRooms(response.data.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedFloor]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for backend
      const payload = {
        room_number: roomForm.room_number,
        room_type: roomForm.room_type,
        capacity: parseInt(roomForm.capacity),
        floor_number: selectedFloor,
        wing: roomForm.wing || null,
        area_sqft: roomForm.area_sqft ? parseFloat(roomForm.area_sqft) : null,
        features: roomForm.features ? JSON.parse(JSON.stringify(roomForm.features)) : null
      };

      if (selectedRoom) {
        // Update existing room
        await axios.put(`${domain}/api/v1/room/${roomForm.room_number}`, payload);
      } else {
        // Create new room
        await axios.post(`${domain}/api/v1/room`, payload);
      }

      fetchRooms();
      setIsModalOpen(false);
      // Reset form
      setRoomForm({
        room_number: '',
        room_type: 'classroom',
        capacity: '',
        floor_number: 1,
        wing: '',
        area_sqft: '',
        features: null
      });
    } catch (error) {
      console.error('Failed to create/update room:', error.response ? error.response.data : error);
      alert(error.response ? error.response.data.message : 'An error occurred');
    }
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setRoomForm({
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity.toString(),
      floor_number: room.floor_number,
      wing: room.wing || '',
      area_sqft: room.area_sqft ? room.area_sqft.toString() : '',
      features: room.features || null
    });
    setIsModalOpen(true);
  };

  const handleDeleteRoom = async (roomNumber) => {
    try {
      await axios.delete(`${domain}/api/v1/room/${roomNumber}`);
      fetchRooms();
    } catch (error) {
      console.error('Failed to delete room:', error);
      alert(error.response ? error.response.data.message : 'An error occurred');
    }
  };

  const renderRoomCard = (room) => (
    <div 
      key={room.room_number} 
      className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-all"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-blue-700">
          Room {room.room_number}
        </h3>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
          {room.room_type}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>Capacity: {room.capacity} persons</p>
        <p>Floor: {room.floor_number} | Wing: {room.wing || 'N/A'}</p>
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => handleEditRoom(room)}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit size={20} />
          </button>
          <button 
            onClick={() => handleDeleteRoom(room.room_number)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Building className="mr-4 text-blue-600" size={40} />
        <h1 className="text-3xl font-bold text-gray-800">Room Management</h1>
      </div>

      <div className="flex mb-6">
        {[1, 2, 3, 4, 5].map(floor => (
          <button
            key={floor}
            onClick={() => setSelectedFloor(floor)}
            className={`
              mr-2 px-4 py-2 rounded-full transition-all
              ${selectedFloor === floor 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-blue-200'
              }
            `}
          >
            Floor {floor}
          </button>
        ))}
        <button 
          onClick={() => {
            setSelectedRoom(null);
            setRoomForm({
              room_number: '',
              room_type: 'classroom',
              capacity: '',
              floor_number: selectedFloor,
              wing: '',
              area_sqft: '',
              features: null
            });
            setIsModalOpen(true);
          }}
          className="ml-auto bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 flex items-center"
        >
          <Plus className="mr-2" size={20} /> Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length > 0 ? (
          rooms.map(renderRoomCard)
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No rooms found on this floor.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedRoom ? 'Edit Room' : 'Create Room'}
            </h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <input
                type="text"
                placeholder="Room Number"
                value={roomForm.room_number}
                onChange={(e) => setRoomForm({...roomForm, room_number: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <select
                value={roomForm.room_type}
                onChange={(e) => setRoomForm({...roomForm, room_type: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              >
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Capacity"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Wing (optional)"
                value={roomForm.wing}
                onChange={(e) => setRoomForm({...roomForm, wing: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Area (sq ft) (optional)"
                value={roomForm.area_sqft}
                onChange={(e) => setRoomForm({...roomForm, area_sqft: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="flex space-x-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  {selectedRoom ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Createroom;