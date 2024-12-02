import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {

  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {  Card,
    CardHeader,
    CardTitle,
    CardContent,}
    from '@/components/ui/card';
import { domain } from '@/lib/constant';


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

  useEffect(() => {
    const fetchSchedule = async () => {
        try {
        const response = await fetch(
          `${domain}/api/v1/schedule/section/12`
        );
        const data = await response.json();
        console.log(data.classes);
        const formattedSchedule = data.classes.map((item: any) => ({
            subject_name: item.course_id, // Assuming course_id is the subject name

          faculty_name: item.faculty.designation, // Assuming designation is the faculty name

           room_number: item?.rooms?.room_number,

            start_time: item.timeslots.start_time.split('T')[1].substring(0, 5),

             end_time: item.timeslots.end_time.split('T')[1].substring(0, 5),

              day_of_week: item.timeslots.day_of_week,
        }));
        console.log(formattedSchedule);
        
        setScheduleData(formattedSchedule);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    fetchSchedule();
  }, [section_id]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Schedule for Section {section_id}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Day</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scheduleData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.subject_name}</TableCell>
                <TableCell>{item.faculty_name}</TableCell>
                <TableCell>{item.room_number}</TableCell>
                <TableCell>
                  {item.start_time} - {item.end_time}
                </TableCell>
                <TableCell>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                    item.day_of_week
                  ]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ScheduleViewer;