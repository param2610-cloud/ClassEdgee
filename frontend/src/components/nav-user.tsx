import { useAuth } from "@/services/AuthContext";
import { useEffect, useState } from "react";
import { domain } from "@/lib/constant";
import {
  Bell,
  ChevronsUpDown,
  UserCog,
  LogOut,
  Calendar,
  BadgeAlert
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const FacultySidebarHeader = ({
  faculty = {
    name: "Dr. John Doe",
    email: "john.doe@university.edu",
    avatar: "/placeholder-faculty.jpg",
    department: "Computer Science",
    unreadNotifications: 3
  }
}) => {
  const { isMobile } = useSidebar();

  // Add interface for faculty data
  interface FacultyData {
    first_name: string;
    last_name: string;
    email: string;
    profile_picture?: string;
    faculty?: {
      designation?: string;
    }
    departments?: {
      department_name: string;
    }[]
  }

  const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
  const { user,logout } = useAuth();

  useEffect(() => {
    const fetchFacultyData = async () => {
      if (!user?.user_id) return;
      
      try {
        const response = await fetch(`${domain}/api/v1/faculty/get-faculty/${user.user_id}`);
        const data = await response.json();
        console.log(data);
        
        setFacultyData(data.data);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      }
    };

    fetchFacultyData();
  }, [user]);

  // Update the faculty prop with actual data
  const currentFaculty = {
    name: facultyData ? `${facultyData.first_name} ${facultyData.last_name}` : "Loading...",
    email: facultyData?.email || "Loading...",
    avatar: facultyData?.profile_picture || "/placeholder-faculty.jpg",
    department: facultyData?.departments?.[0]?.department_name || "Loading...",
    unreadNotifications: 0 // You can add notification logic here
  };

  // Update the faculty prop
  faculty = currentFaculty;
  return (
    <div className="w-full border-b border-border/50 pb-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={faculty.avatar} alt={faculty.name} />
                  <AvatarFallback className="rounded-lg">
                    {faculty.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{faculty.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{faculty.department}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{faculty.name}</span>
                  <span className="text-xs text-muted-foreground">{faculty.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserCog className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                  {faculty.unreadNotifications > 0 && (
                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {faculty.unreadNotifications}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BadgeAlert className="mr-2 h-4 w-4" />
                  Pending Tasks
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={()=>logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
};

export default FacultySidebarHeader;