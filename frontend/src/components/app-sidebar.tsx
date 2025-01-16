import * as React from "react"
import { useLocation } from 'react-router-dom';
import { useAuth } from "@/services/AuthContext"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  GraduationCap,
  Settings,
  ClipboardList,
  FileText,
  Database,
  UserCog,
  Bell,
  School,
  User,
  Building,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import FacultySidebarHeader from "./nav-user"

const navigationConfig = {
  admin: [
    {
      title: "Dashboard",
      url: "/p/",
      icon: LayoutDashboard,
      items: [
        { title: "Overview", url: "/p/" },
        { title: "ID Generate", url: "/p/idgenerate" },
      ]
    },
    // Add more admin navigation items
  ],
  faculty: [
    {
      title: "Dashboard",
      url: "/p/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Overview", url: "/p/dashboard" },
        { title: "Activities", url: "/p/dashboard/activities" },
        { title: "Announcements", url: "/p/dashboard/announcements" },
      ]
    },
    {
      title: "Classes & Teaching",
      url: "/p/classes",
      icon: School,
      items: [
        { title: "Today's Classes", url: "/p/classes/today" },
        { title: "Class List", url: "/p/classes/list" },
        { title: "Attendance", url: "/p/classes/attendance" },
        { title: "Course Materials", url: "/p/classes/materials" },
        { title: "Student Queries", url: "/p/classes/queries" },
        { title: "Assessments", url: "/p/classes/assessments" },
      ]
    },
    {
      title: "Schedule",
      url: "/p/schedule",
      icon: Calendar,
      items: [
        { title: "Weekly View", url: "/p/schedule/weekly" },
        { title: "Manage Schedule", url: "/p/schedule/manage" },
        { title: "Subject Assignments", url: "/p/schedule/subjects" },
      ]
    },
    {
      title: "Academic Resources",
      url: "/p/resources",
      icon: BookOpen,
      items: [
        { title: "Course Dashboard", url: "/p/resources/courses" },
        { title: "Department Syllabus", url: "/p/resources/syllabus" },
        { title: "Teaching Resources", url: "/p/resources/teaching" },
        { title: "Notes Management", url: "/p/resources/notes" },
      ]
    },
    {
      title: "Administration",
      url: "/p/admin",
      icon: Database,
      items: [
        { title: "Section Management", url: "/p/admin/sections" },
        { title: "Attendance Reports", url: "/p/admin/attendance" },
        { title: "Performance Analytics", url: "/p/admin/analytics" },
      ]
    },
    {
      title: "Profile & Settings",
      url: "/p/settings",
      icon: Settings,
      items: [
        { title: "Personal Information", url: "/p/settings/profile" },
        { title: "Expertise Settings", url: "/p/settings/expertise" },
        { title: "Preferences", url: "/p/settings/preferences" },
      ]
    },
  ],
  student: [
    {
      title: "Dashboard",
      url: "/p/",
      icon: LayoutDashboard,
      items: [
        { title: "Overview", url: "/p/" },
        { title: "Classes", url: "/p/classes" },
        { title: "Calendar", url: "/p/calendar" },
      ]
    },
    // Add more student navigation items
  ],
  coordinator: [
    {
      title: "Dashboard",
      url: "/p/",
      icon: LayoutDashboard,
      items: [
      { title: "Overview", url: "/p/" },
      { title: "Emergency Alerts", url: "/p/emergency" }
      ]
    },
    {
      title: "Academic Management",
      url: "/p/academics",
      icon: GraduationCap,
      items: [
      { title: "Teachers", url: "/p/faculty" },
      { title: "Students", url: "/p/student" },
      { title: "Classes", url: "/p/classes" },
      { title: "Courses", url: "/p/course" }
      ]
    },
    {
      title: "Infrastructure",
      url: "/p/infrastructure", 
      icon: Building,
      items: [
      { title: "Departments", url: "/p/department" },
      { title: "Rooms", url: "/p/rooms" }
      ]
    },
    {
      title: "Monitoring",
      url: "/p/monitoring",
      icon: ClipboardList, 
      items: [
      { title: "Attendance", url: "/p/attendance" }
      ]
    }
    // Add more coordinator navigation items
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Don't render sidebar for non-protected routes
  if (!location.pathname.startsWith('/p/')) {
    return null;
  }

  const getNavigationItems = () => {
    if (!user?.role || isLoading) return [];
    return navigationConfig[user.role] || [];
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <FacultySidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavigationItems()} />
      </SidebarContent>
      <SidebarFooter>
        {/* Add footer content if needed */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
