import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { domain } from '@/lib/constant';

// Define interfaces for our data types
interface Timeslot {
  slot_id: string | number;
  start_time: string;
  end_time: string;
  day_of_week: string | number;
  slot_type: string;
}

interface NewTimeslot {
  start_time: string;
  end_time: string;
  day_of_week: string;
  slot_type: string;
}

interface BatchTimeslot {
  start_time: string;
  end_time: string;
  break_start_time: string;
  break_end_time: string;
  period_duration: string;
  days: string[];
  academic_year: string;
  semester: string;
}

const TimeslotManagement = () => {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // State for manual creation
  const [newTimeslot, setNewTimeslot] = useState<NewTimeslot>({
    start_time: '',
    end_time: '',
    day_of_week: '',
    slot_type: 'regular'
  });

  // State for batch creation
  const [batchTimeslot, setBatchTimeslot] = useState<BatchTimeslot>({
    start_time: '',
    end_time: '',
    break_start_time: '',
    break_end_time: '',
    period_duration: '',
    days: [],
    academic_year: '',
    semester: ''
  });

  useEffect(() => {
    fetchTimeslots();
  }, []);

  const fetchTimeslots = async () => {
    try {
      const response = await axios.get(`${domain}/api/v1/timeslots`);
      setTimeslots(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch timeslots');
      console.error(err);
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTimeslot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBatchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBatchTimeslot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDaySelection = (day: string) => {
    setBatchTimeslot(prev => {
      const currentDays = [...prev.days];
      const dayIndex = currentDays.indexOf(day);
      
      if (dayIndex === -1) {
        currentDays.push(day);
      } else {
        currentDays.splice(dayIndex, 1);
      }
      
      return {
        ...prev,
        days: currentDays
      };
    });
  };

  const createManualTimeslot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${domain}/api/v1/timeslots`, newTimeslot);
      fetchTimeslots();
      setNewTimeslot({
        start_time: '',
        end_time: '',
        day_of_week: '',
        slot_type: 'regular'
      });
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to create timeslot';
      setError(typeof err === 'object' && err !== null && 'response' in err 
        ? (err.response as any)?.data?.message || errorMessage
        : errorMessage);
      console.error(err);
    }
  };

  const createBatchTimeslots = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${domain}/api/v1/timeslots/batch`, batchTimeslot);
      fetchTimeslots();
      setBatchTimeslot({
        start_time: '',
        end_time: '',
        break_start_time: '',
        break_end_time: '',
        period_duration: '',
        days: [],
        academic_year: '',
        semester: ''
      });
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to create batch timeslots';
      setError(typeof err === 'object' && err !== null && 'response' in err 
        ? (err.response as any)?.data?.message || errorMessage
        : errorMessage);
      console.error(err);
    }
  };

  const deleteTimeslot = async (id: string | number) => {
    try {
      await axios.delete(`${domain}/api/v1/timeslots/${id}`);
      fetchTimeslots();
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to delete timeslot';
      setError(typeof err === 'object' && err !== null && 'response' in err 
        ? (err.response as any)?.data?.message || errorMessage
        : errorMessage);
      console.error(err);
    }
  };

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
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

        <Tabs defaultValue="manual" className="mb-6">
          <TabsList className="grid grid-cols-2 w-64">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="batch">Batch Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={createManualTimeslot} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Start Time</label>
                  <Input
                    type="time"
                    step="1"
                    name="start_time"
                    value={newTimeslot.start_time}
                    onChange={handleManualInputChange}
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
                    onChange={handleManualInputChange}
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
                      <SelectItem value="break">Break</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">Create Timeslot</Button>
            </form>
          </TabsContent>

          <TabsContent value="batch">
            <form onSubmit={createBatchTimeslots} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Start Time</label>
                  <Input
                    type="time"
                    step="1"
                    name="start_time"
                    value={batchTimeslot.start_time}
                    onChange={handleBatchInputChange}
                    required
                  />
                </div>
                <div>
                  <label>End Time</label>
                  <Input
                    type="time"
                    step="1"
                    name="end_time"
                    value={batchTimeslot.end_time}
                    onChange={handleBatchInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Break Start Time</label>
                  <Input
                    type="time"
                    step="1"
                    name="break_start_time"
                    value={batchTimeslot.break_start_time}
                    onChange={handleBatchInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Break End Time</label>
                  <Input
                    type="time"
                    step="1"
                    name="break_end_time"
                    value={batchTimeslot.break_end_time}
                    onChange={handleBatchInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Period Duration (minutes)</label>
                  <Input
                    type="number"
                    name="period_duration"
                    value={batchTimeslot.period_duration}
                    onChange={handleBatchInputChange}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label>Academic Year</label>
                  <Input
                    type="text"
                    name="academic_year"
                    value={batchTimeslot.academic_year}
                    onChange={handleBatchInputChange}
                    required
                    placeholder="e.g., 2023-2024"
                  />
                </div>
              </div>

              <div>
                <label>Semester</label>
                <Select
                  name="semester"
                  value={batchTimeslot.semester}
                  onValueChange={(value) => setBatchTimeslot(prev => ({
                    ...prev,
                    semester: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-2">Select Days</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={batchTimeslot.days.includes(index.toString()) ? "default" : "outline"}
                      onClick={() => handleDaySelection(index.toString())}
                      className="w-24"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">Create Batch Timeslots</Button>
            </form>
          </TabsContent>
        </Tabs>

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
                      {daysOfWeek[slot.day_of_week as number]}: 
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