import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATE_PERIOD_OPTIONS,
  type DatePeriod,
} from "@/lib/date-range";

interface DatePeriodFilterProps {
  value: DatePeriod;
  onChange: (period: DatePeriod) => void;
  customStart?: string;
  customEnd?: string;
  onCustomChange?: (start: string, end: string) => void;
  /** Extra classes for the select trigger, so each page keeps its own sizing. */
  triggerClassName?: string;
}

/**
 * Today / Yesterday / This week / This month / Custom range — the filter set
 * every stats surface offers. Custom reveals two native date inputs inline
 * rather than opening a modal, so the surrounding layout is unchanged.
 */
const DatePeriodFilter = ({
  value,
  onChange,
  customStart = "",
  customEnd = "",
  onCustomChange,
  triggerClassName = "w-32 rounded-xl",
}: DatePeriodFilterProps) => (
  <div className="flex items-center gap-2">
    <Select value={value} onValueChange={(v) => onChange(v as DatePeriod)}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DATE_PERIOD_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {value === "custom" && onCustomChange && (
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={customStart}
          max={customEnd || undefined}
          onChange={(e) => onCustomChange(e.target.value, customEnd)}
          className="h-10 rounded-xl border border-border bg-background px-2 text-sm text-foreground"
          aria-label="From date"
        />
        <span className="text-muted-foreground text-sm">–</span>
        <input
          type="date"
          value={customEnd}
          min={customStart || undefined}
          onChange={(e) => onCustomChange(customStart, e.target.value)}
          className="h-10 rounded-xl border border-border bg-background px-2 text-sm text-foreground"
          aria-label="To date"
        />
      </div>
    )}
  </div>
);

export default DatePeriodFilter;
