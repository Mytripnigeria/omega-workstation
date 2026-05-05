import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ArrowLeft,
  LogIn,
  LogOut,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import { useNavigate } from "react-router-dom";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import { workstationAuth } from "@/services/api";
import { useMyShifts, useClockIn, useClockOut } from "@/hooks/useShifts";
import type { Shift } from "@/types/shift";

const ShiftsPage = () => {
  const navigate = useNavigate();
  const staff = workstationAuth.getStaff();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  }>({ open: false, type: "success", title: "" });
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Load month-bounded shifts for the staff member.
  const { dateFrom, dateTo } = useMemo(() => {
    const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { dateFrom: fmt(first), dateTo: fmt(last) };
  }, [currentDate]);

  const { data: shiftsPage, isLoading } = useMyShifts(staff?.id, dateFrom, dateTo);
  const shifts = shiftsPage?.data ?? [];

  const clockIn = useClockIn();
  const clockOut = useClockOut();

  // "Today" lookups
  const todayStr = new Date().toISOString().split("T")[0];
  const todayShift = shifts.find((s) => s.date === todayStr) ?? null;
  const isClockedIn =
    todayShift?.status === "in-progress" || (!!todayShift?.actualClockIn && !todayShift?.actualClockOut);

  const handleClockIn = () => {
    if (!todayShift) {
      setToast({ open: true, type: "warning", title: "No shift today", message: "You don't have a shift scheduled for today." });
      return;
    }
    if (isClockedIn) {
      setToast({ open: true, type: "warning", title: "Already clocked in" });
      return;
    }
    clockIn.mutate(todayShift.id, {
      onSuccess: () =>
        setToast({ open: true, type: "success", title: "Clocked in", message: `Signed in at ${new Date().toLocaleTimeString()}` }),
      onError: (e: Error) =>
        setToast({ open: true, type: "error", title: "Clock-in failed", message: e.message }),
    });
  };

  const handleClockOut = () => {
    if (!todayShift) return;
    if (!isClockedIn) {
      setToast({ open: true, type: "error", title: "Not clocked in", message: "You haven't clocked in for today's shift." });
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Clock Out",
      description: "Are you sure you want to clock out for today?",
      action: () => {
        clockOut.mutate(todayShift.id, {
          onSuccess: () =>
            setToast({ open: true, type: "success", title: "Clocked out", message: `Signed out at ${new Date().toLocaleTimeString()}` }),
          onError: (e: Error) =>
            setToast({ open: true, type: "error", title: "Clock-out failed", message: e.message }),
        });
      },
    });
  };

  const formatTimeShort = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getShiftForDate = (date: Date | null) => {
    if (!date) return null;
    const ds = date.toISOString().split("T")[0];
    return shifts.find((s) => s.date === ds) ?? null;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setSelectedShift(null);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getPositionColor = (position: string | null) => {
    switch (position) {
      case "Kitchen Staff":
        return "bg-primary/10 text-primary";
      case "Waiter":
        return "bg-status-info/10 text-status-info";
      case "Cashier":
        return "bg-status-success/10 text-status-success";
      case "Delivery Rider":
        return "bg-status-warning/10 text-status-warning";
      default:
        return "bg-secondary text-foreground";
    }
  };

  const past = shifts.filter((s) => s.actualClockIn).sort((a, b) => (a.date > b.date ? -1 : 1));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">My Shifts</h1>
                  <p className="text-xs text-muted-foreground">View your schedule</p>
                </div>
              </div>
            </div>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </header>

      <main className="page-container max-w-7xl mx-auto">
        {/* Today's Clock Status */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isClockedIn ? "bg-status-success/10" : "bg-secondary"
                }`}
              >
                <Clock className={`w-6 h-6 ${isClockedIn ? "text-status-success" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {isClockedIn ? "Currently Working" : todayShift ? "Not Clocked In" : "No Shift Today"}
                </h3>
                {todayShift?.actualClockIn && (
                  <p className="text-sm text-muted-foreground">
                    Signed in at {formatTimeShort(new Date(todayShift.actualClockIn))}
                    {todayShift.actualClockOut && ` • Out at ${formatTimeShort(new Date(todayShift.actualClockOut))}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {todayShift && !todayShift.actualClockIn && (
                <Button onClick={handleClockIn} disabled={clockIn.isPending} className="rounded-xl flex-1 sm:flex-none">
                  <LogIn className="w-4 h-4 mr-2" />
                  Clock In
                </Button>
              )}
              {todayShift?.actualClockIn && !todayShift.actualClockOut && (
                <Button
                  onClick={handleClockOut}
                  disabled={clockOut.isPending}
                  variant="outline"
                  className="rounded-xl flex-1 sm:flex-none border-status-warning text-status-warning hover:bg-status-warning/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              )}
              {todayShift?.actualClockIn && todayShift.actualClockOut && (
                <Badge className="bg-status-success/10 text-status-success px-4 py-2">
                  Shift Complete
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-card">
              <CalendarIcon className="w-4 h-4 mr-1" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:bg-card">
              <Clock className="w-4 h-4 mr-1" />
              Attendance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)} className="rounded-xl">
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </Button>
              <h2 className="text-xl font-semibold text-foreground">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigateMonth(1)} className="rounded-xl">
                <ChevronRight className="w-4 h-4 text-foreground" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-7 bg-secondary/50">
                    {weekDays.map((day) => (
                      <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {days.map((date, idx) => {
                      const shift = getShiftForDate(date);
                      const isToday =
                        date && date.toISOString().split("T")[0] === todayStr;
                      const isSelected = selectedShift && shift?.id === selectedShift.id;

                      return (
                        <button
                          key={idx}
                          disabled={!date}
                          onClick={() => shift && setSelectedShift(shift)}
                          className={`min-h-[90px] p-2 border-t border-r border-border text-left transition-colors ${
                            date ? "hover:bg-secondary/20" : "bg-muted/20"
                          } ${isToday ? "bg-primary/5" : ""} ${isSelected ? "ring-2 ring-primary ring-inset" : ""}`}
                        >
                          {date && (
                            <>
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                                  isToday ? "bg-primary text-primary-foreground font-bold" : "text-foreground"
                                }`}
                              >
                                {date.getDate()}
                              </span>
                              {shift && (
                                <div className={`mt-1 p-1.5 rounded-lg text-xs ${getPositionColor(shift.roleName)}`}>
                                  <p className="font-medium truncate">{shift.roleName ?? "Staff"}</p>
                                  <p className="opacity-70 hidden sm:block">
                                    {shift.startTime} - {shift.endTime}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {isLoading && (
                  <p className="text-center text-sm text-muted-foreground mt-3">Loading shifts...</p>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Shift Details</h3>
                  {selectedShift ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${getPositionColor(selectedShift.roleName)} flex items-center justify-center`}>
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{selectedShift.roleName ?? "Staff"}</h4>
                          <p className="text-sm text-muted-foreground">Status: {selectedShift.status}</p>
                        </div>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-foreground" />
                          <span className="text-foreground">
                            {new Date(selectedShift.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-foreground" />
                          <span className="text-foreground">
                            {selectedShift.startTime} - {selectedShift.endTime}
                          </span>
                        </div>
                      </div>
                      {selectedShift.notes && (
                        <div className="bg-status-warning/10 border border-status-warning/30 rounded-xl p-3">
                          <p className="text-sm text-foreground">{selectedShift.notes}</p>
                        </div>
                      )}
                      {selectedShift.actualClockIn && (
                        <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Clocked in</span>
                            <span className="font-medium text-foreground">
                              {formatTimeShort(new Date(selectedShift.actualClockIn))}
                            </span>
                          </div>
                          {selectedShift.actualClockOut && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Clocked out</span>
                              <span className="font-medium text-foreground">
                                {formatTimeShort(new Date(selectedShift.actualClockOut))}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50 text-foreground" />
                      <p>Select a shift to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Position</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Sign In</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Sign Out</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {past.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                          No clock-in records yet for this month.
                        </td>
                      </tr>
                    )}
                    {past.map((s) => (
                      <tr key={s.id} className="border-t border-border">
                        <td className="p-4 font-medium text-foreground">
                          {new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`rounded-lg ${getPositionColor(s.roleName)}`}>
                            {s.roleName ?? "Staff"}
                          </Badge>
                        </td>
                        <td className="p-4 text-foreground">
                          {s.actualClockIn ? formatTimeShort(new Date(s.actualClockIn)) : "-"}
                        </td>
                        <td className="p-4 text-foreground">
                          {s.actualClockOut ? formatTimeShort(new Date(s.actualClockOut)) : "-"}
                        </td>
                        <td className="p-4">
                          {s.actualClockOut ? (
                            <Badge className="bg-status-success/10 text-status-success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge className="bg-status-warning/10 text-status-warning">In Progress</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
      />
      <ToastNotification
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
      <ActivityLog
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        pageName="My Shifts"
        resourceType="shift"
      />
    </div>
  );
};

export default ShiftsPage;
