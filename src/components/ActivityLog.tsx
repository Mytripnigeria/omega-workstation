import { AlertCircle, Clock, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActivityLog } from "@/hooks/useActivityLog";
import type { ActivityEntry } from "@/types/activity-log";

interface ActivityLogProps {
  open: boolean;
  onClose: () => void;
  pageName: string;
  /** Filter to entries about a specific resource type, e.g. "shift", "order". */
  resourceType?: string;
  /** Filter to entries about a specific resource (e.g. a specific shift id). */
  resourceId?: string;
}

const ActivityLog = ({
  open,
  onClose,
  pageName,
  resourceType,
  resourceId,
}: ActivityLogProps) => {
  const { data, isLoading, error } = useActivityLog(
    { resourceType, resourceId, limit: 30 },
    open,
  );

  const activities: ActivityEntry[] = data?.data ?? [];

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Map a dot-namespaced action key to a visual badge category.
  const getActionCategory = (action: string): "create" | "update" | "delete" | "view" | "action" => {
    if (action.includes(".created") || action.includes(".clocked_in") || action.includes(".logged_in")) return "create";
    if (action.includes(".updated") || action.includes(".approved") || action.includes(".paid")) return "update";
    if (action.includes(".deleted") || action.includes(".cancelled") || action.includes(".rejected") || action.includes(".clocked_out") || action.includes(".logged_out")) return "delete";
    if (action.includes(".viewed")) return "view";
    return "action";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-status-success/10 text-status-success";
      case "update":
        return "bg-status-info/10 text-status-info";
      case "delete":
        return "bg-destructive/10 text-destructive";
      case "action":
        return "bg-status-warning/10 text-status-warning";
      case "view":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Convert a dot-namespaced action like "shift.clocked_in" into a friendly title.
  const humanizeAction = (action: string) => {
    const [scope, verb] = action.split(".");
    if (!verb) return action;
    const v = verb.replace(/_/g, " ");
    return `${scope.charAt(0).toUpperCase() + scope.slice(1)} ${v}`;
  };

  // Stringify metadata into a one-line detail text.
  const detailLine = (entry: ActivityEntry): string | null => {
    if (!entry.metadata) return null;
    const parts: string[] = [];
    for (const [k, v] of Object.entries(entry.metadata)) {
      if (v === null || v === undefined) continue;
      parts.push(`${k}: ${String(v)}`);
    }
    return parts.length ? parts.join(" • ") : null;
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto">
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

        <ScrollArea className="h-[300px] p-4">
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground py-8">Loading activity...</p>
          )}
          {error && (
            <p className="text-center text-sm text-destructive py-8">
              Couldn't load activity log.
            </p>
          )}
          {!isLoading && !error && activities.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No recent activity{resourceType ? ` for ${resourceType}` : ""}.
            </p>
          )}
          <div className="space-y-3">
            {activities.map((entry) => {
              const category = getActionCategory(entry.action);
              const details = detailLine(entry);
              return (
                <div key={entry.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl">
                  <Badge className={`${getTypeColor(category)} rounded-lg text-xs`}>{category}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">
                      {humanizeAction(entry.action)}
                    </p>
                    {details && (
                      <p className="text-xs text-muted-foreground mt-0.5">{details}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {entry.actorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(entry.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ActivityLog;
