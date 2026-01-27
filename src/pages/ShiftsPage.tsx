import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, ArrowRightLeft, ArrowLeft, LogIn, LogOut, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import { useNavigate } from "react-router-dom";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";

interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  position: string;
  location: string;
  notes?: string;
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
}

interface AttendanceRecord {
  id: string;
  date: Date;
  signInTime: Date | null;
  signOutTime: Date | null;
  position: string;
  totalHours: number | null;
}

const generateShifts = (): Shift[] => {
  const shifts: Shift[] = [];
  const positions = ["Kitchen Staff", "Waiter", "Cashier", "Delivery Rider"];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    if (Math.random() > 0.4) {
      const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const startHour = Math.random() > 0.5 ? 6 : 14;
      shifts.push({
        id: `shift-${i}`,
        date,
        startTime: `${startHour}:00`,
        endTime: `${startHour + 8}:00`,
        position: positions[Math.floor(Math.random() * positions.length)],
        location: "Mr. Jollof - Makurdi",
        notes: Math.random() > 0.7 ? "Please come 15 minutes early" : undefined,
      });
    }
  }
  return shifts;
};

const mockTeamMembers: TeamMember[] = [
  { id: "tm1", name: "John Adeyemi", position: "Kitchen Staff" },
  { id: "tm2", name: "Sarah Okonkwo", position: "Waiter" },
  { id: "tm3", name: "Michael Bello", position: "Cashier" },
  { id: "tm4", name: "Amara Eze", position: "Delivery Rider" },
  { id: "tm5", name: "David Okoro", position: "Kitchen Staff" },
];

const mockAttendance: AttendanceRecord[] = [
  { id: "att1", date: new Date(), signInTime: new Date(new Date().setHours(6, 2, 0)), signOutTime: null, position: "Kitchen Staff", totalHours: null },
  { id: "att2", date: new Date(Date.now() - 86400000), signInTime: new Date(new Date(Date.now() - 86400000).setHours(6, 5, 0)), signOutTime: new Date(new Date(Date.now() - 86400000).setHours(14, 10, 0)), position: "Kitchen Staff", totalHours: 8.08 },
  { id: "att3", date: new Date(Date.now() - 2 * 86400000), signInTime: new Date(new Date(Date.now() - 2 * 86400000).setHours(14, 0, 0)), signOutTime: new Date(new Date(Date.now() - 2 * 86400000).setHours(22, 15, 0)), position: "Cashier", totalHours: 8.25 },
];

const ShiftsPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts] = useState<Shift[]>(generateShifts());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState("");
  const [activeTab, setActiveTab] = useState("calendar");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({
    open: false, title: "", description: "", action: () => {},
  });
  const [toast, setToast] = useState<{ open: boolean; type: "success" | "error" | "warning" | "info"; title: string; message?: string }>({ open: false, type: "success", title: "" });
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceRecord | null>(null);
  const [editSignIn, setEditSignIn] = useState("");
  const [editSignOut, setEditSignOut] = useState("");

  // Get today's attendance record
  const todayAttendance = attendance.find(
    (a) =>
      a.date.getDate() === new Date().getDate() &&
      a.date.getMonth() === new Date().getMonth() &&
      a.date.getFullYear() === new Date().getFullYear()
  );

  const isClockedIn = todayAttendance && todayAttendance.signInTime && !todayAttendance.signOutTime;

  const handleClockIn = () => {
    if (todayAttendance) {
      setToast({ open: true, type: "warning", title: "Already Clocked In", message: "You have already signed in today" });
      return;
    }
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: new Date(),
      signInTime: new Date(),
      signOutTime: null,
      position: "Kitchen Staff",
      totalHours: null,
    };
    setAttendance([newRecord, ...attendance]);
    setToast({ open: true, type: "success", title: "Clocked In", message: `Signed in at ${new Date().toLocaleTimeString()}` });
  };

  const handleClockOut = () => {
    if (!todayAttendance || !todayAttendance.signInTime) {
      setToast({ open: true, type: "error", title: "Error", message: "You haven't signed in today" });
      return;
    }
    if (todayAttendance.signOutTime) {
      setToast({ open: true, type: "warning", title: "Already Clocked Out", message: "You have already signed out today" });
      return;
    }
    setConfirmDialog({
      open: true,
      title: "Clock Out",
      description: "Are you sure you want to sign out for today?",
      action: () => {
        const signOut = new Date();
        const totalHours = (signOut.getTime() - todayAttendance.signInTime!.getTime()) / (1000 * 60 * 60);
        setAttendance(
          attendance.map((a) =>
            a.id === todayAttendance.id
              ? { ...a, signOutTime: signOut, totalHours: Math.round(totalHours * 100) / 100 }
              : a
          )
        );
        setToast({ open: true, type: "success", title: "Clocked Out", message: `Signed out at ${signOut.toLocaleTimeString()}` });
      },
    });
  };

  const formatTimeShort = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getShiftForDate = (date: Date | null) => {
    if (!date) return null;
    return shifts.find(
      (s) =>
        s.date.getDate() === date.getDate() &&
        s.date.getMonth() === date.getMonth() &&
        s.date.getFullYear() === date.getFullYear()
    );
  };

  const getAttendanceForDate = (date: Date | null) => {
    if (!date) return null;
    return attendance.find(
      (a) =>
        a.date.getDate() === date.getDate() &&
        a.date.getMonth() === date.getMonth() &&
        a.date.getFullYear() === date.getFullYear()
    );
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setSelectedShift(null);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getPositionColor = (position: string) => {
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

  const handleSwapRequest = () => {
    if (!selectedTeammate) {
      setToast({ open: true, type: "error", title: "Error", message: "Please select a teammate" });
      return;
    }
    const teammate = mockTeamMembers.find(t => t.id === selectedTeammate);
    setConfirmDialog({
      open: true,
      title: "Request Shift Swap",
      description: `Request to swap this shift with ${teammate?.name}?`,
      action: () => {
        setShowSwapModal(false);
        setSelectedTeammate("");
        setToast({ open: true, type: "success", title: "Swap Requested", message: "Your shift swap request has been sent" });
      }
    });
  };

  const openEditAttendanceModal = (record: AttendanceRecord) => {
    setEditingAttendance(record);
    setEditSignIn(record.signInTime ? formatTimeInput(record.signInTime) : "");
    setEditSignOut(record.signOutTime ? formatTimeInput(record.signOutTime) : "");
    setShowEditAttendanceModal(true);
  };

  const formatTimeInput = (date: Date) => {
    return date.toTimeString().slice(0, 5); // Returns "HH:MM"
  };

  const handleSaveAttendance = () => {
    if (!editingAttendance) return;
    
    const signInDate = editSignIn ? new Date(editingAttendance.date) : null;
    const signOutDate = editSignOut ? new Date(editingAttendance.date) : null;
    
    if (signInDate && editSignIn) {
      const [hours, minutes] = editSignIn.split(":").map(Number);
      signInDate.setHours(hours, minutes, 0);
    }
    
    if (signOutDate && editSignOut) {
      const [hours, minutes] = editSignOut.split(":").map(Number);
      signOutDate.setHours(hours, minutes, 0);
    }
    
    let totalHours: number | null = null;
    if (signInDate && signOutDate) {
      totalHours = Math.round(((signOutDate.getTime() - signInDate.getTime()) / (1000 * 60 * 60)) * 100) / 100;
    }
    
    setAttendance(
      attendance.map((a) =>
        a.id === editingAttendance.id
          ? { ...a, signInTime: signInDate, signOutTime: signOutDate, totalHours }
          : a
      )
    );
    
    setShowEditAttendanceModal(false);
    setEditingAttendance(null);
    setToast({ open: true, type: "success", title: "Attendance Updated", message: "Timestamps have been corrected" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-xl transition-colors">
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
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isClockedIn ? "bg-status-success/10" : "bg-secondary"
              }`}>
                <Clock className={`w-6 h-6 ${isClockedIn ? "text-status-success" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {isClockedIn ? "Currently Working" : "Not Clocked In"}
                </h3>
                {todayAttendance?.signInTime && (
                  <p className="text-sm text-muted-foreground">
                    Signed in at {formatTimeShort(todayAttendance.signInTime)}
                    {todayAttendance.signOutTime && ` • Out at ${formatTimeShort(todayAttendance.signOutTime)}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {!todayAttendance ? (
                <Button onClick={handleClockIn} className="rounded-xl flex-1 sm:flex-none">
                  <LogIn className="w-4 h-4 mr-2" />
                  Clock In
                </Button>
              ) : !todayAttendance.signOutTime ? (
                <Button onClick={handleClockOut} variant="outline" className="rounded-xl flex-1 sm:flex-none border-status-warning text-status-warning hover:bg-status-warning/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              ) : (
                <Badge className="bg-status-success/10 text-status-success px-4 py-2">
                  Shift Complete • {todayAttendance.totalHours?.toFixed(1)}h
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
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
            {/* Month Navigation */}
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
              {/* Calendar Grid */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {/* Week Days Header */}
                  <div className="grid grid-cols-7 bg-secondary/50">
                    {weekDays.map((day) => (
                      <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7">
                    {days.map((date, idx) => {
                      const shift = getShiftForDate(date);
                      const isToday =
                        date &&
                        date.getDate() === new Date().getDate() &&
                        date.getMonth() === new Date().getMonth() &&
                        date.getFullYear() === new Date().getFullYear();
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
                                <div className={`mt-1 p-1.5 rounded-lg text-xs ${getPositionColor(shift.position)}`}>
                                  <p className="font-medium truncate">{shift.position}</p>
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

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {["Kitchen Staff", "Waiter", "Cashier", "Delivery Rider"].map((position) => (
                    <div key={position} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${getPositionColor(position).replace('text-', 'bg-').replace('/10', '')}`} />
                      <span className="text-sm text-muted-foreground">{position}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shift Details Panel */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Shift Details</h3>
                  
                  {selectedShift ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${getPositionColor(selectedShift.position)} flex items-center justify-center`}>
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{selectedShift.position}</h4>
                          <p className="text-sm text-muted-foreground">{selectedShift.location}</p>
                        </div>
                      </div>

                      <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-foreground" />
                          <span className="text-foreground">
                            {selectedShift.date.toLocaleDateString("en-US", {
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
                          <Badge variant="outline" className="ml-auto">8 hours</Badge>
                        </div>
                      </div>

                      {selectedShift.notes && (
                        <div className="bg-status-warning/10 border border-status-warning/30 rounded-xl p-3">
                          <p className="text-sm text-foreground">{selectedShift.notes}</p>
                        </div>
                      )}

                      {/* Attendance Record for this Shift */}
                      {(() => {
                        const shiftAttendance = getAttendanceForDate(selectedShift.date);
                        return (
                          <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Attendance Log
                              </h5>
                              {shiftAttendance && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => openEditAttendanceModal(shiftAttendance)}
                                >
                                  <Pencil className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              )}
                            </div>
                            {shiftAttendance ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-status-success">
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span>Sign In</span>
                                  </div>
                                  <span className="font-medium text-foreground">
                                    {shiftAttendance.signInTime 
                                      ? formatTimeShort(shiftAttendance.signInTime) 
                                      : "—"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-status-warning">
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Sign Out</span>
                                  </div>
                                  <span className="font-medium text-foreground">
                                    {shiftAttendance.signOutTime 
                                      ? formatTimeShort(shiftAttendance.signOutTime) 
                                      : "—"}
                                  </span>
                                </div>
                                {shiftAttendance.totalHours !== null && (
                                  <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total Hours</span>
                                    <Badge className="bg-status-success/10 text-status-success">
                                      {shiftAttendance.totalHours.toFixed(1)}h
                                    </Badge>
                                  </div>
                                )}
                                {!shiftAttendance.signOutTime && shiftAttendance.signInTime && (
                                  <Badge className="w-full justify-center bg-status-info/10 text-status-info">
                                    Currently Working
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-2">
                                No attendance recorded
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl"
                        onClick={() => setShowSwapModal(true)}
                      >
                        <ArrowRightLeft className="w-4 h-4 mr-2 text-foreground" />
                        Request Shift Swap
                      </Button>
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
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Total Hours</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record.id} className="border-t border-border">
                        <td className="p-4 font-medium text-foreground">
                          {record.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`rounded-lg ${getPositionColor(record.position)}`}>
                            {record.position}
                          </Badge>
                        </td>
                        <td className="p-4 text-foreground">
                          {record.signInTime ? formatTimeShort(record.signInTime) : "-"}
                        </td>
                        <td className="p-4 text-foreground">
                          {record.signOutTime ? formatTimeShort(record.signOutTime) : "-"}
                        </td>
                        <td className="p-4 text-foreground font-medium">
                          {record.totalHours ? `${record.totalHours.toFixed(1)}h` : "-"}
                        </td>
                        <td className="p-4">
                          {record.signOutTime ? (
                            <Badge className="bg-status-success/10 text-status-success">Complete</Badge>
                          ) : record.signInTime ? (
                            <Badge className="bg-status-warning/10 text-status-warning">In Progress</Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground">-</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => openEditAttendanceModal(record)}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
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

      {/* Swap Modal */}
      <Dialog open={showSwapModal} onOpenChange={setShowSwapModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Request Shift Swap</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedShift && (
              <div className="bg-secondary/50 rounded-xl p-3 text-sm">
                <p className="font-medium text-foreground">{selectedShift.position}</p>
                <p className="text-muted-foreground">
                  {selectedShift.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} • {selectedShift.startTime} - {selectedShift.endTime}
                </p>
              </div>
            )}
            <Select value={selectedTeammate} onValueChange={setSelectedTeammate}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select teammate to swap with" />
              </SelectTrigger>
              <SelectContent>
                {mockTeamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.position})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowSwapModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleSwapRequest}>
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Modal */}
      <Dialog open={showEditAttendanceModal} onOpenChange={setShowEditAttendanceModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingAttendance && (
              <div className="bg-secondary/50 rounded-xl p-3 text-sm">
                <p className="font-medium text-foreground">{editingAttendance.position}</p>
                <p className="text-muted-foreground">
                  {editingAttendance.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sign In Time</label>
              <Input
                type="time"
                value={editSignIn}
                onChange={(e) => setEditSignIn(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sign Out Time</label>
              <Input
                type="time"
                value={editSignOut}
                onChange={(e) => setEditSignOut(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowEditAttendanceModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl" onClick={handleSaveAttendance}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} 
        title={confirmDialog.title} 
        description={confirmDialog.description} 
        onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} 
      />
      <ToastNotification 
        open={toast.open} 
        onClose={() => setToast({ ...toast, open: false })} 
        type={toast.type} 
        title={toast.title} 
        message={toast.message} 
      />
      <ActivityLog open={showActivityLog} onClose={() => setShowActivityLog(false)} pageName="My Shifts" />
    </div>
  );
};

export default ShiftsPage;