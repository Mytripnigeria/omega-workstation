import { useState } from "react";
import { History, Search, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrders } from "@/hooks/useOrders";
import type { Order } from "@/types/order";

interface OrderHistoryModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional callback to print a receipt for the selected order. */
  onPrintReceipt?: (order: Order) => void;
}

const OrderHistoryModal = ({ open, onClose, onPrintReceipt }: OrderHistoryModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useOrders(
    {
      limit: 50,
      search: searchQuery || undefined,
    },
    open ? 10000 : undefined,
  );
  const orders = data?.data ?? [];
  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Order History
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, customer, table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-4">
          <ScrollArea className="flex-1 h-[400px]">
            <div className="space-y-2 pr-4">
              {isLoading && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Loading orders...
                </p>
              )}
              {!isLoading && orders.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No orders match.
                </p>
              )}
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className={`w-full text-left bg-card border rounded-lg p-3 transition-all ${
                    selectedId === order.id
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground">
                      #{order.orderNumber}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName ?? "Walk-in customer"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(order.createdAt)}
                    </span>
                    <span className="font-semibold text-primary">
                      ₦{order.total.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {selectedOrder && (
            <div className="w-64 bg-secondary/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">
                #{selectedOrder.orderNumber}
              </h4>

              <div className="space-y-2 mb-4">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="text-muted-foreground">
                      ₦{item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 mb-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₦{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.taxAmount > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tax</span>
                    <span>₦{selectedOrder.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Discount</span>
                    <span>-₦{selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold mt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    ₦{selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {onPrintReceipt && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onPrintReceipt(selectedOrder)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderHistoryModal;
