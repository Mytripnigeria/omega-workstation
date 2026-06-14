import { Printer, X, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRef } from "react";
import { useReceiptInfo } from "@/hooks/useReceiptInfo";
import { workstationAuth } from "@/services/api";

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
  const { data: info } = useReceiptInfo();
  const sessionStaff = workstationAuth.getStaff();
  const staffName = sessionStaff
    ? `${sessionStaff.firstName} ${sessionStaff.lastName}`.trim()
    : "";
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!receiptRef.current) return;
    
    const printContent = receiptRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=350,height=700');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${orderId}</title>
          <style>
            @page { 
              size: 80mm auto; 
              margin: 0; 
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', Consolas, monospace; 
              font-size: 12px; 
              padding: 8mm;
              max-width: 80mm;
              margin: 0 auto;
              background: white;
              color: black;
            }
            .receipt-header { text-align: center; margin-bottom: 12px; }
            .receipt-header h3 { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
            .receipt-header p { font-size: 10px; color: #555; }
            .separator { border-top: 1px dashed #333; margin: 8px 0; }
            .order-info { margin-bottom: 8px; }
            .order-info div { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px; }
            .items { margin-bottom: 8px; }
            .item { margin-bottom: 6px; }
            .item-row { display: flex; justify-content: space-between; }
            .item-variation { font-size: 10px; color: #666; margin-left: 12px; }
            .totals { margin-bottom: 8px; }
            .totals div { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px; }
            .totals .total-row { font-weight: bold; font-size: 14px; margin-top: 6px; padding-top: 6px; border-top: 1px solid #333; }
            .discount { color: #16a34a; }
            .qr-placeholder { text-align: center; margin: 12px 0; }
            .qr-box { width: 50px; height: 50px; border: 1px solid #333; margin: 0 auto 4px; display: flex; align-items: center; justify-content: center; font-size: 9px; }
            .footer { text-align: center; font-size: 10px; color: #555; margin-top: 12px; }
            @media print {
              body { padding: 0; }
              html, body { 
                width: 80mm; 
                height: auto;
              }
            }
            @media screen {
              body {
                padding: 20px;
                max-width: 320px;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

        <div ref={receiptRef} className="bg-card border border-border rounded-lg p-4 font-mono text-sm">
          {/* Header */}
          <div className="receipt-header text-center mb-4">
            <h3 className="font-bold text-lg text-foreground">
              {info?.receiptHeader || info?.storeName || "Receipt"}
            </h3>
            {info?.storeName && info?.receiptHeader && (
              <p className="text-muted-foreground text-xs">{info.storeName}</p>
            )}
            {info?.address && (
              <p className="text-muted-foreground text-xs">{info.address}</p>
            )}
            {info?.phone && (
              <p className="text-muted-foreground text-xs">{info.phone}</p>
            )}
          </div>

          <Separator className="my-3 separator" />

          {/* Order Info */}
          <div className="order-info space-y-1 mb-3 text-xs">
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
            {staffName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Served by:</span>
                <span className="text-foreground">{staffName}</span>
              </div>
            )}
            {tableNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Table:</span>
                <span className="text-foreground">{tableNumber}</span>
              </div>
            )}
          </div>

          <Separator className="my-3 separator" />

          {/* Items */}
          <div className="items space-y-2 mb-3">
            {items.map((item, idx) => (
              <div key={idx} className="item">
                <div className="item-row flex justify-between">
                  <span className="text-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-foreground">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
                {item.variationText && (
                  <p className="item-variation text-xs text-muted-foreground ml-4">{item.variationText}</p>
                )}
              </div>
            ))}
          </div>

          <Separator className="my-3 separator" />

          {/* Totals */}
          <div className="totals space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-foreground">₦{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-status-success discount">
                <span>Discount:</span>
                <span>-₦{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT (7.5%):</span>
              <span className="text-foreground">₦{tax.toLocaleString()}</span>
            </div>
            <Separator className="my-2 separator" />
            <div className="total-row flex justify-between font-bold text-base">
              <span className="text-foreground">Total:</span>
              <span className="text-primary">₦{total.toLocaleString()}</span>
            </div>
          </div>

          <Separator className="my-3 separator" />

          {/* QR Code Placeholder */}
          <div className="qr-placeholder text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-lg mb-2 qr-box">
              <QrCode className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Scan for feedback</p>
          </div>

          <div className="footer text-center mt-4 text-xs text-muted-foreground">
            {info?.receiptFooter ? (
              info.receiptFooter.split("\n").map((line, i) => <p key={i}>{line}</p>)
            ) : (
              <p>Thank you!</p>
            )}
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
