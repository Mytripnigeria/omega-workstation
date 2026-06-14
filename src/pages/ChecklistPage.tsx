import { useState } from "react";
import { ClipboardCheck, CheckCircle2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import ActivityLogButton from "@/components/ActivityLogButton";
import ActivityLog from "@/components/ActivityLog";
import { workstationAuth } from "@/services/api";
import { useActiveShift } from "@/hooks/useShifts";
import { useMyChecklists, useToggleChecklistItem } from "@/hooks/useChecklists";

const assignmentLabel: Record<string, string> = {
  all_staff: "All staff",
  role: "Your role",
  staff: "Assigned to you",
};

const ChecklistPage = () => {
  const navigate = useNavigate();
  const staff = workstationAuth.getStaff();
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Checklists are only available while clocked in (active shift).
  const { data: shift, isLoading: shiftLoading } = useActiveShift(staff?.id);
  const { data: page, isLoading: listLoading } = useMyChecklists(!!shift);
  const toggle = useToggleChecklistItem();

  const checklists = page?.data ?? [];
  const isLoading = shiftLoading || (!!shift && listLoading);

  const allItems = checklists.flatMap((c) => c.items);
  const totalItems = allItems.length;
  const completedItems = allItems.filter((i) => i.isCompleted).length;
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

        {shift && !isLoading && checklists.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No checklists assigned to you.</p>
          </div>
        )}

        {shift && checklists.length > 0 && (
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
                {toggle.isPending && " · saving…"}
              </p>
            </div>

            <div className="space-y-6">
              {checklists.map((category) => {
                const categoryCompleted = category.items.filter((i) => i.isCompleted).length;
                const categoryTotal = category.items.length;

                return (
                  <div
                    key={category.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    <div className="bg-secondary/50 px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{category.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {assignmentLabel[category.assignmentType] ?? category.assignmentType}
                        </Badge>
                      </div>
                      <Badge variant="outline">
                        {categoryCompleted}/{categoryTotal}
                      </Badge>
                    </div>
                    <div className="divide-y divide-border">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() =>
                            toggle.mutate({
                              checklistId: category.id,
                              itemId: item.id,
                              isCompleted: !item.isCompleted,
                            })
                          }
                          disabled={toggle.isPending}
                          className="w-full p-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors text-left disabled:opacity-60"
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                              item.isCompleted
                                ? "bg-status-success border-status-success"
                                : "border-muted-foreground"
                            }`}
                          >
                            {item.isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium ${
                                item.isCompleted
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.isCompleted && item.completedByName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Completed by {item.completedByName}
                              </p>
                            )}
                          </div>
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
        resourceType="checklist"
        resourceId={shift?.id}
      />
    </div>
  );
};

export default ChecklistPage;
