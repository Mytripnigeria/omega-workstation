import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryLoadErrorProps {
  message?: string;
  onRetry: () => void;
  /** When true, render a compact inline variant suitable for embedding in tab strips. */
  compact?: boolean;
}

export default function CategoryLoadError({ message, onRetry, compact = false }: CategoryLoadErrorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>Couldn't load categories</span>
        <Button size="sm" variant="ghost" onClick={onRetry} className="h-7 px-2">
          <RefreshCw className="h-3 w-3 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-center">
      <AlertCircle className="h-5 w-5 text-destructive" />
      <p className="text-sm text-destructive">{message ?? "Couldn't load categories"}</p>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw className="h-3 w-3 mr-1" /> Retry
      </Button>
    </div>
  );
}
