import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Utensils,
  Monitor,
  Globe,
  Smartphone,
  ChefHat,
  Receipt,
  ListOrdered,
  Pause,
  History,
  Percent,
  RotateCcw,
  Printer,
  Bell,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/PageHeader";
import ItemVariationModal from "@/components/ItemVariationModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import ReceiptModal from "@/components/ReceiptModal";
import DiscountModal from "@/components/DiscountModal";
import OrderHistoryModal from "@/components/OrderHistoryModal";
import CountdownTimer from "@/components/CountdownTimer";
import { useBeepSound } from "@/hooks/useBeepSound";

interface Variation {
  id: string;
  name: string;
  priceModifier: number;
}

interface VariationGroup {
  name: string;
  required: boolean;
  options: Variation[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  variations?: VariationGroup[];
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variations?: Record<string, Variation>;
  variationText?: string;
}

interface IncomingOrder {
  id: string;
  source: "pos" | "website" | "ubereats" | "deliveroo";
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  time: string;
  startTime: Date;
  estimatedMinutes: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "hold";
  tableNumber?: string;
}

const categories = [
  { id: "all", name: "All Items", icon: "🍽️" },
  { id: "jollof", name: "Jollof", icon: "🍚" },
  { id: "rice", name: "Rice", icon: "🍛" },
  { id: "protein", name: "Protein", icon: "🍗" },
  { id: "sides", name: "Sides", icon: "🥗" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
];

const menuItems: MenuItem[] = [
  { id: "1", name: "Jollof Rice", price: 1500, category: "jollof", variations: [{ name: "Size", required: true, options: [{ id: "s1", name: "Small", priceModifier: 0 }, { id: "s2", name: "Medium", priceModifier: 500 }, { id: "s3", name: "Large", priceModifier: 1000 }] }] },
  { id: "2", name: "Fried Rice", price: 1800, category: "rice", variations: [{ name: "Size", required: true, options: [{ id: "s1", name: "Small", priceModifier: 0 }, { id: "s2", name: "Medium", priceModifier: 500 }, { id: "s3", name: "Large", priceModifier: 1000 }] }] },
  { id: "3", name: "White Rice", price: 1200, category: "rice" },
  { id: "4", name: "Grilled Chicken", price: 2500, category: "protein" },
  { id: "5", name: "Fried Fish", price: 2000, category: "protein" },
  { id: "6", name: "Beef Suya", price: 1800, category: "protein" },
  { id: "7", name: "Plantain", price: 500, category: "sides" },
  { id: "8", name: "Coleslaw", price: 400, category: "sides" },
  { id: "9", name: "Moi Moi", price: 600, category: "sides" },
  { id: "10", name: "Chapman", price: 800, category: "drinks", variations: [{ name: "Size", required: false, options: [{ id: "d1", name: "Regular", priceModifier: 0 }, { id: "d2", name: "Large", priceModifier: 300 }] }] },
  { id: "11", name: "Zobo", price: 500, category: "drinks" },
  { id: "12", name: "Water", price: 200, category: "drinks" },
];

const mockIncomingOrders: IncomingOrder[] = [
  { id: "#ORD001", source: "pos", customerName: "Walk-in", items: [{ name: "Jollof Rice (L)", quantity: 1, price: 2500 }, { name: "Chapman", quantity: 2, price: 800 }], total: 4100, time: "2 min ago", startTime: new Date(Date.now() - 2 * 60000), estimatedMinutes: 15, status: "preparing", tableNumber: "5" },
  { id: "#ORD002", source: "website", customerName: "Jane Okafor", items: [{ name: "Fried Rice (M)", quantity: 2, price: 2300 }, { name: "Grilled Chicken", quantity: 2, price: 2500 }], total: 9600, time: "5 min ago", startTime: new Date(Date.now() - 5 * 60000), estimatedMinutes: 20, status: "pending" },
  { id: "#ORD003", source: "ubereats", customerName: "Mike Johnson", items: [{ name: "Beef Suya", quantity: 3, price: 1800 }], total: 5400, time: "8 min ago", startTime: new Date(Date.now() - 8 * 60000), estimatedMinutes: 12, status: "confirmed" },
];

const mockOrderHistory = [
  { id: "#ORD098", customerName: "Ada Eze", items: [{ name: "Jollof Rice", quantity: 2, price: 1500 }], total: 3000, time: "1 hour ago", status: "completed", source: "POS" },
  { id: "#ORD097", customerName: "Chidi Obi", items: [{ name: "Fried Rice", quantity: 1, price: 1800 }, { name: "Chicken", quantity: 1, price: 2500 }], total: 4300, time: "2 hours ago", status: "completed", source: "Website" },
];

const POSPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState("menu");
  const [incomingOrders, setIncomingOrders] = useState<IncomingOrder[]>(mockIncomingOrders);
  const [autoAccept, setAutoAccept] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({ open: false, title: "", description: "", action: () => {} });
  const [toast, setToast] = useState<{ open: boolean; type: "success" | "error" | "warning" | "info"; title: string; message?: string }>({ open: false, type: "success", title: "" });
  const [currentReceipt, setCurrentReceipt] = useState<IncomingOrder | null>(null);

  const playBeep = useBeepSound();

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleItemClick = (item: MenuItem) => {
    if (item.variations && item.variations.length > 0) {
      setSelectedItem(item);
    } else {
      addToCart(item, {});
    }
  };

  const addToCart = useCallback((item: MenuItem, selectedVariations: Record<string, Variation>) => {
    playBeep();
    const variationText = Object.values(selectedVariations).map((v) => v.name).join(", ");
    let finalPrice = item.price;
    Object.values(selectedVariations).forEach((v) => { finalPrice += v.priceModifier; });
    const cartItemId = `${item.id}-${JSON.stringify(selectedVariations)}`;
    
    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) => i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: cartItemId, menuItemId: item.id, name: item.name, price: finalPrice, quantity: 1, variations: selectedVariations, variationText }];
    });
  }, [playBeep]);

  const updateQuantity = (id: string, delta: number) => {
    playBeep();
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = (subtotal - discount) * 0.075;
  const total = subtotal - discount + tax;

  const sendToKitchen = () => {
    if (cart.length === 0) return;
    setConfirmDialog({
      open: true, title: "Send to Kitchen", description: "Are you sure you want to send this order to the kitchen?",
      action: () => {
        setToast({ open: true, type: "success", title: "Order Sent!", message: "Order has been sent to the kitchen" });
        setCart([]);
        setDiscount(0);
      }
    });
  };

  const holdOrder = () => {
    if (cart.length === 0) return;
    const holdOrder: IncomingOrder = {
      id: `#HOLD${Date.now().toString().slice(-4)}`,
      source: "pos",
      customerName: "Hold Order",
      items: cart.map((c) => ({ name: c.name, quantity: c.quantity, price: c.price })),
      total: total,
      time: "Just now",
      startTime: new Date(),
      estimatedMinutes: 0,
      status: "hold",
    };
    setIncomingOrders((prev) => [holdOrder, ...prev]);
    setCart([]);
    setDiscount(0);
    setToast({ open: true, type: "info", title: "Order Held", message: "Order saved. Click to restore." });
  };

  const recallOrder = (order: IncomingOrder) => {
    setConfirmDialog({
      open: true, title: "Recall Order", description: "This will move the order back to your cart. Continue?",
      action: () => {
        order.items.forEach((item) => {
          for (let i = 0; i < item.quantity; i++) {
            const menuItem = menuItems.find((m) => item.name.includes(m.name));
            if (menuItem) addToCart(menuItem, {});
          }
        });
        setIncomingOrders((prev) => prev.filter((o) => o.id !== order.id));
      }
    });
  };

  const printReceipt = (order: IncomingOrder) => {
    setCurrentReceipt(order);
    setShowReceiptModal(true);
  };

  const getSourceIcon = (source: IncomingOrder["source"]) => {
    switch (source) {
      case "pos": return <Monitor className="w-4 h-4" />;
      case "website": return <Globe className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: IncomingOrder["status"]) => {
    switch (status) {
      case "pending": return "bg-status-warning text-foreground";
      case "confirmed": return "bg-status-info text-white";
      case "preparing": return "bg-status-process text-white";
      case "ready": return "bg-status-success text-white";
      case "hold": return "bg-muted text-muted-foreground";
    }
  };

  const pendingOrders = incomingOrders.filter((o) => o.status === "pending");
  const holdOrders = incomingOrders.filter((o) => o.status === "hold");
  const activeOrders = incomingOrders.filter((o) => !["pending", "hold"].includes(o.status));

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
        <PageHeader title="Counter POS" icon={Monitor} iconColor="text-category-mint" />

        {/* Auto Accept Toggle */}
        <div className="flex items-center justify-between bg-card border border-border rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Auto Accept Orders</span>
          </div>
          <Switch checked={autoAccept} onCheckedChange={setAutoAccept} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="menu" className="flex-1 sm:flex-none"><Utensils className="w-4 h-4 mr-2" />Menu</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 sm:flex-none"><ListOrdered className="w-4 h-4 mr-2" />Orders<Badge variant="secondary" className="ml-2">{incomingOrders.length}</Badge></TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search menu items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:border-primary/50"}`}>
                  <span>{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <button key={item.id} onClick={() => handleItemClick(item)} className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary/50 transition-all group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary mb-2">
                    <Utensils className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground text-xs group-hover:text-primary line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-primary font-semibold text-sm">₦{item.price.toLocaleString()}</p>
                    {item.variations && <Badge variant="outline" className="text-xs">+Options</Badge>}
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4 space-y-4">
            {/* Hold Orders */}
            {holdOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2"><Pause className="w-4 h-4" />On Hold ({holdOrders.length})</h3>
                <div className="space-y-2">
                  {holdOrders.map((order) => (
                    <div key={order.id} className="bg-muted/30 border border-border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-foreground">{order.id}</span>
                        <p className="text-sm text-muted-foreground">₦{order.total.toLocaleString()}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => recallOrder(order)}><RotateCcw className="w-4 h-4 mr-1" />Restore</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Orders */}
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">{getSourceIcon(order.source)}{order.source.toUpperCase()}</Badge>
                    <span className="font-semibold text-foreground">{order.id}</span>
                    {order.tableNumber && <Badge variant="secondary">Table {order.tableNumber}</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {(order.status === "preparing" || order.status === "confirmed") && (
                      <CountdownTimer targetMinutes={order.estimatedMinutes} startTime={order.startTime} />
                    )}
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{order.customerName} • {order.time}</p>
                <div className="space-y-1 mb-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.quantity}x {item.name}</span>
                      <span className="text-muted-foreground">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="font-semibold text-foreground">Total: ₦{order.total.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => printReceipt(order)}><Printer className="w-4 h-4" /></Button>
                    {order.status === "pending" && <Button size="sm" onClick={() => setIncomingOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "confirmed" } : o))}>Confirm</Button>}
                    {order.status === "confirmed" && <Button size="sm" className="gradient-primary" onClick={() => setIncomingOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "preparing" } : o))}><ChefHat className="w-4 h-4 mr-1" />Kitchen</Button>}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-full lg:w-80 xl:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border p-3 sm:p-4 flex flex-col max-h-[50vh] lg:max-h-screen lg:h-screen">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Current Order</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowHistoryModal(true)}><History className="w-4 h-4" /></Button>
        </div>

        <div className="flex-1 overflow-auto space-y-2 mb-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-6"><ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-50" /><p>No items in cart</p></div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-secondary/50 rounded-xl p-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                  {item.variationText && <p className="text-xs text-muted-foreground truncate">{item.variationText}</p>}
                  <p className="text-xs text-muted-foreground">₦{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}><Minus className="w-3 h-3" /></Button>
                  <span className="w-5 text-center font-medium text-sm">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}><Plus className="w-3 h-3" /></Button>
                </div>
                <p className="font-semibold text-foreground w-16 text-right text-sm">₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-3 space-y-2 mb-3">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">₦{subtotal.toLocaleString()}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm text-status-success"><span>Discount</span><span>-₦{discount.toLocaleString()}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">VAT (7.5%)</span><span className="text-foreground">₦{tax.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold pt-2 border-t border-border"><span className="text-foreground">Total</span><span className="text-primary">₦{total.toLocaleString()}</span></div>
        </div>

        {/* Discount Button */}
        <Button variant="outline" size="sm" className="mb-3" onClick={() => setShowDiscountModal(true)} disabled={cart.length === 0}>
          <Percent className="w-4 h-4 mr-2" />{discount > 0 ? `Discount: ₦${discount.toLocaleString()}` : "Add Discount"}
        </Button>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button variant="secondary" className="h-10" disabled={cart.length === 0} onClick={sendToKitchen}><ChefHat className="w-4 h-4 mr-1" />Kitchen</Button>
          <Button variant="outline" className="h-10" disabled={cart.length === 0} onClick={holdOrder}><Pause className="w-4 h-4 mr-1" />Hold</Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="h-10" disabled={cart.length === 0}><Banknote className="w-4 h-4 mr-1" />Cash</Button>
          <Button className="h-10 gradient-primary" disabled={cart.length === 0}><CreditCard className="w-4 h-4 mr-1" />Card</Button>
        </div>
      </div>

      {/* Modals */}
      <ItemVariationModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} />
      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} title={confirmDialog.title} description={confirmDialog.description} onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} />
      <ToastNotification open={toast.open} onClose={() => setToast({ ...toast, open: false })} type={toast.type} title={toast.title} message={toast.message} />
      <DiscountModal open={showDiscountModal} onClose={() => setShowDiscountModal(false)} subtotal={subtotal} onApplyDiscount={setDiscount} />
      <OrderHistoryModal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} orders={mockOrderHistory} onRecallOrder={(o) => { }} onPrintReceipt={(o) => { }} />
      {currentReceipt && <ReceiptModal open={showReceiptModal} onClose={() => setShowReceiptModal(false)} orderId={currentReceipt.id} items={currentReceipt.items} subtotal={currentReceipt.total * 0.925} tax={currentReceipt.total * 0.075} total={currentReceipt.total} customerName={currentReceipt.customerName} />}
    </div>
  );
};

export default POSPage;
