import { useState } from "react";
import { ClipboardCheck, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  time?: string;
  priority: "high" | "medium" | "low";
}

interface ChecklistCategory {
  id: string;
  name: string;
  items: ChecklistItem[];
}

const mockChecklist: ChecklistCategory[] = [
  {
    id: "opening",
    name: "Opening Tasks",
    items: [
      { id: "1", task: "Turn on all kitchen equipment", completed: true, time: "6:00 AM", priority: "high" },
      { id: "2", task: "Check refrigerator temperatures", completed: true, time: "6:15 AM", priority: "high" },
      { id: "3", task: "Prep workstation cleaning", completed: true, time: "6:30 AM", priority: "medium" },
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
  const [checklist, setChecklist] = useState<ChecklistCategory[]>(mockChecklist);
  const [currentShift] = useState("Morning Shift - Kitchen Staff");

  const toggleItem = (categoryId: string, itemId: string) => {
    setChecklist((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : category
      )
    );
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
    0
  );
  const progressPercent = Math.round((completedItems / totalItems) * 100);

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
                  <ClipboardCheck className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Shift Checklist</h1>
                  <p className="text-xs text-muted-foreground">{currentShift}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto">
        {/* Progress Overview */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Today's Progress</h3>
            <span className="text-sm text-muted-foreground">
              {completedItems}/{totalItems} completed
            </span>
          </div>
          <Progress value={progressPercent} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">{progressPercent}% complete</p>
        </div>

        {/* Checklist Categories */}
        <div className="space-y-6">
          {checklist.map((category) => {
            const categoryCompleted = category.items.filter((i) => i.completed).length;
            const categoryTotal = category.items.length;

            return (
              <div key={category.id} className="bg-card border border-border rounded-2xl overflow-hidden">
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
                      className="w-full p-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors text-left"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          item.completed
                            ? "bg-status-success border-status-success"
                            : "border-muted-foreground"
                        }`}
                      >
                        {item.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium ${
                            item.completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {item.task}
                        </p>
                        {item.time && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-foreground" />
                            Completed at {item.time}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ChecklistPage;