import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { domain } from '@/lib/constant';

export default function ScheduleViewer() {
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = ['1', '2', '3', '4', '5'];
  const dayNames = {
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday'
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${domain}/api/v1/schedule/latest`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setScheduleData(result.data);
      setSections(Object.keys(result.data));
      if (Object.keys(result.data).length > 0) {
        setSelectedSection(Object.keys(result.data)[0]);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueTimeslots = () => {
    if (!scheduleData || !selectedSection) return [];
    
    const allTimes = Object.values(scheduleData[selectedSection].classes)
      .map(classInfo => format(new Date(classInfo.startTime), 'HH:mm'))
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    
    return allTimes;
  };

  const getCellContent = (day, time) => {
    if (!scheduleData || !selectedSection) return null;

    const classes = scheduleData[selectedSection].classes;
    const classInfo = Object.values(classes).find(c => 
      c.dayOfWeek === day && 
      format(new Date(c.startTime), 'HH:mm') === time
    );

    if (!classInfo) return null;

    return (
      <div className="p-2 text-xs">
        <p className="font-medium">{classInfo.course}</p>
        <p>Faculty: {classInfo.faculty.name}</p>
        <p>Room: {classInfo.room.number}</p>
        <p className="text-gray-500">
          {format(new Date(classInfo.startTime), 'HH:mm')} - 
          {format(new Date(classInfo.endTime), 'HH:mm')}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Class Schedule</span>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {scheduleData[section].sectionInfo.departmentName} - {scheduleData[section].sectionInfo.sectionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Time</TableHead>
                {days.map((day) => (
                  <TableHead key={day}>{dayNames[day]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {getUniqueTimeslots().map((time) => (
                <TableRow key={time}>
                  <TableCell className="font-medium">{time}</TableCell>
                  {days.map((day) => (
                    <TableCell key={`${day}-${time}`} className="min-w-[200px]">
                      {getCellContent(day, time)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}