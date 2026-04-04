import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Users, XCircle } from "lucide-react";
import {
  getClassAttendanceHistory,
  getSectionStudents,
  markManualAttendance,
  ManualAttendanceStatus,
} from "@/api/attendance.api";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/interface/general";

interface AttendanceMarkerProps {
  classId: number;
  sectionId: number;
}

type AttendanceMap = Record<number, ManualAttendanceStatus>;

const toLocalDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseStatus = (value: string): ManualAttendanceStatus =>
  value?.toLowerCase() === "present" ? "present" : "absent";

const getStudentDisplayName = (student: Student) => {
  const firstName = student.users?.first_name ?? "";
  const lastName = student.users?.last_name ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Student";
};

const AttendanceMarker = ({ classId, sectionId }: AttendanceMarkerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<AttendanceMap>({});

  const studentsQuery = useQuery({
    queryKey: ["attendance-section-students", sectionId],
    queryFn: () => getSectionStudents(sectionId),
    enabled: Boolean(sectionId),
  });

  const historyQuery = useQuery({
    queryKey: ["attendance-class-history", classId],
    queryFn: () => getClassAttendanceHistory(classId),
    enabled: Boolean(classId),
  });

  useEffect(() => {
    setInitialized(false);
    setAttendanceMap({});
  }, [classId, sectionId]);

  useEffect(() => {
    if (initialized) return;
    if (!studentsQuery.data) return;

    const defaults: AttendanceMap = {};
    studentsQuery.data.forEach((student) => {
      defaults[student.student_id] = "present";
    });

    const todayKey = toLocalDateKey(new Date());
    const statusByUserId = new Map<number, ManualAttendanceStatus>();

    (historyQuery.data ?? []).forEach((entry) => {
      const todayRecord = entry.records.find((record) => {
        const recordDate = new Date(record.date);
        return toLocalDateKey(recordDate) === todayKey;
      });

      if (todayRecord) {
        statusByUserId.set(Number(entry.student.id), parseStatus(todayRecord.status));
      }
    });

    studentsQuery.data.forEach((student) => {
      const userId = Number(student.user_id ?? student.users?.user_id ?? 0);
      if (userId && statusByUserId.has(userId)) {
        defaults[student.student_id] = statusByUserId.get(userId) as ManualAttendanceStatus;
      }
    });

    setAttendanceMap(defaults);
    setInitialized(true);
  }, [studentsQuery.data, historyQuery.data, initialized]);

  const submitMutation = useMutation({
    mutationFn: () => {
      const students = studentsQuery.data ?? [];

      const attendanceData = students.map((student) => ({
        student_id: student.student_id,
        status: attendanceMap[student.student_id] ?? "present",
      }));

      return markManualAttendance(classId, attendanceData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["attendance-class-history", classId] });
      toast({
        title: "Attendance submitted",
        description: "Manual attendance has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Unable to submit attendance right now.",
        variant: "destructive",
      });
    },
  });

  const todaySubmitted = useMemo(() => {
    const todayKey = toLocalDateKey(new Date());

    return (historyQuery.data ?? []).some((entry) =>
      entry.records.some((record) => {
        const recordDate = new Date(record.date);
        return (
          toLocalDateKey(recordDate) === todayKey &&
          record.verification_method?.toLowerCase() === "manual"
        );
      })
    );
  }, [historyQuery.data]);

  const summary = useMemo(() => {
    const entries = Object.values(attendanceMap);
    const presentCount = entries.filter((status) => status === "present").length;
    const absentCount = entries.filter((status) => status === "absent").length;

    return {
      presentCount,
      absentCount,
      total: entries.length,
    };
  }, [attendanceMap]);

  if (studentsQuery.isLoading || historyQuery.isLoading) {
    return <LoadingSkeleton variant="list" rows={6} />;
  }

  if (studentsQuery.error || historyQuery.error) {
    return (
      <ErrorState
        message="Failed to load attendance data for this class."
        onRetry={() => {
          studentsQuery.refetch();
          historyQuery.refetch();
        }}
      />
    );
  }

  const students = studentsQuery.data ?? [];

  if (!students.length) {
    return (
      <EmptyState
        icon={Users}
        title="No enrolled students"
        description="No students were found for this section yet."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Manual Attendance</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Total: {summary.total}</Badge>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Present: {summary.presentCount}</Badge>
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Absent: {summary.absentCount}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {students.map((student) => {
            const studentId = student.student_id;
            const status = attendanceMap[studentId] ?? "present";

            return (
              <div
                key={studentId}
                className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{getStudentDisplayName(student)}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.users?.college_uid || student.enrollment_number || "No UID"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={status === "present" ? "default" : "outline"}
                    onClick={() => {
                      setAttendanceMap((prev) => ({ ...prev, [studentId]: "present" }));
                    }}
                    disabled={todaySubmitted || submitMutation.isPending}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Present
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={status === "absent" ? "destructive" : "outline"}
                    onClick={() => {
                      setAttendanceMap((prev) => ({ ...prev, [studentId]: "absent" }));
                    }}
                    disabled={todaySubmitted || submitMutation.isPending}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Absent
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            {todaySubmitted
              ? "Attendance is already submitted for today and is locked for faculty edits."
              : "Review entries before submitting. Attendance can be submitted once per day."}
          </p>
          <Button
            type="button"
            disabled={todaySubmitted || submitMutation.isPending}
            onClick={() => {
              submitMutation.mutate();
            }}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Attendance"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceMarker;
