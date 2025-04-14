import React, { useState, useEffect } from 'react';
import { Building } from '@/interface/general';
import { roomAPI } from '../rooms/API';
import { PlusCircle, Edit2, Building as BuildingIcon } from 'lucide-react';
import { useAtom } from 'jotai';
import { institutionIdAtom } from '@/store/atom';

interface BuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  building?: Building;
  onSubmit: (data: Partial<Building>) => Promise<void>;
}

const BuildingModal: React.FC<BuildingModalProps> = ({ 
  isOpen, onClose, building, onSubmit 
}) => {
  const [formData, setFormData] = useState<Partial<Building>>({
    building_name: '',
    floors: 1,
    location_coordinates: { x: 0, y: 0 }
  });
  console.log(isOpen);
  

  useEffect(() => {
    if (building) {
      setFormData(building);
    }
  }, [building]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Building Name</label>
            <input
              type="text"
              value={formData.building_name}
              onChange={e => setFormData(prev => ({ ...prev, building_name: e.target.value }))}
              className="mt-1 w-full rounded border p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Floors</label>
            <input
              type="number"
              value={formData.floors}
              onChange={e => setFormData(prev => ({ ...prev, floors: parseInt(e.target.value) || 1 }))}
              className="mt-1 w-full rounded border p-2"
              required
              min="1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-500 rounded"
            >
              {building ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BuildingManagement: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | undefined>();

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const response = await roomAPI.getBuildings();
      setBuildings(response.data.data || []);
    } catch (error) {
      console.error('Error loading buildings:', error);
    }
  };
const [institution_id] = useAtom(institutionIdAtom)
  const handleSubmit = async (data: Partial<Building>) => {
    try {
      if(institution_id === null) return
      if (selectedBuilding) {
        data.institution_id = institution_id;
        await roomAPI.updateBuilding(selectedBuilding.building_id.toString(), data); // Update building if selected
      } else {
        await roomAPI.createBuilding(data); // Create new building if none selected
      }
      await loadBuildings();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting building:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buildings</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          <PlusCircle className="w-4 h-4" />
          Add Building
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map((building) => (
          <div key={building.building_id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BuildingIcon className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium">{building.building_name}</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedBuilding(building);
                  setIsModalOpen(true);
                }}
                className="p-1 text-gray-500 hover:text-blue-500"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Floors: {building.floors}</p>
              <p>Rooms: {building.rooms?.length || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <BuildingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBuilding(undefined);
          }}
          building={selectedBuilding}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default BuildingManagement;