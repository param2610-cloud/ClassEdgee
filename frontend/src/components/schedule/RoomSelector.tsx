import { fetchRooms } from '@/api/scheduling-api/fetch';
import { Room } from '@/interface/general';
import React, { useEffect, useMemo, useState } from 'react';
const RoomSelector: React.FC<{
    slotId: number;
    onChange: (id: number) => void;
  }> = ({ slotId, onChange }) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      const loadRooms = async () => {
        setIsLoading(true);
        try {
          const data = await fetchRooms(slotId, selectedBuilding);
          setRooms(data);
        } catch (error) {
          console.error('Error loading rooms:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      loadRooms();
    }, [slotId, selectedBuilding]);
  
    const buildings = useMemo(() => 
      [...new Set(rooms.map(r => ({id: r.buildingId, name: r.buildingName})))],
      [rooms]
    );
  
    if (isLoading) return <div>Loading rooms...</div>;
  
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Building</label>
          <select 
            onChange={e => setSelectedBuilding(e.target.value ? Number(e.target.value) : null)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Buildings</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label className="block mb-1">Room</label>
          <select 
            onChange={e => onChange(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Room</option>
            {rooms.map(room => (
              <option
                key={room.id}
                value={room.id}
                disabled={!room.isAvailable}
              >
                {room.roomNumber} - {room.type} 
                (Capacity: {room.capacity})
                {!room.isAvailable && ' (Occupied)'}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };
  export default RoomSelector;