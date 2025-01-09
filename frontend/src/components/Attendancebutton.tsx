
import VideoAttendanceUpload from './AttendanceComponent';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

const AttendanceButton = ({ sectionId, classId }:{sectionId:number, classId:number}) => {
    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button>Open Attendance</Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader>
                        <SheetTitle>Attendance</SheetTitle>
                        <SheetDescription>Upload a video to process attendance</SheetDescription>
                    </SheetHeader>
                    {
                        classId && sectionId && <VideoAttendanceUpload sectionId={sectionId} classId={classId} />
                    }
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default AttendanceButton;