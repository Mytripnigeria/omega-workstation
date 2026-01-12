import { useState } from "react";
import {
  User,
  Bell,
  FileText,
  Briefcase,
  Settings,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface PayslipEntry {
  id: string;
  period: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: "paid" | "pending";
}

const mockNotifications: Notification[] = [
  { id: "1", title: "Shift Reminder", message: "Your shift starts in 2 hours", time: "1 hour ago", read: false },
  { id: "2", title: "New Schedule", message: "Next week's schedule is available", time: "3 hours ago", read: false },
  { id: "3", title: "Payslip Ready", message: "Your December payslip is ready", time: "1 day ago", read: true },
];

const mockPayslips: PayslipEntry[] = [
  { id: "1", period: "December 2024", grossPay: 185000, deductions: 15000, netPay: 170000, status: "paid" },
  { id: "2", period: "November 2024", grossPay: 185000, deductions: 15000, netPay: 170000, status: "paid" },
  { id: "3", period: "October 2024", grossPay: 180000, deductions: 14500, netPay: 165500, status: "paid" },
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const currentStaff = {
    name: "John Doe",
    email: "john.doe@mrjollof.com",
    phone: "+234 801 234 5678",
    role: "Kitchen Staff",
    department: "Kitchen",
    employeeId: "EMP-2024-001",
    startDate: "March 15, 2024",
    location: "Mr. Jollof - Makurdi",
  };

  const menuItems = [
    { id: "notifications", label: "Messages & Notifications", icon: Bell, badge: "2" },
    { id: "payslips", label: "Payslip Details", icon: FileText },
    { id: "job", label: "Job Details", icon: Briefcase },
    { id: "personal", label: "Personal Information", icon: User },
    { id: "settings", label: "Profile Settings", icon: Settings },
  ];

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
                  <User className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Work Profile</h1>
                  <p className="text-xs text-muted-foreground">Manage your account</p>
                </div>
              </div>
            </div>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {currentStaff.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{currentStaff.name}</h2>
              <p className="text-muted-foreground">{currentStaff.role}</p>
              <Badge variant="outline" className="mt-1">
                {currentStaff.employeeId}
              </Badge>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="w-full bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge className="bg-primary text-primary-foreground">{item.badge}</Badge>
                )}
                <ChevronRight className="w-5 h-5 text-foreground" />
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Notifications Section */}
      <Dialog open={activeSection === "notifications"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-foreground" />
              Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-auto">
            {mockNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border ${
                  notif.read ? "bg-secondary/30 border-border" : "bg-primary/5 border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground">{notif.title}</h4>
                  {!notif.read && <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payslips Section */}
      <Dialog open={activeSection === "payslips"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-foreground" />
              Payslip Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-auto">
            {mockPayslips.map((payslip) => (
              <div key={payslip.id} className="p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground">{payslip.period}</h4>
                  <Badge className={payslip.status === "paid" ? "bg-status-success text-white" : "bg-status-warning"}>
                    {payslip.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Pay:</span>
                    <span className="text-foreground">₦{payslip.grossPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deductions:</span>
                    <span className="text-destructive">-₦{payslip.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Net Pay:</span>
                    <span className="text-primary">₦{payslip.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Details Section */}
      <Dialog open={activeSection === "job"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-foreground" />
              Job Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium text-foreground">{currentStaff.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium text-foreground">{currentStaff.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{currentStaff.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium text-foreground">{currentStaff.startDate}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Personal Information Section */}
      <Dialog open={activeSection === "personal"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-foreground" />
              Personal Information
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{currentStaff.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{currentStaff.phone}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 rounded-xl"
              onClick={() => {
                setActiveSection(null);
                setShowPinModal(true);
              }}
            >
              <Lock className="w-4 h-4 mr-2 text-foreground" />
              Change Login PIN
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Section */}
      <Dialog open={activeSection === "settings"} onOpenChange={() => setActiveSection(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-foreground" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl"
              onClick={() => {
                setActiveSection(null);
                setShowPinModal(true);
              }}
            >
              <Lock className="w-4 h-4 mr-2 text-foreground" />
              Change Login PIN
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl">
              <Bell className="w-4 h-4 mr-2 text-foreground" />
              Notification Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change PIN Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-foreground" />
              Change Login PIN
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Current PIN</label>
              <Input type="password" placeholder="••••" maxLength={4} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">New PIN</label>
              <Input type="password" placeholder="••••" maxLength={4} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Confirm New PIN</label>
              <Input type="password" placeholder="••••" maxLength={4} className="rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowPinModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl"
              onClick={() => {
                setShowPinModal(false);
                setConfirmDialog({
                  open: true,
                  title: "PIN Updated",
                  description: "Your login PIN has been changed successfully.",
                  onConfirm: () => setConfirmDialog({ ...confirmDialog, open: false }),
                });
              }}
            >
              Update PIN
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        confirmText="OK"
      />
      <ActivityLog open={showActivityLog} onClose={() => setShowActivityLog(false)} pageName="Work Profile" />
    </div>
  );
};

export default ProfilePage;