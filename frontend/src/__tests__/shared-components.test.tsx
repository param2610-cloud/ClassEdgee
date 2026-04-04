import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AttendanceMarker from "@/components/shared/AttendanceMarker";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import StatCard from "@/components/shared/StatCard";

const attendanceApiMocks = vi.hoisted(() => ({
  getSectionStudents: vi.fn(),
  getClassAttendanceHistory: vi.fn(),
  markManualAttendance: vi.fn(),
}));

const toastMock = vi.hoisted(() => vi.fn());

vi.mock("@/api/attendance.api", () => attendanceApiMocks);
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

type Row = { id: number; name: string };
const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "Name" }];

describe("shared components", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    attendanceApiMocks.getSectionStudents.mockResolvedValue([
      {
        student_id: 1,
        user_id: 101,
        enrollment_number: "2023CS01",
        users: {
          user_id: 101,
          first_name: "John",
          last_name: "Doe",
          college_uid: "STU-01",
        },
      },
    ]);

    attendanceApiMocks.getClassAttendanceHistory.mockResolvedValue([]);
    attendanceApiMocks.markManualAttendance.mockResolvedValue({ success: true });
  });

  it("StatCard renders loading skeleton when value is undefined", () => {
    const { container } = render(<StatCard label="Attendance" value={undefined} />);
    expect(screen.queryByText("Attendance")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("StatCard renders zero value and danger variant class", () => {
    const { container } = render(<StatCard label="Attendance" value={0} variant="danger" trend={-4} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("-4%")).toBeInTheDocument();
    expect(container.querySelector(".border-red-300")).toBeInTheDocument();
  });

  it("StatCard renders positive trend with plus prefix", () => {
    render(<StatCard label="Attendance" value={88} trend={5} />);
    expect(screen.getByText("+5%")).toBeInTheDocument();
  });

  it("DataTable renders loading, error, empty, and rows states", async () => {
    const { rerender } = render(
      <DataTable columns={columns} data={[]} isLoading />
    );

    expect(screen.queryByText("No records found")).not.toBeInTheDocument();

    const onRetry = vi.fn();
    rerender(<DataTable columns={columns} data={[]} error={new Error("Load failed")} onRetry={onRetry} />);
    expect(screen.getByText("Load failed")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText("No records found")).toBeInTheDocument();

    const onRowClick = vi.fn();
    rerender(<DataTable columns={columns} data={[{ id: 1, name: "Alice" }]} onRowClick={onRowClick} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();

    const row = screen.getByText("Alice").closest("tr");
    expect(row).toHaveClass("cursor-pointer");
    await userEvent.click(row as HTMLElement);
    expect(onRowClick).toHaveBeenCalledWith({ id: 1, name: "Alice" });
  });

  it("EmptyState and ErrorState render actions and retry callbacks", async () => {
    const retry = vi.fn();

    render(
      <>
        <EmptyState title="No notes" description="Nothing here" action={<button>Create</button>} />
        <ErrorState message="Boom" onRetry={retry} />
      </>
    );

    expect(screen.getByText("No notes")).toBeInTheDocument();
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("AttendanceMarker shows empty state when section has no students", async () => {
    attendanceApiMocks.getSectionStudents.mockResolvedValue([]);

    renderWithQueryClient(<AttendanceMarker classId={101} sectionId={11} />);

    expect(await screen.findByText("No enrolled students")).toBeInTheDocument();
  });

  it("AttendanceMarker disables all actions when already submitted today", async () => {
    attendanceApiMocks.getClassAttendanceHistory.mockResolvedValue([
      {
        student: { id: 101, name: "John Doe" },
        attendance: { present: 1, absent: 0, total: 1, percentage: "100.00" },
        records: [
          {
            date: new Date().toISOString(),
            status: "present",
            verification_method: "manual",
          },
        ],
      },
    ]);

    renderWithQueryClient(<AttendanceMarker classId={101} sectionId={11} />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Present" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Absent" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Attendance" })).toBeDisabled();
  });

  it("AttendanceMarker toggles absent/present and submits attendance", async () => {
    renderWithQueryClient(<AttendanceMarker classId={101} sectionId={11} />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();

    const absentButton = screen.getByRole("button", { name: "Absent" });
    expect(absentButton).toBeEnabled();

    await userEvent.click(absentButton);
    expect(screen.getByText("Absent: 1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Submit Attendance" }));

    await waitFor(() => {
      expect(attendanceApiMocks.markManualAttendance).toHaveBeenCalledWith(101, [
        { student_id: 1, status: "absent" },
      ]);
    });
  });
});
