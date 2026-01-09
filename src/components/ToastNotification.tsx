import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ToastNotificationProps {
  open: boolean;
  onClose: () => void;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

const ToastNotification = ({
  open,
  onClose,
  type,
  title,
  message,
}: ToastNotificationProps) => {
  const icons = {
    success: <CheckCircle2 className="w-12 h-12 text-status-success" />,
    error: <XCircle className="w-12 h-12 text-destructive" />,
    warning: <AlertCircle className="w-12 h-12 text-status-warning" />,
    info: <Info className="w-12 h-12 text-status-info" />,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          {icons[type]}
          <DialogTitle className="text-lg mt-4">{title}</DialogTitle>
          {message && (
            <p className="text-muted-foreground text-sm mt-2">{message}</p>
          )}
        </DialogHeader>
        <Button onClick={onClose} className="w-full mt-4 gradient-primary">
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ToastNotification;
