import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader
} from '@/components/ui/table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { domain } from '@/lib/constant';
import { CalendarDays, Filter, Loader2 } from 'lucide-react';

interface ScheduleData {
  class_id: number;
  subject_name: string;
  faculty_name: string;
  room_number: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

const ScheduleViewer: React.FC = () => {
  const { section_id } = useParams<{ section_id: string }>();
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([]);
  const [filteredData, setFilteredData] = useState<ScheduleData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${domain}/api/v1/schedule/section/12`
        );
        const data = await response.json();
        
        const formattedSchedule = data.classes.map((item: any) => ({
          subject_name: item.course_id,
          faculty_name: item.faculty.designation,
          room_number: item?.rooms?.room_number,
          start_time: item.timeslots.start_time.split('T')[1].substring(0, 5),
          end_time: item.timeslots.end_time.split('T')[1].substring(0, 5),
          day_of_week: item.timeslots.day_of_week,
        }));
        
        setScheduleData(formattedSchedule);
        setFilteredData(formattedSchedule);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [section_id]);

  useEffect(() => {
    let result = scheduleData;
    
    if (searchTerm) {
      result = result.filter(item => 
        item.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.room_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dayFilter !== null) {
      result = result.filter(item => item.day_of_week === dayFilter);
    }
    
    setFilteredData(result);
  }, [searchTerm, dayFilter, scheduleData]);

  const resetFilters = () => {
    setSearchTerm('');
    setDayFilter(null);
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Card className="w-full border shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Class Schedule</CardTitle>
        </div>
        <CardDescription>
          View and filter your class schedule for the current semester
        </CardDescription>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Search subjects, faculty or rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {days.map((day, index) => (
              <Button
                key={index}
                variant={dayFilter === index ? "default" : "outline"}
                size="sm"
                onClick={() => setDayFilter(dayFilter === index ? null : index)}
              >
                {day.slice(0, 3)}
              </Button>
            ))}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <Filter className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No schedule data found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-medium">Subject</TableCell>
                  <TableCell className="font-medium">Faculty</TableCell>
                  <TableCell className="font-medium">Room</TableCell>
                  <TableCell className="font-medium">Time</TableCell>
                  <TableCell className="font-medium">Day</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                    <TableCell className="font-medium">{item.subject_name}</TableCell>
                    <TableCell>{item.faculty_name}</TableCell>
                    <TableCell>{item.room_number || 'TBD'}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                        {item.start_time} - {item.end_time}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {days[item.day_of_week]}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleViewer;