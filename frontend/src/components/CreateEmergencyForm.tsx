import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { domain } from '@/lib/constant';
import { useAuth } from '@/services/AuthContext';
import { Room } from '@/interface/general';

const CreateEmergencyForm = () => {
    const {user} = useAuth();
    const [rooms,setrooms] = useState<Room[]>([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch(`${domain}/api/v1/room/list-of-rooms`);
                if (!response.ok) {
                    throw new Error('Failed to fetch rooms');
                }
                const data = await response.json();
                console.log(data);
                
                setrooms(data.data);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        fetchRooms();
    }, []);
  const [formData, setFormData] = useState({
    type: '',
    severity: 'low',
    location_id: '',
    description: '',
    reported_by: user?.user_id,
    status: 'active'
  });

  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: false,
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${domain}/api/v1/emergency/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create emergency alert');
      }

      const data = await response.json();
      setSubmitStatus({
        success: true,
        error: false,
        message: 'Emergency alert created successfully!'
      });

      // Reset form after successful submission
      setFormData({
        type: '',
        severity: 'low',
        location_id: '',
        description: '',
        reported_by: user?.user_id,
        status: 'active'
      });

    } catch (error) {
      setSubmitStatus({
        success: false,
        error: true,
        message: 'Failed to create emergency alert. Please try again.'
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Emergency Alert</h2>

      {submitStatus.success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">{submitStatus.message}</AlertTitle>
        </Alert>
      )}

      {submitStatus.error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">{submitStatus.message}</AlertTitle>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Emergency Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          >
            <option value="">Select Type</option>
            <option value="fire">Fire</option>
            <option value="security">Security</option>
            <option value="medical">Medical</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
            Severity
          </label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
                <label htmlFor="location_id">Location</label>
                <select
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleInputChange}
                >
                    <option value="">Select a room</option>
                    {rooms.map(room => (
                        <option key={room.room_id} value={room.room_id}>
                            {room.room_number} - {room.room_type}
                        </option>
                    ))}
                </select>
            </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          />
        </div>

        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Emergency Alert
        </button>
      </form>
    </div>
  );
};

export default CreateEmergencyForm;