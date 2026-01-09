import { Printer, X, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  variationText?: string;
}

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
  customerName?: string;
  tableNumber?: string;
  date?: Date;
}

const ReceiptModal = ({
  open,
  onClose,
  orderId,
  items,
  subtotal,
  tax,
  total,
  discount = 0,
  customerName,
  tableNumber,
  date = new Date(),
}: ReceiptModalProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Receipt {orderId}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="font-bold text-lg text-foreground">Mr. Jollof</h3>
            <p className="text-muted-foreground text-xs">Makurdi Branch</p>
            <p className="text-muted-foreground text-xs">123 Main Street, Makurdi</p>
          </div>

          <Separator className="my-3" />

          {/* Order Info */}
          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order:</span>
              <span className="text-foreground">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="text-foreground">{date.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="text-foreground">{date.toLocaleTimeString()}</span>
            </div>
            {customerName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="text-foreground">{customerName}</span>
              </div>
            )}
            {tableNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Table:</span>
                <span className="text-foreground">{tableNumber}</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          {/* Items */}
          <div className="space-y-2 mb-3">
            {items.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between">
                  <span className="text-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-foreground">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
                {item.variationText && (
                  <p className="text-xs text-muted-foreground ml-4">{item.variationText}</p>
                )}
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-foreground">₦{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-status-success">
                <span>Discount:</span>
                <span>-₦{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT (7.5%):</span>
              <span className="text-foreground">₦{tax.toLocaleString()}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span className="text-foreground">Total:</span>
              <span className="text-primary">₦{total.toLocaleString()}</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* QR Code Placeholder */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-lg mb-2">
              <QrCode className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Scan for feedback</p>
          </div>

          <div className="text-center mt-4 text-xs text-muted-foreground">
            <p>Thank you for dining with us!</p>
            <p>www.mrjollof.com</p>
          </div>
        </div>

        <Button onClick={handlePrint} className="w-full gradient-primary">
          <Printer className="w-4 h-4 mr-2" />
          Print Receipt
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
