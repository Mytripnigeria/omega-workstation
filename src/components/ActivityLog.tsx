import { useState } from "react";
import { AlertCircle, Clock, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details?: string;
  type: "create" | "update" | "delete" | "view" | "action";
}

interface ActivityLogProps {
  open: boolean;
  onClose: () => void;
  pageName: string;
  activities?: ActivityEntry[];
}

const mockActivities: ActivityEntry[] = [
  { id: "1", action: "Updated order status", user: "John D.", timestamp: new Date(Date.now() - 5 * 60000), details: "Order #ORD042 marked as ready", type: "update" },
  { id: "2", action: "Created new order", user: "Sarah O.", timestamp: new Date(Date.now() - 15 * 60000), details: "Order #ORD043 - 3 items", type: "create" },
  { id: "3", action: "Applied discount", user: "John D.", timestamp: new Date(Date.now() - 30 * 60000), details: "10% discount on order #ORD040", type: "action" },
  { id: "4", action: "Voided item", user: "Mike B.", timestamp: new Date(Date.now() - 45 * 60000), details: "Removed Jollof Rice from order #ORD039", type: "delete" },
  { id: "5", action: "Viewed reports", user: "Admin", timestamp: new Date(Date.now() - 60 * 60000), type: "view" },
  { id: "6", action: "Updated inventory", user: "Sarah O.", timestamp: new Date(Date.now() - 90 * 60000), details: "Added 50kg Tomatoes", type: "update" },
  { id: "7", action: "Completed shift checklist", user: "John D.", timestamp: new Date(Date.now() - 120 * 60000), details: "Morning shift - 8 tasks", type: "action" },
];

const ActivityLog = ({ open, onClose, pageName, activities = mockActivities }: ActivityLogProps) => {
  const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: ActivityEntry["type"]) => {
    switch (type) {
      case "create": return "bg-status-success/10 text-status-success";
      case "update": return "bg-status-info/10 text-status-info";
      case "delete": return "bg-destructive/10 text-destructive";
      case "action": return "bg-status-warning/10 text-status-warning";
      case "view": return "bg-muted text-muted-foreground";
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Activity Log</h3>
              <p className="text-xs text-muted-foreground">{pageName} • Recent activities</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Activity List */}
        <ScrollArea className="h-[300px] p-4">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
                <Badge className={`${getTypeColor(activity.type)} rounded-lg text-xs`}>
                  {activity.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{activity.action}</p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activity.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ActivityLog;
