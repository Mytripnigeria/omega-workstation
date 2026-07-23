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
  /** Pre-formatted modifier line (legacy callers). */
  variationText?: string;
  /** Structured snapshots from the order — preferred over variationText. */
  variation?: Record<string, unknown> | null;
  addons?: Record<string, unknown>[] | null;
}

/** Reads a display name out of a variation/add-on jsonb snapshot. */
function snapshotName(v: Record<string, unknown> | null | undefined): string | null {
  if (!v) return null;
  const n = v["name"];
  return typeof n === "string" && n.trim() ? n.trim() : null;
}

/**
 * Builds the modifier lines printed under an item: the chosen variation and
 * every selected add-on. Falls back to a caller-supplied variationText so
 * older call sites keep working.
 */
function modifierLines(item: OrderItem): string[] {
  const lines: string[] = [];
  const variation = snapshotName(item.variation);
  if (variation) lines.push(variation);
  for (const a of item.addons ?? []) {
    const name = snapshotName(a);
    if (!name) continue;
    const price = Number(a["price"]);
    lines.push(
      Number.isFinite(price) && price > 0
        ? `+ ${name} (₦${price.toLocaleString()})`
        : `+ ${name}`,
    );
  }
  if (lines.length === 0 && item.variationText) lines.push(item.variationText);
  return lines;
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
  /** Delivery fee for a delivery order — shown as its own line so the receipt totals add up. */
  deliveryFee?: number;
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
  deliveryFee = 0,
  customerName,
  tableNumber,
  date = new Date(),
}: ReceiptModalProps) => {
  const { data: info } = useReceiptInfo();
  // Tax heading follows the business profile (e.g. "VAT (7.5%)"), instead of a
  // hardcoded 7.5% that could contradict what the customer was actually charged.
  const taxHeading = info
    ? `${info.taxLabel ?? "Tax"} (${(Number(info.taxRate ?? 0) * 100)
        .toFixed(2)
        .replace(/\.?0+$/, "")}%)`
    : "Tax";
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

            /* Thermal legibility rules (client: printout was faint / grey text
               invisible). A thermal head is 1-bit — any grey dithers into
               sparse dots that read faint and fade fast. So: force EVERY glyph
               to solid black, print bold, and tell the browser not to lighten
               anything. The receipt DOM is copied from the app and still
               carries its muted-grey utility classes, hence the !important
               catch-all rather than trusting each element's own colour. */
            html, body, body * {
              color: #000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              /* A heavier sans-serif keeps solid strokes at the printer's low
                 resolution far better than thin monospace; columns still align
                 because every row is laid out with flex, not spacing. */
              font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
              font-size: 13px;
              font-weight: 700;
              line-height: 1.4;
              padding: 6mm 5mm;
              max-width: 80mm;
              margin: 0 auto;
              background: #fff;
              -webkit-font-smoothing: none;
            }
            .receipt-header { text-align: center; margin-bottom: 12px; }
            .receipt-header h3 { font-size: 21px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 5px; }
            /* Was 10px grey — the address/phone the client couldn't see. */
            .receipt-header p { font-size: 12px; font-weight: 700; margin-bottom: 1px; }
            .separator { border: 0; border-top: 2px solid #000; margin: 8px 0; }
            .order-info { margin-bottom: 8px; }
            .order-info div { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 3px; font-size: 12.5px; font-weight: 700; }
            .items { margin-bottom: 8px; }
            .item { margin-bottom: 7px; }
            .item-row { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 700; }
            .item-row > span:first-child { flex: 1; }
            .item-row > span:last-child { white-space: nowrap; }
            .item-variation { font-size: 11.5px; margin-left: 12px; font-weight: 700; }
            .totals { margin-bottom: 8px; }
            .totals div { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 3px; font-size: 12.5px; font-weight: 700; }
            .totals .total-row { font-weight: 800; font-size: 17px; margin-top: 6px; padding-top: 6px; border-top: 2px solid #000; }
            .qr-placeholder { text-align: center; margin: 12px 0; }
            .qr-box { width: 56px; height: 56px; margin: 0 auto 4px; display: flex; align-items: center; justify-content: center; }
            .qr-box svg { width: 100%; height: 100%; stroke: #000 !important; }
            .footer { text-align: center; font-size: 12px; margin-top: 12px; font-weight: 700; }
            @media print {
              body { padding: 4mm 4mm 6mm; }
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

        <div ref={receiptRef} className="bg-card border border-border rounded-lg p-4 font-mono text-sm font-semibold">
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
            {staffName && info?.showServerName !== false && (
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
                {modifierLines(item).map((line, i) => (
                  <p key={i} className="item-variation text-xs text-muted-foreground ml-4">
                    {line}
                  </p>
                ))}
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
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery:</span>
                <span className="text-foreground">₦{deliveryFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{taxHeading}:</span>
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
