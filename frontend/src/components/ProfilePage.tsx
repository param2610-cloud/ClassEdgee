import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, GraduationCap, Book, CalendarDays, Phone, Mail, School } from 'lucide-react';

const ProfilePageComponent = ({ profileData }) => {
  if (!profileData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const {
    first_name,
    last_name,
    email,
    phone_number,
    college_uid,
    faculty,
    departments
  } = profileData;

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{`${first_name} ${last_name}`}</h3>
                  <p className="text-sm text-gray-500">{college_uid}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{phone_number}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments?.map((dept) => (
                <div key={dept.department_id} className="space-y-2">
                  <h3 className="text-lg font-semibold">{dept.department_name}</h3>
                  <p className="text-sm text-gray-500">Department Code: {dept.department_code}</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{dept.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{dept.contact_phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <School className="h-4 w-4" />
                    Designation
                  </h3>
                  <p className="mt-1">{faculty?.designation}</p>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Expertise
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {faculty?.expertise.map((exp, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Qualifications
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {faculty?.qualifications.map((qual, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Joining Details
                  </h3>
                  <p className="mt-1">Joined: {new Date(faculty?.joining_date).toLocaleDateString()}</p>
                  <p>Contract End: {new Date(faculty?.contract_end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    Research Interests
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {faculty?.research_interests.map((interest, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePageComponent;