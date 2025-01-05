import React, { useState, useEffect } from 'react';
import { AlertCircle, Edit, Hammer, Plus, } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';
import { domain } from '@/lib/constant';

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState([]);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    room_id: '',
    serial_number: '',
    purchase_date: '',
    warranty_end_date: '',
    specifications: '',
    maintenance_schedule: ''
  });

  const fetchEquipment = async () => {
    try {
      const { data } = await axios.get(`${domain}/api/v1/equipment`);
      setEquipment(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${domain}/api/v1/equipment`, formData);
      fetchEquipment();
      setFormData({
        name: '',
        type: '',
        room_id: '',
        serial_number: '',
        purchase_date: '',
        warranty_end_date: '',
        specifications: '',
        maintenance_schedule: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(`${domain}/api/v1/equipment/${id}`, { status });
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleMaintenance = async (id, date) => {
    try {
      await axios.post(`${domain}/api/v1/equipment/${id}/maintenance`, { maintenance_date: date });
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const startEdit = (item) => {
    setEditMode(item.equipment_id);
    setEditData({
      name: item.name,
      type: item.type,
      room_id: item.room_id,
      serial_number: item.serial_number,
      specifications: item.specifications,
      maintenance_schedule: item.maintenance_schedule
    });
  };

  const cancelEdit = () => {
    setEditMode(null);
    setEditData(null);
  };

  const saveEdit = async (id) => {
    try {
      await axios.patch(`${domain}/api/v1/equipment/${id}`, editData);
      fetchEquipment();
      setEditMode(null);
      setEditData(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Equipment Management</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-4 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New Equipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Type"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Room ID"
            value={formData.room_id}
            onChange={(e) => setFormData({...formData, room_id: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Serial Number"
            value={formData.serial_number}
            onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            placeholder="Purchase Date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
            className="p-2 border rounded"
          />
          <input
            type="date"
            placeholder="Warranty End Date"
            value={formData.warranty_end_date}
            onChange={(e) => setFormData({...formData, warranty_end_date: e.target.value})}
            className="p-2 border rounded"
          />
          <textarea
            placeholder="Specifications"
            value={formData.specifications}
            onChange={(e) => setFormData({...formData, specifications: e.target.value})}
            className="p-2 border rounded"
          />
          <textarea
            placeholder="Maintenance Schedule"
            value={formData.maintenance_schedule}
            onChange={(e) => setFormData({...formData, maintenance_schedule: e.target.value})}
            className="p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Equipment
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((item) => (
          <div key={item.equipment_id} className="border rounded-lg p-4 space-y-2 bg-white shadow-sm">
            {editMode === item.equipment_id ? (
              <>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="p-2 border rounded w-full mb-2"
                />
                <input
                  type="text"
                  value={editData.type}
                  onChange={(e) => setEditData({...editData, type: e.target.value})}
                  className="p-2 border rounded w-full mb-2"
                />
                <input
                  type="text"
                  value={editData.serial_number}
                  onChange={(e) => setEditData({...editData, serial_number: e.target.value})}
                  className="p-2 border rounded w-full mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(item.equipment_id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <button
                    onClick={() => startEdit(item)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600">Type: {item.type}</p>
                <p className="text-gray-600">Serial: {item.serial_number}</p>
                <p className="text-gray-600">Room: {item.room_id}</p>
                <div className="flex gap-2 mt-4">
                  <select
                    value={item.status || ''}
                    onChange={(e) => handleStatusUpdate(item.equipment_id, e.target.value)}
                    className="p-2 border rounded flex-1"
                  >
                    <option value="">Select Status</option>
                    <option value="available">Available</option>
                    <option value="in_use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <button
                    onClick={() => handleMaintenance(item.equipment_id, new Date().toISOString().split('T')[0])}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                    title="Schedule Maintenance"
                  >
                    <Hammer className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentManagement;