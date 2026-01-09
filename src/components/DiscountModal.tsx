import { useState } from "react";
import { Percent, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  onApplyDiscount: (amount: number) => void;
}

const DiscountModal = ({ open, onClose, subtotal, onApplyDiscount }: DiscountModalProps) => {
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");

  const quickPercentages = [5, 10, 15, 20, 25];

  const calculateDiscount = () => {
    const value = parseFloat(discountValue) || 0;
    if (discountType === "percentage") {
      return Math.min(subtotal, (subtotal * value) / 100);
    }
    return Math.min(subtotal, value);
  };

  const handleApply = () => {
    const discount = calculateDiscount();
    onApplyDiscount(discount);
    onClose();
    setDiscountValue("");
  };

  const handleQuickPercentage = (percent: number) => {
    setDiscountType("percentage");
    setDiscountValue(percent.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>

        <Tabs value={discountType} onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}>
          <TabsList className="w-full">
            <TabsTrigger value="percentage" className="flex-1">
              <Percent className="w-4 h-4 mr-2" />
              Percentage
            </TabsTrigger>
            <TabsTrigger value="fixed" className="flex-1">
              <DollarSign className="w-4 h-4 mr-2" />
              Fixed Amount
            </TabsTrigger>
          </TabsList>

          <TabsContent value="percentage" className="space-y-4 mt-4">
            <div className="grid grid-cols-5 gap-2">
              {quickPercentages.map((percent) => (
                <Button
                  key={percent}
                  variant={discountValue === percent.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickPercentage(percent)}
                >
                  {percent}%
                </Button>
              ))}
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="Custom percentage"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="pr-8"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </TabsContent>

          <TabsContent value="fixed" className="space-y-4 mt-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
              <Input
                type="number"
                placeholder="Enter amount"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="pl-8"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-secondary/50 rounded-lg p-3 mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-1 text-status-success">
            <span>Discount:</span>
            <span>-₦{calculateDiscount().toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-border">
            <span className="text-foreground">New Subtotal:</span>
            <span className="text-primary">₦{(subtotal - calculateDiscount()).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleApply} className="flex-1 gradient-primary" disabled={!discountValue}>
            Apply Discount
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountModal;
