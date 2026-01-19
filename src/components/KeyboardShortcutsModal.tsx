import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
}

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts: Shortcut[] = [
  { keys: ["Ctrl", "Enter"], description: "Process Bill (send to kitchen)" },
  { keys: ["Ctrl", "Shift", "Enter"], description: "Quick Bill (complete immediately)" },
  { keys: ["Escape"], description: "Clear cart (with confirmation)" },
  { keys: ["Ctrl", "H"], description: "Hold current order" },
  { keys: ["Ctrl", "D"], description: "Apply discount" },
  { keys: ["Ctrl", "F"], description: "Focus search input" },
  { keys: ["Ctrl", "?"], description: "Show keyboard shortcuts" },
  { keys: ["1-8"], description: "Select category (1=Popular, 2=New, etc.)" },
];

const KeyboardShortcutsModal = ({ open, onClose }: KeyboardShortcutsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
            >
              <span className="text-sm text-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIdx) => (
                  <span key={keyIdx}>
                    <kbd className="px-2 py-1 text-xs font-mono bg-card border border-border rounded-lg text-foreground">
                      {key}
                    </kbd>
                    {keyIdx < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-xs">Ctrl + ?</kbd> anytime to show this help
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;
