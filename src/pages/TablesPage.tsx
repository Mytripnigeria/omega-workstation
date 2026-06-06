import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Users, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workstationAuth } from "@/services/api";
import { useTables, useUpdateTableStatus } from "@/hooks/useTables";
import type { RestaurantTable, TableStatus } from "@/services/tables";

const STATUS_LABEL: Record<TableStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  reserved: "Reserved",
  cleaning: "Cleaning",
};

const STATUS_TONE: Record<TableStatus, string> = {
  available: "bg-status-success/10 text-status-success border-status-success/30",
  occupied: "bg-status-error/10 text-status-error border-status-error/30",
  reserved: "bg-status-warning/10 text-status-warning border-status-warning/30",
  cleaning: "bg-muted text-muted-foreground border-border",
};

const STATUS_OPTIONS: TableStatus[] = ["available", "occupied", "reserved", "cleaning"];

const TablesPage = () => {
  const navigate = useNavigate();
  const staff = workstationAuth.getStaff();
  const storeId = staff?.storeId;
  const { data: tables = [], isLoading, isError, refetch } = useTables({ storeId });
  const updateStatus = useUpdateTableStatus();

  const grouped = useMemo(() => {
    const map = new Map<string, RestaurantTable[]>();
    tables.forEach((t) => {
      const key = t.section ?? "General";
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tables]);

  const summary = useMemo(() => {
    const total = tables.length;
    const occupied = tables.filter((t) => t.status === "occupied").length;
    const available = tables.filter((t) => t.status === "available").length;
    return { total, occupied, available };
  }, [tables]);

  const setStatus = (table: RestaurantTable, next: TableStatus) => {
    if (table.status === next) return;
    updateStatus.mutate({ id: table.id, status: next });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Tables</h1>
              <p className="text-xs text-muted-foreground">
                {summary.available}/{summary.total} available
                {summary.occupied > 0 ? ` · ${summary.occupied} seated` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading tables…
          </div>
        )}

        {isError && (
          <div className="border border-dashed border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
            Couldn't load tables.{" "}
            <Button variant="link" onClick={() => refetch()} className="px-1">
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && tables.length === 0 && (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <Utensils className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-medium mb-1">No tables yet</p>
            <p className="text-sm text-muted-foreground">
              Ask an admin to add tables in the merchant hub (Operations →
              Tables).
            </p>
          </div>
        )}

        {grouped.map(([section, items]) => (
          <div key={section}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {section}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-4 ${STATUS_TONE[t.status]}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <Badge variant="outline" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {t.capacity}
                    </Badge>
                  </div>
                  <p className="text-xs uppercase tracking-wide mb-3">
                    {STATUS_LABEL[t.status]}
                  </p>
                  <Select
                    value={t.status}
                    onValueChange={(v) => setStatus(t, v as TableStatus)}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="w-full bg-card/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablesPage;
