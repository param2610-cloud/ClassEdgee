import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Class } from '@/interface/general';
import { useAuth } from '@/services/AuthContext';
import { domain } from '@/lib/constant';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const ListOfClass: React.FC = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                if (!user?.user_id) {
                    setError('User ID is required');
                    setLoading(false);
                    return;
                }
                const response = await axios.get(`${domain}/api/v1/faculty/classes/list-of-past-classes/${user.user_id}`);
                console.log("response:", response);
                setClasses(response.data);
            } catch (err) {
                setError('Failed to fetch classes');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [user?.user_id]);

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Past Classes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader>
                <CardTitle>Past Classes</CardTitle>
            </CardHeader>
            <CardContent>
                <Table className="">
                    <TableCaption>A list of your past classes.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.map((classItem) => (
                            <TableRow key={classItem.class_id}>
                                <TableCell className="font-medium">
                                    {classItem.courses?.course_name}
                                    <div className="text-sm text-gray-500">
                                        {classItem.courses?.course_code}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {classItem.sections?.section_name}
                                </TableCell>
                                <TableCell>
                                    {new Date(classItem.date_of_class).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {classItem.timeslots?.start_time?.toString()} - {classItem.timeslots?.end_time?.toString()}
                                </TableCell>
                                <TableCell>
                                    {classItem.rooms?.room_number}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={classItem.is_active ? "default" : "secondary"}>
                                        {classItem.is_active ? "Active" : "Completed"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default ListOfClass;