import {
  BookOpen,
  Building,
  Calendar,
  ClipboardCheck,
  FileText,
  Home,
  LayoutDashboard,
  School,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import { AuthRole } from "@/store/auth.store";

export interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const roleNavigation: Record<AuthRole, NavItem[]> = {
  admin: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Coordinators", href: "/admin/coordinators", icon: Users },
    { title: "Emergency", href: "/admin/emergency", icon: ShieldAlert },
  ],
  coordinator: [
    { title: "Dashboard", href: "/coordinator", icon: LayoutDashboard },
    { title: "Students", href: "/coordinator/students", icon: Users },
    { title: "Faculty", href: "/coordinator/faculty", icon: School },
    { title: "Courses", href: "/coordinator/courses", icon: BookOpen },
    { title: "Timetable", href: "/coordinator/timetable", icon: Calendar },
    { title: "Departments", href: "/coordinator/departments", icon: FileText },
    { title: "Rooms", href: "/coordinator/rooms", icon: Building },
    { title: "Buildings", href: "/coordinator/buildings", icon: Building },
    { title: "Attendance", href: "/coordinator/attendance", icon: ClipboardCheck },
    { title: "Resources", href: "/coordinator/resources", icon: FileText },
    { title: "Emergency", href: "/coordinator/emergency", icon: ShieldAlert },
  ],
  faculty: [
    { title: "Dashboard", href: "/faculty", icon: LayoutDashboard },
    { title: "Classes", href: "/faculty/classes", icon: Home },
    { title: "Schedule", href: "/faculty/schedule", icon: Calendar },
    { title: "Attendance", href: "/faculty/attendance", icon: ClipboardCheck },
    { title: "Resources", href: "/faculty/resources", icon: FileText },
    { title: "Department", href: "/faculty/department", icon: Building },
    { title: "Courses", href: "/faculty/courses", icon: BookOpen },
    { title: "Profile", href: "/faculty/profile", icon: UserRound },
    { title: "Emergency", href: "/faculty/emergency", icon: ShieldAlert },
  ],
  student: [
    { title: "Dashboard", href: "/student", icon: LayoutDashboard },
    { title: "Classes", href: "/student/classes", icon: Home },
    { title: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
    { title: "Calendar", href: "/student/calendar", icon: Calendar },
    { title: "Notifications", href: "/student/notifications", icon: FileText },
    { title: "Feedback", href: "/student/feedback", icon: FileText },
    { title: "Profile", href: "/student/profile", icon: UserRound },
    { title: "Emergency", href: "/student/emergency", icon: ShieldAlert },
  ],
};
