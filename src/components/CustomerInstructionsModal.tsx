import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CustomerInstructionsModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  instructions: string;
}

const CustomerInstructionsModal = ({
  open,
  onClose,
  orderId,
  instructions,
}: CustomerInstructionsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-status-warning" />
            Customer Instructions
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">Order {orderId}</p>
          <div className="bg-status-warning/10 border border-status-warning/30 rounded-lg p-4">
            <p className="text-foreground">{instructions}</p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerInstructionsModal;
