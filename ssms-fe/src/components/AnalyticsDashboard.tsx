import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SubjectData {
  subject: string;
  averageScore: number;
  attendanceRate: number;
}

const dummyData: SubjectData[] = [
  { subject: 'Math', averageScore: 75, attendanceRate: 90 },
  { subject: 'Science', averageScore: 82, attendanceRate: 88 },
  { subject: 'History', averageScore: 78, attendanceRate: 85 },
  { subject: 'English', averageScore: 80, attendanceRate: 92 },
  { subject: 'Art', averageScore: 88, attendanceRate: 95 },
];

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Class Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dummyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="averageScore" fill="#8884d8" name="Average Score" />
              <Bar yAxisId="right" dataKey="attendanceRate" fill="#82ca9d" name="Attendance Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Average Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dummyData.map((item) => (
                <li key={item.subject} className="flex justify-between items-center">
                  <span>{item.subject}</span>
                  <span className="font-semibold">{item.averageScore}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dummyData.map((item) => (
                <li key={item.subject} className="flex justify-between items-center">
                  <span>{item.subject}</span>
                  <span className="font-semibold">{item.attendanceRate}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;