import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Users, BookOpen, Bell, HelpCircle, PieChart, LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  route: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon: Icon, color, route }) => {
  const navigate = useNavigate();
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className={`text-white ${color}`}>
        <CardTitle className="flex items-center gap-2">
          <Icon size={24} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
        <Button variant="outline" className="mt-4" onClick={() => navigate(route)}>
          Go to {title}
        </Button>
      </CardContent>
    </Card>
  );
};

interface DashboardFeature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  route: string;
}

const dashboardFeatures: DashboardFeature[] = [
  {
    title: "Attendance",
    description: "Mark and manage student attendance",
    icon: Users,
    color: "bg-blue-500",
    route: "/attendance"
  },
  {
    title: "Resources",
    description: "Manage and access educational resources",
    icon: BookOpen,
    color: "bg-green-500",
    route: "/resources"
  },
  {
    title: "Alerts",
    description: "Stay updated with important notifications",
    icon: Bell,
    color: "bg-yellow-500",
    route: "/alerts"
  },
  {
    title: "Interactive Quiz",
    description: "Engage students with interactive quizzes",
    icon: HelpCircle,
    color: "bg-purple-500",
    route: "/quiz"
  },
  {
    title: "Analytics",
    description: "View and analyze performance metrics",
    icon: BarChart,
    color: "bg-red-500",
    route: "/analytics"
  },
  {
    title: "SCMS Assistant",
    description: "Get help from our AI-powered chatbot",
    icon: PieChart,
    color: "bg-indigo-500",
    route: "/chatbot"
  }
];

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Welcome to SCMS Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardFeatures.map((feature, index) => (
          <DashboardCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;