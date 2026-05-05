import { useMemo, useState } from "react";
import { Wallet, TrendingUp, ShoppingCart, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStaffPerformance } from "@/hooks/useReports";
import { useShifts } from "@/hooks/useShifts";

interface StaffFinancePanelProps {
  currentStaffId: string;
  isManager: boolean;
}

const formatCurrency = (n: number) => `₦${Number(n).toLocaleString()}`;

const StaffFinancePanel = ({
  currentStaffId,
  isManager,
}: StaffFinancePanelProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const range = useMemo(
    () => ({
      dateFrom: today.toISOString().split("T")[0],
      dateTo: new Date().toISOString().split("T")[0],
    }),
    [],
  );

  const perf = useStaffPerformance(range);
  const onShift = useShifts({ status: "in-progress", limit: 50 });

  const allRows = perf.data?.rows ?? [];
  const visibleRows = isManager
    ? allRows
    : allRows.filter((r) => r.staffId === currentStaffId);

  const [selectedStaff, setSelectedStaff] = useState<string>(
    currentStaffId || allRows[0]?.staffId || "",
  );

  const current =
    visibleRows.find((r) => r.staffId === selectedStaff) ?? visibleRows[0];

  const myShift = onShift.data?.data.find((s) => s.staffId === selectedStaff);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl">
          <Wallet className="w-4 h-4 mr-2" />
          {isManager ? "Cash & sales" : "My sales"}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            {isManager ? "Staff sales (today)" : "My sales today"}
          </SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {isManager && allRows.length > 1 && (
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {allRows.map((r) => (
                  <SelectItem key={r.staffId} value={r.staffId}>
                    {r.staffName || "Staff"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {!current && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No sales attributed today.
            </p>
          )}

          {current && (
            <>
              <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {current.staffName || "Staff"}
                  </span>
                  {myShift && (
                    <Badge className="bg-status-success/10 text-status-success text-xs ml-auto">
                      On shift
                    </Badge>
                  )}
                </div>
                {myShift?.actualClockIn && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Clocked in{" "}
                    {new Date(myShift.actualClockIn).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-status-success" />
                    <p className="text-xs text-muted-foreground">Sales today</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(current.salesAttributed)}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {current.ordersProcessed}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-status-info" />
                    <p className="text-xs text-muted-foreground">Hours</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {current.hoursWorked.toFixed(1)}h
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-category-pink" />
                    <p className="text-xs text-muted-foreground">Avg / order</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {current.ordersProcessed > 0
                      ? formatCurrency(
                          Math.round(
                            current.salesAttributed / current.ordersProcessed,
                          ),
                        )
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="bg-status-warning/5 border border-status-warning/20 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">
                  Cash / card / transfer reconciliation will appear here once the
                  till close-out module ships.
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StaffFinancePanel;
