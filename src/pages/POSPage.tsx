import { useState, useEffect, useCallback, useMemo } from "react";
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
  ListOrdered,
  Pause,
  History,
  Percent,
  RotateCcw,
  Printer,
  Bell,
  RefreshCw,
  User,
  Zap,
  Wallet,
  Check,
  X,
  Users,
  ArrowLeft,
  Star,
  Keyboard,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import ItemVariationModal from "@/components/ItemVariationModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToastNotification from "@/components/ToastNotification";
import ReceiptModal from "@/components/ReceiptModal";
import DiscountModal from "@/components/DiscountModal";
import OrderHistoryModal from "@/components/OrderHistoryModal";
import CountdownTimer from "@/components/CountdownTimer";
import OrderNotificationPopup from "@/components/OrderNotificationPopup";
import ActivityLog from "@/components/ActivityLog";
import ActivityLogButton from "@/components/ActivityLogButton";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal";
import StaffFinancePanel from "@/components/StaffFinancePanel";
import { useBeepSound } from "@/hooks/useBeepSound";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useCancelOrder, useCreateOrder, useOrders, useRecordPayment, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useMyActiveCashSession, useOpenCashSession, useCloseCashSession } from "@/hooks/useCashSession";
import { Label } from "@/components/ui/label";
import { workstationAuth } from "@/services/api";
import {
  getPaystackPublicKey,
  newPaystackReference,
  openPaystackCheckout,
} from "@/services/paystack";
import CategoryLoadError from "@/components/CategoryLoadError";

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

interface AddonGroup {
  id: string;
  name: string;
  maxSelection: number | null;
  options: Variation[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string | null;
  image?: string;
  description?: string;
  variations?: VariationGroup[];
  addonGroups?: AddonGroup[];
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

interface HeldOrder {
  id: string;
  label: string;
  total: number;
  cart: CartItem[];
  orderType: "dine-in" | "takeaway" | "delivery";
  customerName: string;
  createdAt: string;
}

interface IncomingOrder {
  id: string;
  /** Real backend order UUID (the display `id` is the #orderNumber label). */
  backendId?: string;
  source: "pos" | "website" | "ubereats" | "deliveroo" | "selfservice";
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  time: string;
  startTime: Date;
  estimatedMinutes: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "hold";
  tableNumber?: string;
  orderType?: "dine-in" | "takeaway" | "delivery";
  billType?: "quick" | "process";
}


const POSPage = () => {
  const navigate = useNavigate();
  const [posMode, setPosMode] = useState<"counter" | "selfservice">("counter");
  const {
    data: menuCategories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useCategories("menu");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Defaults to the "all" view so every loaded item is browsable without
  // searching; staff can then narrow by a specific category pill.

  // Load the live product menu for this staff's store.
  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts();

  // Offline availability: cache the loaded menu in localStorage and fall back
  // to it when the live fetch is empty/offline, so counter staff can keep
  // selecting items. The "Sync" button refreshes both menu + categories.
  const menuCacheKey = `pos_menu_cache_${workstationAuth.getStaff()?.storeId ?? "default"}`;
  useEffect(() => {
    if (products.length > 0) {
      try {
        localStorage.setItem(menuCacheKey, JSON.stringify(products));
      } catch {
        /* ignore quota/private-mode */
      }
    }
  }, [products, menuCacheKey]);

  const effectiveProducts = useMemo(() => {
    if (products.length > 0) return products;
    try {
      const raw = localStorage.getItem(menuCacheKey);
      return raw ? (JSON.parse(raw) as typeof products) : products;
    } catch {
      return products;
    }
  }, [products, menuCacheKey]);

  const handleSyncMenu = () => {
    refetchProducts();
    refetchCategories();
    setToast({ open: true, type: "info", title: "Syncing menu…" });
  };

  // Map backend Products → POS MenuItem. Backend variations are independent
  // variants each with their own sellingPrice; the POS expects a single
  // VariationGroup whose options carry a `priceModifier` relative to the
  // base, so we compute `priceModifier = variant.sellingPrice − basePrice`.
  const menuItems: MenuItem[] = useMemo(
    () =>
      effectiveProducts.map((p) => {
        const basePrice = Number(p.sellingPrice);
        const variations =
          p.variations && p.variations.length > 0
            ? [
                {
                  name: "Variant",
                  required: true,
                  options: p.variations.map((v) => ({
                    id: v.id,
                    name: v.name,
                    priceModifier: Number(v.sellingPrice) - basePrice,
                  })),
                },
              ]
            : undefined;
        const addonGroups = (p.addonGroups ?? [])
          .filter((g) => (g.addons ?? []).length > 0)
          .map((g) => ({
            id: g.id,
            name: g.name,
            maxSelection: g.maxSelection ?? null,
            options: (g.addons ?? [])
              .filter((a) => a.isAvailable !== false)
              .map((a) => ({
                id: a.id,
                name: a.name,
                priceModifier: Number(a.price),
              })),
          }))
          .filter((g) => g.options.length > 0);
        return {
          id: p.id,
          name: p.name,
          price: basePrice,
          categoryId: p.categoryId,
          image: p.imageUrl ?? undefined,
          description: p.description ?? undefined,
          variations,
          addonGroups: addonGroups.length > 0 ? addonGroups : undefined,
        };
      }),
    [effectiveProducts],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  // Held-order drafts persist across reloads so a counter can park a cart and
  // restore it later (repopulates the exact cart, variations + add-ons).
  const heldOrdersKey = `pos_held_orders_${workstationAuth.getStaff()?.storeId ?? "default"}`;
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    try {
      const raw = localStorage.getItem(`pos_held_orders_${workstationAuth.getStaff()?.storeId ?? "default"}`);
      return raw ? (JSON.parse(raw) as HeldOrder[]) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(heldOrdersKey, JSON.stringify(heldOrders));
    } catch {
      /* ignore */
    }
  }, [heldOrders, heldOrdersKey]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState("menu");
  // Real incoming orders for this store, polled every 5s.
  // Poll every channel's open orders, including freshly INITIATED ones that
  // await acceptance in the counter POS (all channels funnel through here).
  const { data: ordersPage } = useOrders({ status: "initiated,pending,preparing,ready", limit: 20 }, 5000);
  const incomingOrders: IncomingOrder[] = (ordersPage?.data ?? []).map((o) => ({
    id: `#${o.orderNumber}`,
    backendId: o.id,
    // The POS receipt UI only distinguishes pos/website/ubereats/deliveroo/selfservice;
    // phone-channel orders surface in the POS workflow indistinguishably from in-store.
    source: o.channel === "website" ? "website" : "pos",
    customerName: o.customerName ?? "Walk-in",
    items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, price: Number(i.unitPrice) })),
    total: Number(o.total),
    time: new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    startTime: new Date(o.createdAt),
    estimatedMinutes: 15,
    // Map backend lifecycle → POS panel states. INITIATED orders are brand-new
    // and show Accept/Reject; PENDING (accepted) shows Quick Bill / Kitchen.
    status:
      o.status === "ready"
        ? "ready"
        : o.status === "preparing"
          ? "preparing"
          : o.status === "initiated"
            ? "pending"
            : "confirmed",
    tableNumber: o.tableNumber ?? undefined,
    orderType: o.isDelivery ? "delivery" : o.tableNumber ? "dine-in" : "takeaway",
    billType: "process",
  }));
  // Local-only setter retained for transient UI flows (hold drafts). API-sourced
  // orders are mutated through the order hooks below.
  const setIncomingOrders = (_updater: unknown) => {
    void _updater;
  };
  const createOrderMutation = useCreateOrder();
  const recordPaymentMutation = useRecordPayment();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();
  const [autoAccept, setAutoAccept] = useState(false);

  // Register (cash session) gating — a counter must have an open register
  // before taking bookings.
  const { data: activeRegister, isLoading: registerLoading } = useMyActiveCashSession();
  const openRegisterMutation = useOpenCashSession();
  const closeRegisterMutation = useCloseCashSession();
  const [registerForm, setRegisterForm] = useState({ counterName: "", cashAtHand: "" });

  const handleOpenRegister = () => {
    const cash = Number(registerForm.cashAtHand);
    if (!registerForm.counterName.trim()) {
      setToast({ open: true, type: "error", title: "Counter name is required" });
      return;
    }
    if (!Number.isFinite(cash) || cash < 0) {
      setToast({ open: true, type: "error", title: "Enter a valid cash amount" });
      return;
    }
    openRegisterMutation.mutate(
      { counterName: registerForm.counterName.trim(), openingFloat: cash },
      {
        onSuccess: () => {
          setToast({ open: true, type: "success", title: "Register opened" });
          setRegisterForm({ counterName: "", cashAtHand: "" });
        },
        onError: (e: Error) =>
          setToast({ open: true, type: "error", title: e.message ?? "Failed to open register" }),
      },
    );
  };

  const handleCloseRegister = () => {
    if (!activeRegister) return;
    setConfirmDialog({
      open: true,
      title: "Close Register",
      description: "Close this register and end the session?",
      action: () =>
        closeRegisterMutation.mutate(
          {
            id: activeRegister.id,
            input: {
              actualCash: Number(activeRegister.expectedCash) || 0,
              actualCard: Number(activeRegister.expectedCard) || 0,
              actualMobile: Number(activeRegister.expectedMobile) || 0,
            },
          },
          {
            onSuccess: () =>
              setToast({ open: true, type: "success", title: "Register closed" }),
            onError: (e: Error) =>
              setToast({ open: true, type: "error", title: e.message ?? "Failed to close register" }),
          },
        ),
    });
  };
  const [discount, setDiscount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selfServiceReceipt, setSelfServiceReceipt] = useState<IncomingOrder | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({ open: false, title: "", description: "", action: () => {} });
  const [toast, setToast] = useState<{ open: boolean; type: "success" | "error" | "warning" | "info"; title: string; message?: string }>({ open: false, type: "success", title: "" });
  const [currentReceipt, setCurrentReceipt] = useState<IncomingOrder | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [orderNotification, setOrderNotification] = useState<{
    id: string;
    orderNumber: string;
    source: "ubereats" | "deliveroo" | "website" | "selfservice";
    customerName: string;
    itemCount: number;
    total: number;
    timestamp: Date;
  } | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">("dine-in");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [payingWithPaystack, setPayingWithPaystack] = useState(false);

  // Manager-only UI affordances. Permissions live on the staff JWT payload.
  const sessionStaff = workstationAuth.getStaff();
  const currentStaffId = sessionStaff?.id ?? "";
  const isManager = !!sessionStaff?.permissions?.includes("manage_orders");

  const playBeep = useBeepSound();

  // External-order push notifications wire in once webhook delivery is real (Phase 4+).


  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    // When searching, show items across all categories; otherwise show all
    // items ("all" view) or filter by the selected category.
    if (searchQuery.trim()) {
      return matchesSearch;
    }
    if (!selectedCategory || selectedCategory === "all") return true;
    return item.categoryId === selectedCategory;
  });

  const handleItemClick = (item: MenuItem) => {
    if (
      (item.variations && item.variations.length > 0) ||
      (item.addonGroups && item.addonGroups.length > 0)
    ) {
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

  // Submit the cart to the backend as a real Order. Returns the API order
  // plus the displayable IncomingOrder used by the receipt modal.
  const submitOrder = async (
    isDelivery: boolean,
    extraNotes?: string,
  ): Promise<{ order: Awaited<ReturnType<typeof createOrderMutation.mutateAsync>>; display: IncomingOrder } | null> => {
    if (cart.length === 0) return null;
    try {
      const order = await createOrderMutation.mutateAsync({
        channel: posMode === "selfservice" ? "website" : "pos",
        isDelivery,
        customerName: customerName || undefined,
        tableNumber: orderType === "dine-in" ? undefined : undefined,
        notes: extraNotes,
        taxAmount: tax,
        discountAmount: discount,
        items: cart.map((c) => ({
          productId: c.menuItemId,
          name: c.variationText ? `${c.name} (${c.variationText})` : c.name,
          quantity: c.quantity,
          unitPrice: c.price,
        })),
      });
      const display: IncomingOrder = {
        id: `#${order.orderNumber}`,
        source: "pos",
        customerName: order.customerName ?? "Walk-in",
        items: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: Number(i.unitPrice),
        })),
        total: Number(order.total),
        time: "Just now",
        startTime: new Date(order.createdAt),
        estimatedMinutes: 15,
        status: "pending",
        tableNumber: order.tableNumber ?? undefined,
        orderType: isDelivery ? "delivery" : order.tableNumber ? "dine-in" : "takeaway",
        billType: "process",
      };
      return { order, display };
    } catch (err) {
      setToast({
        open: true,
        type: "error",
        title: "Order failed",
        message: (err as Error).message,
      });
      return null;
    }
  };

  const handleQuickBill = () => {
    if (cart.length === 0) return;
    setConfirmDialog({
      open: true,
      title: "Quick Bill",
      description: "Submit this order. Continue?",
      action: async () => {
        const result = await submitOrder(orderType === "delivery");
        if (result) {
          setCurrentReceipt(result.display);
          setShowReceiptModal(true);
          setToast({ open: true, type: "success", title: "Order Submitted", message: `Order ${result.display.id} placed.` });
          setCart([]);
          setDiscount(0);
          setCustomerName("");
        }
      },
    });
  };

  const handleProcessBill = () => {
    if (cart.length === 0) return;
    setConfirmDialog({
      open: true,
      title: "Process Bill",
      description: "Send the order to the kitchen?",
      action: async () => {
        const result = await submitOrder(orderType === "delivery");
        if (result) {
          setCurrentReceipt(result.display);
          setShowReceiptModal(true);
          setToast({ open: true, type: "success", title: "Order Sent", message: `${result.display.id} sent to kitchen.` });
          setCart([]);
          setDiscount(0);
          setCustomerName("");
        }
      },
    });
  };

  const handleSelfServicePay = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  /**
   * Self-service Paystack flow. We pay first, then create the order. This
   * avoids leaving abandoned pending orders behind when a customer cancels
   * the popup. On verified payment we create the order and immediately
   * record it as paid with the Paystack reference, which fires the merchant
   * wallet credit on the backend.
   */
  const handlePaymentConfirmed = async () => {
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setToast({
        open: true,
        type: "error",
        title: "Email required",
        message: "Enter a valid email so we can send a receipt.",
      });
      return;
    }
    if (cart.length === 0) return;

    setPayingWithPaystack(true);
    try {
      const publicKey = await getPaystackPublicKey();
      const reference = newPaystackReference();
      const amountKobo = Math.round(total * 100);

      await new Promise<void>((resolve, reject) => {
        let settled = false;
        void openPaystackCheckout({
          email: customerEmail,
          amountKobo,
          reference,
          publicKey,
          metadata: {
            source: "workstation-selfservice",
            customerName: customerName || undefined,
          },
          onSuccess: async (ref) => {
            if (settled) return;
            settled = true;
            try {
              const result = await submitOrder(false);
              if (!result) throw new Error("Order creation failed after payment");

              // Mark the freshly-created order as paid with the Paystack ref.
              // This triggers the backend's merchant-wallet credit hook.
              await recordPaymentMutation.mutateAsync({
                id: result.order.id,
                amount: Number(result.order.total),
                paymentChannel: "paystack",
                paymentReference: ref,
              });

              setSelfServiceReceipt(result.display);
              setShowReceiptModal(true);
              setShowPaymentModal(false);
              setToast({
                open: true,
                type: "success",
                title: "Payment Successful",
                message: `Reference ${ref.slice(0, 12)}…`,
              });
              setCart([]);
              setDiscount(0);
              setCustomerName("");
              setCustomerEmail("");
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          onClose: () => {
            if (settled) return;
            settled = true;
            reject(new Error("Payment cancelled"));
          },
        });
      });
    } catch (err) {
      const message = (err as Error).message ?? "Payment failed";
      if (message !== "Payment cancelled") {
        setToast({
          open: true,
          type: "error",
          title: "Payment failed",
          message,
        });
      }
    } finally {
      setPayingWithPaystack(false);
    }
  };

  const holdOrder = () => {
    if (cart.length === 0) return;
    const held: HeldOrder = {
      id: `HOLD${Date.now().toString().slice(-5)}`,
      label: customerName || "Hold Order",
      total,
      cart,
      orderType,
      customerName,
      createdAt: new Date().toISOString(),
    };
    setHeldOrders((prev) => [held, ...prev]);
    setCart([]);
    setDiscount(0);
    setCustomerName("");
    setToast({ open: true, type: "info", title: "Order Held", message: "Order saved. Restore it from On Hold." });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Ctrl/Cmd + Enter - Process Bill (send to kitchen)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (cart.length > 0) handleProcessBill();
        return;
      }

      // Ctrl/Cmd + Shift + Enter - Quick Bill
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (cart.length > 0) handleQuickBill();
        return;
      }

      // Escape - Clear cart (with confirmation)
      if (e.key === 'Escape' && cart.length > 0) {
        e.preventDefault();
        setConfirmDialog({
          open: true,
          title: "Clear Cart",
          description: "Are you sure you want to clear all items from the cart?",
          action: () => {
            setCart([]);
            setDiscount(0);
            setCustomerName("");
            setToast({ open: true, type: "info", title: "Cart Cleared" });
          }
        });
        return;
      }

      // Ctrl/Cmd + H - Hold order
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        if (cart.length > 0) holdOrder();
        return;
      }

      // Ctrl/Cmd + D - Apply discount
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (cart.length > 0) setShowDiscountModal(true);
        return;
      }

      // Ctrl/Cmd + F - Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        return;
      }

      // Ctrl/Cmd + ? or Ctrl/Cmd + / - Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }

      // Number keys 1-8 for category selection
      if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[1-8]$/.test(e.key)) {
        const categoryIndex = parseInt(e.key) - 1;
        if (menuCategories[categoryIndex]) {
          setSelectedCategory(menuCategories[categoryIndex].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, handleQuickBill, handleProcessBill, holdOrder]);

  const recallOrder = (held: HeldOrder) => {
    const restore = () => {
      setCart(held.cart);
      setOrderType(held.orderType);
      setCustomerName(held.customerName);
      setHeldOrders((prev) => prev.filter((h) => h.id !== held.id));
    };
    if (cart.length > 0) {
      setConfirmDialog({
        open: true,
        title: "Restore held order",
        description: "This replaces the current cart with the held order. Continue?",
        action: restore,
      });
    } else {
      restore();
    }
  };

  const printReceipt = (order: IncomingOrder) => {
    setCurrentReceipt(order);
    setShowReceiptModal(true);
  };

  const getSourceIcon = (source: IncomingOrder["source"]) => {
    switch (source) {
      case "pos": return <Monitor className="w-3.5 h-3.5" />;
      case "website": return <Globe className="w-3.5 h-3.5" />;
      case "selfservice": return <Smartphone className="w-3.5 h-3.5" />;
      default: return <Smartphone className="w-3.5 h-3.5" />;
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

  const getOrderTypeLabel = (type?: string) => {
    switch (type) {
      case "dine-in": return "Dine In";
      case "takeaway": return "Takeaway";
      case "delivery": return "Delivery";
      default: return "";
    }
  };

  const activeOrders = incomingOrders.filter((o) => !["hold"].includes(o.status));

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {posMode === "counter" ? "Counter POS" : "Self-Service"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Staff Finance Panel */}
            {posMode === "counter" && (
              <StaffFinancePanel currentStaffId={currentStaffId} isManager={isManager} />
            )}
            
            {/* Keyboard Shortcuts Help */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKeyboardShortcuts(true)}
              className="rounded-xl hidden sm:flex"
              title="Keyboard Shortcuts (Ctrl+?)"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
            
            <ActivityLogButton onClick={() => setShowActivityLog(true)} />
            
            {/* Mode Toggle */}
            <div className="flex items-center bg-muted rounded-full p-1">
              <button
                onClick={() => setPosMode("counter")}
                className={`p-2 rounded-full transition-all ${
                  posMode === "counter" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Counter Mode"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPosMode("selfservice")}
                className={`p-2 rounded-full transition-all ${
                  posMode === "selfservice" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Self-Service Mode"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Counter Mode Tabs */}
        {posMode === "counter" && (
          <div className="bg-card border-b border-border px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted h-10">
                  <TabsTrigger value="menu" className="gap-2 rounded-lg">
                    <Utensils className="w-4 h-4" />
                    Menu
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="gap-2 rounded-lg">
                    <ListOrdered className="w-4 h-4" />
                    Orders
                    {activeOrders.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5">{activeOrders.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={handleSyncMenu}
                  disabled={productsLoading}
                  title="Sync menu for offline use"
                >
                  <RefreshCw className={`w-4 h-4 ${productsLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline ml-1">Sync</span>
                </Button>
                {activeRegister && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={handleCloseRegister}
                    disabled={closeRegisterMutation.isPending}
                  >
                    Close Register
                  </Button>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground hidden sm:inline">Auto Accept</span>
                  <Switch checked={autoAccept} onCheckedChange={setAutoAccept} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {(posMode === "selfservice" || (posMode === "counter" && activeTab === "menu")) && (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search menu..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className={`pl-12 rounded-xl border-border ${posMode === "selfservice" ? "h-14 text-lg" : "h-12"}`}
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {categoriesError ? (
                  <CategoryLoadError compact onRetry={() => refetchCategories()} />
                ) : categoriesLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-24 rounded-full bg-muted animate-pulse flex-shrink-0"
                    />
                  ))
                ) : (
                  <>
                    <button
                      key="__all__"
                      onClick={() => setSelectedCategory("all")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all font-medium ${
                        selectedCategory === "all"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border hover:border-primary/30"
                      } ${posMode === "selfservice" ? "text-base py-3 px-5" : "text-sm"}`}
                    >
                      <span>All</span>
                    </button>
                    {menuCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all font-medium ${
                          selectedCategory === cat.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border hover:border-primary/30"
                        } ${posMode === "selfservice" ? "text-base py-3 px-5" : "text-sm"}`}
                      >
                        {cat.emoji && <span>{cat.emoji}</span>}
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Category Title */}
              {selectedCategory && (
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  {selectedCategory === "all"
                    ? "All Items"
                    : menuCategories.find((c) => c.id === selectedCategory)?.name}
                  {selectedCategory !== "all" && (
                    <span>{menuCategories.find((c) => c.id === selectedCategory)?.emoji}</span>
                  )}
                </h2>
              )}

              {/* Menu Grid */}
              {productsError && (
                <div className="text-center py-8 mb-4 text-muted-foreground border border-dashed border-border rounded-xl">
                  <p className="mb-3 text-sm">Couldn't load products.</p>
                  <Button variant="outline" size="sm" onClick={() => refetchProducts()}>
                    Try again
                  </Button>
                </div>
              )}
              {!productsError && !productsLoading && products.length === 0 && (
                <div className="text-center py-8 mb-4 text-muted-foreground border border-dashed border-border rounded-xl">
                  <p className="text-sm">No products yet — add some from the merchant hub.</p>
                </div>
              )}
              {!productsError && !productsLoading && products.length > 0 && filteredItems.length === 0 && (
                <p className="text-center py-6 text-sm text-muted-foreground">
                  {searchQuery.trim() ? "No products match your search." : "No products in this category yet."}
                </p>
              )}
              <div className={`grid gap-3 ${
                posMode === "selfservice"
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              }`}>
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="bg-card rounded-2xl border border-border p-4 text-center hover:border-primary/30 hover:shadow-lg transition-all group flex flex-col items-center"
                  >
                    <div className={`flex items-center justify-center rounded-xl bg-muted mb-3 overflow-hidden ${
                      posMode === "selfservice" ? "w-16 h-16" : "w-14 h-14"
                    }`}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Utensils className={posMode === "selfservice" ? "w-7 h-7 text-muted-foreground" : "w-6 h-6 text-muted-foreground"} />
                      )}
                    </div>
                    <h3 className={`font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 ${
                      posMode === "selfservice" ? "text-sm" : "text-xs"
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-primary font-bold mt-1 ${posMode === "selfservice" ? "text-base" : "text-sm"}`}>
                      ₦{item.price.toLocaleString()}
                    </p>
                    <div 
                      className="mt-3 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                    >
                      <Plus className="w-4 h-4 text-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Orders Tab Content */}
          {posMode === "counter" && activeTab === "orders" && (
            <div className="space-y-4">
              {/* Hold Orders */}
              {heldOrders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Pause className="w-4 h-4" />
                    On Hold ({heldOrders.length})
                  </h3>
                  <div className="space-y-2">
                    {heldOrders.map((held) => (
                      <div key={held.id} className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground">{held.label}</span>
                          <p className="text-sm text-muted-foreground">
                            {held.cart.reduce((n, c) => n + c.quantity, 0)} item(s) · ₦{held.total.toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => recallOrder(held)} className="rounded-xl">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Orders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeOrders.map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1 rounded-lg">
                          {getSourceIcon(order.source)}
                          {order.source.toUpperCase()}
                        </Badge>
                        <span className="font-semibold text-foreground">{order.id}</span>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} rounded-lg`}>{order.status}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{order.customerName} • {order.time}</p>

                    <div className="space-y-1 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{item.quantity}x {item.name}</span>
                          <span className="text-muted-foreground">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="font-bold text-foreground">₦{order.total.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => printReceipt(order)} className="rounded-lg">
                          <Printer className="w-4 h-4" />
                        </Button>
                        {order.status === "pending" && order.backendId && (
                          <>
                            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => cancelOrderMutation.mutate({ id: order.backendId!, reason: "Rejected" })}>
                              Reject
                            </Button>
                            <Button size="sm" className="rounded-lg" onClick={() => updateOrderStatusMutation.mutate({ id: order.backendId!, status: "pending" })}>
                              Accept
                            </Button>
                          </>
                        )}
                        {order.status === "confirmed" && order.backendId && (
                          <>
                            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => updateOrderStatusMutation.mutate({ id: order.backendId!, status: "ready" })}>
                              Quick Bill
                            </Button>
                            <Button size="sm" className="rounded-lg" onClick={() => updateOrderStatusMutation.mutate({ id: order.backendId!, status: "preparing" })}>
                              <ChefHat className="w-4 h-4 mr-1" />
                              Kitchen
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-full lg:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col max-h-[50vh] lg:max-h-screen lg:h-screen">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Your Order</h2>
          </div>
          {posMode === "counter" && (
            <Button size="sm" variant="ghost" onClick={() => setShowHistoryModal(true)} className="rounded-lg">
              <History className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Order Type & Customer */}
        {posMode === "counter" && (
          <div className="p-4 border-b border-border space-y-3">
            <Select value={orderType} onValueChange={(v: "dine-in" | "takeaway" | "delivery") => setOrderType(v)}>
              <SelectTrigger className="w-full h-11 rounded-xl">
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dine-in">Dine In</SelectItem>
                <SelectItem value="takeaway">Takeaway</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Customer name (optional)" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                className="pl-11 h-11 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Self-Service Name */}
        {posMode === "selfservice" && (
          <div className="p-4 border-b border-border">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Enter your name" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                className="pl-11 h-12 rounded-xl text-base"
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-base">Your cart is empty</p>
              <p className="text-sm">Add items to get started</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                  {(() => {
                    const img = menuItems.find((m) => m.id === item.menuItemId)?.image;
                    return img ? (
                      <img src={img} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Utensils className="w-5 h-5 text-muted-foreground" />
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{item.name}</p>
                  {item.variationText && <p className="text-xs text-muted-foreground">{item.variationText}</p>}
                  <p className="text-sm text-muted-foreground">₦{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 bg-card border border-border rounded-lg">
                  <button className="p-2 hover:bg-muted rounded-l-lg transition-colors" onClick={() => updateQuantity(item.id, -1)}>
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                  <button className="p-2 hover:bg-muted rounded-r-lg transition-colors" onClick={() => updateQuantity(item.id, 1)}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Actions */}
        <div className="p-4 border-t border-border bg-card">
          {cart.length > 0 && (
            <>
              {/* Points Earned */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 bg-muted/50 rounded-lg p-3">
                <Star className="w-4 h-4 text-category-cream" />
                <span>Earn <span className="font-semibold text-foreground">{Math.floor(subtotal / 100)}</span> points with this order</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₦{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-status-success">
                    <span>Discount</span>
                    <span>-₦{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">₦{Math.round(tax).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>₦{Math.round(total).toLocaleString()}</span>
                </div>
              </div>
            </>
          )}

          {/* Counter Mode Actions */}
          {posMode === "counter" && (
            <>
              {cart.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mb-3 rounded-xl" 
                  onClick={() => setShowDiscountModal(true)}
                >
                  <Percent className="w-4 h-4 mr-2" />
                  {discount > 0 ? `Discount: ₦${discount.toLocaleString()}` : "Add Discount"}
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2 mb-2">
                <Button variant="outline" className="h-12 rounded-xl" disabled={cart.length === 0} onClick={handleQuickBill}>
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Bill
                </Button>
                <Button className="h-12 rounded-xl" disabled={cart.length === 0} onClick={handleProcessBill}>
                  <ChefHat className="w-4 h-4 mr-2" />
                  Process Bill
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="h-11 rounded-xl" disabled={cart.length === 0} onClick={holdOrder}>
                  <Pause className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="h-11 rounded-xl" disabled={cart.length === 0}>
                  <Banknote className="w-4 h-4 mr-1" />
                  Cash
                </Button>
                <Button className="h-11 rounded-xl" disabled={cart.length === 0}>
                  <CreditCard className="w-4 h-4 mr-1" />
                  Card
                </Button>
              </div>
            </>
          )}

          {/* Self-Service Actions */}
          {posMode === "selfservice" && (
            <Button 
              className="w-full h-14 text-lg font-semibold rounded-xl" 
              disabled={cart.length === 0}
              onClick={handleSelfServicePay}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Checkout • ₦{Math.round(total).toLocaleString()}
            </Button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={(open) => { if (!payingWithPaystack) setShowPaymentModal(open); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Complete Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground mb-2">₦{Math.round(total).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pay securely with your card via Paystack</p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-muted-foreground">Your name (optional)</span>
                <Input
                  className="h-12 rounded-xl mt-1"
                  placeholder="Full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={payingWithPaystack}
                />
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground">Email — for receipt</span>
                <Input
                  className="h-12 rounded-xl mt-1"
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={payingWithPaystack}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl"
                onClick={() => setShowPaymentModal(false)}
                disabled={payingWithPaystack}
              >
                Cancel
              </Button>
              <Button
                className="h-12 rounded-xl"
                onClick={handlePaymentConfirmed}
                disabled={payingWithPaystack || cart.length === 0}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {payingWithPaystack ? "Processing…" : "Pay with Paystack"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <ItemVariationModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} />
      {/* Open Register gate — shown for counter mode when no register is open */}
      <Dialog open={posMode === "counter" && !registerLoading && !activeRegister}>
        <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Open Register</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Counter Name</Label>
              <Input
                placeholder="e.g., Counter 1"
                value={registerForm.counterName}
                onChange={(e) => setRegisterForm((p) => ({ ...p, counterName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cash at Hand</Label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={registerForm.cashAtHand}
                onChange={(e) => setRegisterForm((p) => ({ ...p, cashAtHand: e.target.value }))}
              />
            </div>
            <Button className="w-full rounded-xl" onClick={handleOpenRegister} disabled={openRegisterMutation.isPending}>
              Open Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} title={confirmDialog.title} description={confirmDialog.description} onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} />
      <ToastNotification open={toast.open} onClose={() => setToast({ ...toast, open: false })} type={toast.type} title={toast.title} message={toast.message} />
      <DiscountModal open={showDiscountModal} onClose={() => setShowDiscountModal(false)} subtotal={subtotal} onApplyDiscount={setDiscount} />
      <OrderHistoryModal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
      {currentReceipt && <ReceiptModal open={showReceiptModal} onClose={() => { setShowReceiptModal(false); setCurrentReceipt(null); setSelfServiceReceipt(null); }} orderId={currentReceipt.id} items={currentReceipt.items} subtotal={currentReceipt.total * 0.925} tax={currentReceipt.total * 0.075} total={currentReceipt.total} customerName={currentReceipt.customerName} />}
      {selfServiceReceipt && !currentReceipt && <ReceiptModal open={showReceiptModal} onClose={() => { setShowReceiptModal(false); setSelfServiceReceipt(null); }} orderId={selfServiceReceipt.id} items={selfServiceReceipt.items} subtotal={selfServiceReceipt.total * 0.925} tax={selfServiceReceipt.total * 0.075} total={selfServiceReceipt.total} customerName={selfServiceReceipt.customerName} />}
      
      {/* Order Notification Popup */}
      <OrderNotificationPopup 
        notification={orderNotification}
        onDismiss={() => setOrderNotification(null)}
        onViewOrder={() => {
          setOrderNotification(null);
          setActiveTab("orders");
        }}
      />
      
      {/* Activity Log */}
      <ActivityLog 
        open={showActivityLog} 
        onClose={() => setShowActivityLog(false)} 
        pageName="Counter POS" 
      />
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        open={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />
    </div>
  );
};

export default POSPage;
