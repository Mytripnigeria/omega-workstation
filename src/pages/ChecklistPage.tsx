import { useEffect, useState } from "react";
import { ClipboardCheck, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import { workstationAuth } from "@/services/api";
import { useActiveShift, useUpdateChecklist } from "@/hooks/useShifts";
import type { ChecklistCategory, ChecklistItem } from "@/types/shift";

// Default template applied to a fresh shift that has no persisted checklist yet.
const DEFAULT_TEMPLATE: ChecklistCategory[] = [
  {
    id: "opening",
    name: "Opening Tasks",
    items: [
      { id: "1", task: "Turn on all kitchen equipment", completed: false, priority: "high" },
      { id: "2", task: "Check refrigerator temperatures", completed: false, priority: "high" },
      { id: "3", task: "Prep workstation cleaning", completed: false, priority: "medium" },
      { id: "4", task: "Check inventory levels", completed: false, priority: "high" },
      { id: "5", task: "Review daily specials", completed: false, priority: "medium" },
    ],
  },
  {
    id: "service",
    name: "Service Prep",
    items: [
      { id: "6", task: "Prep garnishes and sides", completed: false, priority: "high" },
      { id: "7", task: "Check sauce levels", completed: false, priority: "medium" },
      { id: "8", task: "Organize cooking stations", completed: false, priority: "medium" },
      { id: "9", task: "Test POS system", completed: false, priority: "low" },
    ],
  },
  {
    id: "closing",
    name: "Closing Tasks",
    items: [
      { id: "10", task: "Clean all cooking surfaces", completed: false, priority: "high" },
      { id: "11", task: "Store all perishables", completed: false, priority: "high" },
      { id: "12", task: "Turn off equipment", completed: false, priority: "high" },
      { id: "13", task: "Take out trash", completed: false, priority: "medium" },
      { id: "14", task: "Lock all doors", completed: false, priority: "high" },
    ],
  },
];

const ChecklistPage = () => {
  const navigate = useNavigate();
  const staff = workstationAuth.getStaff();
  const [showActivityLog, setShowActivityLog] = useState(false);

  const { data: shift, isLoading } = useActiveShift(staff?.id);
  const update = useUpdateChecklist();

  const [checklist, setChecklist] = useState<ChecklistCategory[]>([]);
  useEffect(() => {
    if (shift?.checklist && shift.checklist.length > 0) {
      setChecklist(shift.checklist);
    } else if (shift) {
      setChecklist(DEFAULT_TEMPLATE);
    }
  }, [shift]);

  const persist = (next: ChecklistCategory[]) => {
    setChecklist(next);
    if (shift) {
      update.mutate({ id: shift.id, checklist: next });
    }
  };

  const toggleItem = (categoryId: string, itemId: string) => {
    const next = checklist.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            items: category.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    completed: !item.completed,
                    completedAt: !item.completed ? new Date().toISOString() : undefined,
                  }
                : item,
            ),
          }
        : category,
    );
    persist(next);
  };

  const getPriorityColor = (priority: ChecklistItem["priority"]) => {
    switch (priority) {
      case "high":
        return "text-destructive border-destructive/30";
      case "medium":
        return "text-status-warning border-status-warning/30";
      case "low":
        return "text-muted-foreground border-muted";
    }
  };

  const totalItems = checklist.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = checklist.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.completed).length,
    0,
  );
  const progressPercent = totalItems
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  const shiftLabel = shift
    ? `${shift.roleName ?? "Shift"} — ${shift.date}`
    : "No active shift";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Shift Checklist</h1>
                  <p className="text-xs text-muted-foreground">{shiftLabel}</p>
                </div>
              </div>
            </div>
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
          </div>
        </div>
      </header>

      <main className="page-container max-w-3xl mx-auto">
        {isLoading && (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        )}

        {!isLoading && !shift && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">
              Clock in to your shift to start the checklist.
            </p>
          </div>
        )}

        {shift && (
          <>
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Today's Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {completedItems}/{totalItems} completed
                </span>
              </div>
              <Progress value={progressPercent} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {progressPercent}% complete
                {update.isPending && " · saving…"}
              </p>
            </div>

            <div className="space-y-6">
              {checklist.map((category) => {
                const categoryCompleted = category.items.filter((i) => i.completed).length;
                const categoryTotal = category.items.length;

                return (
                  <div
                    key={category.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    <div className="bg-secondary/50 px-5 py-4 flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{category.name}</h4>
                      <Badge variant="outline">
                        {categoryCompleted}/{categoryTotal}
                      </Badge>
                    </div>
                    <div className="divide-y divide-border">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(category.id, item.id)}
                          disabled={update.isPending}
                          className="w-full p-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors text-left disabled:opacity-60"
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                              item.completed
                                ? "bg-status-success border-status-success"
                                : "border-muted-foreground"
                            }`}
                          >
                            {item.completed && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium ${
                                item.completed
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {item.task}
                            </p>
                            {item.completedAt && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-foreground" />
                                Completed at{" "}
                                {new Date(item.completedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(item.priority)}`}
                          >
                            {item.priority}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <ActivityLog
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        pageName="Shift Checklist"
        resourceType="shift"
        resourceId={shift?.id}
      />
    </div>
  );
};

export default ChecklistPage;
