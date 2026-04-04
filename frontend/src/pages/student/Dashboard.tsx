import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, GraduationCap, ShieldAlert, Timer } from "lucide-react";
import { getStudentAttendanceSummary } from "@/api/attendance.api";
import {
  StudentClassData,
  getStudentPastClasses,
  getStudentUpcomingClasses,
} from "@/api/classes.api";
import { getCurrentStudent } from "@/api/student.api";
import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  PageHeader,
  StatCard,
} from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const isSameDay = (left?: string, right = new Date()) => {
  if (!left) return false;
  const leftDate = new Date(left);
  return (
    leftDate.getFullYear() === right.getFullYear() &&
    leftDate.getMonth() === right.getMonth() &&
    leftDate.getDate() === right.getDate()
  );
};

const formatTimeRange = (item: StudentClassData) => {
  const start = item.timeslots?.start_time ? new Date(item.timeslots.start_time) : null;
  const end = item.timeslots?.end_time ? new Date(item.timeslots.end_time) : null;

  if (!start || !end) return "Time not available";

  return `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const userId = user?.user_id;

  const studentQuery = useQuery({
    queryKey: ["student-profile", userId],
    queryFn: () => getCurrentStudent(userId as number),
    enabled: Boolean(userId),
  });

  const studentId = studentQuery.data?.students?.student_id;

  const upcomingQuery = useQuery({
    queryKey: ["student-upcoming-classes", studentId],
    queryFn: () => getStudentUpcomingClasses(studentId as number, 6),
    enabled: Boolean(studentId),
  });

  const pastClassesQuery = useQuery({
    queryKey: ["student-past-classes", userId],
    queryFn: () => getStudentPastClasses(userId as number),
    enabled: Boolean(userId),
  });

  const attendanceQuery = useQuery({
    queryKey: ["student-attendance-summary", userId],
    queryFn: () => getStudentAttendanceSummary(userId as number),
    enabled: Boolean(userId),
  });

  const todayClasses = useMemo(
    () => (upcomingQuery.data ?? []).filter((item) => isSameDay(item.date_of_class)),
    [upcomingQuery.data]
  );

  const enrolledCoursesCount = useMemo(() => {
    const classes = [...(upcomingQuery.data ?? []), ...(pastClassesQuery.data ?? [])];
    const unique = new Set(
      classes.map((item) => item.courses?.course_code || item.courses?.course_name || String(item.class_id))
    );

    return unique.size;
  }, [upcomingQuery.data, pastClassesQuery.data]);

  const profileName =
    [studentQuery.data?.first_name, studentQuery.data?.last_name].filter(Boolean).join(" ") ||
    user?.email ||
    "Student";

  const statsLoading =
    studentQuery.isLoading ||
    upcomingQuery.isLoading ||
    pastClassesQuery.isLoading ||
    attendanceQuery.isLoading;

  if (studentQuery.isError) {
    return (
      <ErrorState
        message="Failed to load student profile"
        onRetry={() => {
          studentQuery.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={`${getGreeting()}, ${profileName}`}
        description="Track your classes and attendance in one place."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Enrolled Courses"
          value={statsLoading ? undefined : enrolledCoursesCount}
          icon={GraduationCap}
        />
        <StatCard
          label="Attendance"
          value={
            statsLoading
              ? undefined
              : `${attendanceQuery.data?.overallPercentage.toFixed(1) ?? "0.0"}%`
          }
          icon={ShieldAlert}
          variant={
            statsLoading
              ? "default"
              : (attendanceQuery.data?.overallPercentage ?? 0) < 75
                ? "danger"
                : "success"
          }
        />
        <StatCard
          label="Upcoming Classes Today"
          value={statsLoading ? undefined : todayClasses.length}
          icon={Calendar}
        />
      </div>

      {attendanceQuery.isError ? (
        <div className="mt-4">
          <ErrorState
            message="Failed to load attendance summary"
            onRetry={() => {
              attendanceQuery.refetch();
            }}
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingQuery.isLoading ? <LoadingSkeleton variant="list" rows={4} /> : null}
            {upcomingQuery.isError ? (
              <ErrorState
                message="Failed to load upcoming classes"
                onRetry={() => {
                  upcomingQuery.refetch();
                }}
              />
            ) : null}
            {!upcomingQuery.isLoading && !upcomingQuery.isError && todayClasses.length === 0 ? (
              <EmptyState
                title="No classes today"
                description="You are all caught up for today."
              />
            ) : null}
            {!upcomingQuery.isLoading && !upcomingQuery.isError && todayClasses.length > 0 ? (
              <div className="space-y-3">
                {todayClasses.map((item) => (
                  <div key={item.class_id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.courses?.course_name || "Course"}</p>
                        <p className="text-xs text-muted-foreground">{item.courses?.course_code || "Code unavailable"}</p>
                      </div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Timer className="h-3.5 w-3.5" />
                        {formatTimeRange(item)}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Section: {item.sections?.section_name || "N/A"} | Room: {item.rooms?.room_number || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No recent activity"
              description="Activity stream will appear here when your new events arrive."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
