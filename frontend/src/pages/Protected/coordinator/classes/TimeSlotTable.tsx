import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { domain } from '@/lib/constant';

const TimeslotManagement = () => {
  const [timeslots, setTimeslots] = useState([]);
  const [newTimeslot, setNewTimeslot] = useState({
    start_time: '',
    end_time: '',
    day_of_week: '',
    slot_type: 'regular'
  });
  const [error, setError] = useState(null);

  // Fetch timeslots on component mount
  useEffect(() => {
    fetchTimeslots();
  }, []);

  const fetchTimeslots = async () => {
    try {
      const response = await axios.get(`${domain}/api/v1/timeslots`);
      console.log('API Response:', response.data.data);
      setTimeslots(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch timeslots');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTimeslot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createTimeslot = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/v1/timeslots', newTimeslot);
      //setTimeslots((prevTimeslots) => [...prevTimeslots, response.data.data]);
      fetchTimeslots(); // Refresh list
      // Reset form
      setNewTimeslot({
        start_time: '',
        end_time: '',
        day_of_week: '',
        slot_type: 'regular'
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create timeslot');
      console.error(err);
    }
  };

  const deleteTimeslot = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/timeslots/${id}`);
      fetchTimeslots(); // Refresh list
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete timeslot');
      console.error(err);
    }
  };

  const daysOfWeek = [
    'Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Timeslot Management</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-100 text-red-800 p-2 mb-4 rounded">
            {error}
          </div>
        )}
        
        {/* Create Timeslot Form */}
        <form onSubmit={createTimeslot} className="grid gap-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Start Time</label>
              <Input
                type="time"
                step="1"
                name="start_time"
                value={newTimeslot.start_time}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>End Time</label>
              <Input
                type="time"
                step="1"
                name="end_time"
                value={newTimeslot.end_time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Day of Week</label>
              <Select
                name="day_of_week"
                value={newTimeslot.day_of_week}
                onValueChange={(value) => setNewTimeslot(prev => ({
                  ...prev,
                  day_of_week: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Slot Type</label>
              <Select
                name="slot_type"
                value={newTimeslot.slot_type}
                onValueChange={(value) => setNewTimeslot(prev => ({
                  ...prev,
                  slot_type: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Slot Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">Create Timeslot</Button>
        </form>

        {/* Timeslot List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Existing Timeslots</h3>
          {timeslots.length === 0 ? (
            <p>No timeslots found</p>
          ) : (
            <div className="grid gap-2">
              {timeslots.map((slot) => (
                <div 
                  key={slot.slot_id} 
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <span className="font-medium">
                      {daysOfWeek[slot.day_of_week]}: 
                    </span>
                    {` ${slot.start_time} - ${slot.end_time}`}
                    {slot.slot_type !== 'regular' && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({slot.slot_type})
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteTimeslot(slot.slot_id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeslotManagement;