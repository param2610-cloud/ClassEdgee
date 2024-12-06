import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  User, Mail, Phone, School, GraduationCap, 
  Users, BookOpen, Building2, Camera,
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAtom } from 'jotai';
import { user_idAtom, userDataAtom } from '@/store/atom';
import { domain } from '@/lib/constant';
import { Note } from '@/interface/general';
import FaceVerification from './VerificationDialog';

// Mock Data


const StudentProfile = () => {
  // State Management
  const [user_id] = useAtom(user_idAtom)
  const [studentData,setStudentData] = useAtom(userDataAtom)
  const [loading, setLoading] = useState(true);
  console.log("studentData:",studentData);
  
  const fetchStudentData = async () => {
    try {
      const studentResponse = await fetch(`${domain}/api/v1/student/get-student/${user_id}`);
      const studentData = await studentResponse.json();
      console.log("studentData:",studentData);
      setStudentData(studentData.data);
      
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }
  useEffect(() => {
    if(user_id && !studentData){
      fetchStudentData()
    }
  },[user_id,studentData])
  

  // Component: Profile Header Section
  const ProfileHeader = () => (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src="/api/placeholder/150/150" />
            <AvatarFallback className="text-2xl">
              {studentData?.first_name[0]}{studentData?.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">
              {studentData?.first_name} {studentData?.last_name}
            </h1>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center md:justify-start">
              <Badge variant="secondary" className="flex items-center gap-1">
                <School className="w-4 h-4" />
                {studentData?.students?.sections?.departments?.department_code}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                Semester {studentData?.students?.current_semester}
              </Badge>
            </div>
          </div>
          {
            user_id && 
            <FaceVerification user_id={user_id}/>
          }
        </div>
      </CardContent>
    </Card>
  );

  // Component: Personal Information Tab
  const PersonalInfoTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField icon={<User className="w-4 h-4" />} label="Full Name" 
            value={`${studentData?.first_name}  ${studentData?.last_name}`} />
          <InfoField icon={<Mail className="w-4 h-4" />} label="Email" 
            value={studentData?.email} />
          <InfoField icon={<Phone className="w-4 h-4" />} label="Phone" 
            value={studentData?.phone_number} />
          <InfoField icon={<Users className="w-4 h-4" />} label="Guardian" 
            value={studentData?.students?.guardian_name} />
        </div>
      </CardContent>
    </Card>
  );

  // Component: Academic Information Tab
  const AcademicInfoTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Academic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField icon={<School className="w-4 h-4" />} label="Department" 
            value={studentData?.students?.departments?.department_name} />
          <InfoField icon={<GraduationCap className="w-4 h-4" />} label="Semester" 
            value={studentData?.students?.current_semester} />
          <InfoField icon={<Users className="w-4 h-4" />} label="Section" 
            value={studentData?.students?.sections?.section_name} />
          <InfoField icon={<BookOpen className="w-4 h-4" />} label="Batch" 
            value={studentData?.students?.batch_year} />
        </div>
      </CardContent>
    </Card>
  );

  // Component: Institution Information Tab
  const InstitutionInfoTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Institution Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground mt-1" />
            <div>
              <span className="text-sm text-muted-foreground block">Institution:</span>
              <span className="font-medium">{studentData?.institutions?.name}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-muted-foreground mt-1" />
            <div>
              <span className="text-sm text-muted-foreground block">Address:</span>
              <span className="font-medium">{studentData?.institutions?.address}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Component: Notes Tab
  const NotesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-4">
            {studentData?.notes?.map((note: Note, index: number) => (
              <Card key={index} className="p-4">
                <h3 className="font-semibold mb-2">{note.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                <div className="flex gap-2">
                  {note.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Utility Component: Info Field
  const InfoField = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span>{value}</span>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <ProfileHeader />
      
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="institution">Institution</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="personal"><PersonalInfoTab /></TabsContent>
        <TabsContent value="academic"><AcademicInfoTab /></TabsContent>
        <TabsContent value="institution"><InstitutionInfoTab /></TabsContent>
        <TabsContent value="notes"><NotesTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProfile;