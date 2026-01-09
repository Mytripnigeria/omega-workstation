import { useState } from "react";
import { History, Search, Eye, RotateCcw, Printer } from "lucide-react";
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

interface HistoricalOrder {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  time: string;
  status: string;
  source: string;
}

interface OrderHistoryModalProps {
  open: boolean;
  onClose: () => void;
  orders: HistoricalOrder[];
  onRecallOrder?: (order: HistoricalOrder) => void;
  onPrintReceipt?: (order: HistoricalOrder) => void;
}

const OrderHistoryModal = ({
  open,
  onClose,
  orders,
  onRecallOrder,
  onPrintReceipt,
}: OrderHistoryModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<HistoricalOrder | null>(null);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            placeholder="Search by order ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-4">
          {/* Orders List */}
          <ScrollArea className="flex-1 h-[400px]">
            <div className="space-y-2 pr-4">
              {filteredOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left bg-card border rounded-lg p-3 transition-all ${
                    selectedOrder?.id === order.id
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground">{order.id}</span>
                    <Badge variant="outline" className="text-xs">
                      {order.source}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{order.time}</span>
                    <span className="font-semibold text-primary">₦{order.total.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Order Details */}
          {selectedOrder && (
            <div className="w-64 bg-secondary/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">{selectedOrder.id}</h4>
              
              <div className="space-y-2 mb-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-muted-foreground">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 mb-4">
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">₦{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onPrintReceipt?.(selectedOrder)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                {onRecallOrder && (
                  <Button
                    size="sm"
                    className="w-full gradient-primary"
                    onClick={() => {
                      onRecallOrder(selectedOrder);
                      onClose();
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Recall Order
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderHistoryModal;
