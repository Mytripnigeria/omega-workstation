import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";

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

const ShiftsPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts] = useState<Shift[]>(generateShifts());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({
    open: false, title: "", description: "", action: () => {},
  });
  const [toast, setToast] = useState<{ open: boolean; type: "success" | "error" | "warning" | "info"; title: string; message?: string }>({ open: false, type: "success", title: "" });

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

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setSelectedShift(null);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Kitchen Staff":
        return "bg-category-lavender";
      case "Waiter":
        return "bg-category-pink";
      case "Cashier":
        return "bg-category-mint";
      case "Delivery Rider":
        return "bg-category-peach";
      default:
        return "bg-secondary";
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

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <PageHeader
        title="My Shifts"
        icon={CalendarIcon}
        iconColor="text-category-sky"
      />

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold text-foreground">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 bg-secondary/50">
              {weekDays.map((day) => (
                <div key={day} className="p-2 sm:p-3 text-center text-sm font-medium text-muted-foreground">
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
                    className={`min-h-[80px] sm:min-h-[100px] p-2 border-t border-r border-border text-left transition-colors ${
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
                          <div className={`mt-1 p-1 rounded text-xs ${getPositionColor(shift.position)}`}>
                            <p className="font-medium truncate text-foreground">{shift.position}</p>
                            <p className="text-muted-foreground hidden sm:block">
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
                <div className={`w-3 h-3 rounded ${getPositionColor(position)}`} />
                <span className="text-sm text-muted-foreground">{position}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-4 sticky top-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Shift Details</h3>
            
            {selectedShift ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${getPositionColor(selectedShift.position)} flex items-center justify-center`}>
                    <User className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{selectedShift.position}</h4>
                    <p className="text-sm text-muted-foreground">{selectedShift.location}</p>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {selectedShift.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {selectedShift.startTime} - {selectedShift.endTime}
                    </span>
                    <Badge variant="outline" className="ml-auto">8 hours</Badge>
                  </div>
                </div>

                {selectedShift.notes && (
                  <div className="bg-status-warning/10 border border-status-warning/30 rounded-lg p-3">
                    <p className="text-sm text-foreground">{selectedShift.notes}</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowSwapModal(true)}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Request Shift Swap
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a shift to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swap Modal */}
      <Dialog open={showSwapModal} onOpenChange={setShowSwapModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Shift Swap</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedShift && (
              <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                <p className="font-medium text-foreground">{selectedShift.position}</p>
                <p className="text-muted-foreground">
                  {selectedShift.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} • {selectedShift.startTime} - {selectedShift.endTime}
                </p>
              </div>
            )}
            <Select value={selectedTeammate} onValueChange={setSelectedTeammate}>
              <SelectTrigger>
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
            <Button variant="outline" className="flex-1" onClick={() => setShowSwapModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 gradient-primary" onClick={handleSwapRequest}>
              Send Request
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
    </div>
  );
};

export default ShiftsPage;