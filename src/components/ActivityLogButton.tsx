import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityLogButtonProps {
  onClick: () => void;
  hasNewActivity?: boolean;
}

const ActivityLogButton = ({ onClick, hasNewActivity = true }: ActivityLogButtonProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="rounded-xl relative"
    >
      <AlertCircle className="w-4 h-4 text-foreground" />
      {hasNewActivity && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-status-warning rounded-full" />
      )}
    </Button>
  );
};

export default ActivityLogButton;
