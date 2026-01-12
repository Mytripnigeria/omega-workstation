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
  ListOrdered,
  Pause,
  History,
  Percent,
  RotateCcw,
  Printer,
  Bell,
  Clock,
  User,
  Zap,
  Wallet,
  Copy,
  Check,
  X,
  Users,
  ArrowLeft,
  Star,
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
  image?: string;
  description?: string;
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

const categories = [
  { id: "popular", name: "Popular", icon: "🔥" },
  { id: "new", name: "New Release", icon: "✨" },
  { id: "specialties", name: "Specialties", icon: "👨‍🍳" },
  { id: "starters", name: "Starters", icon: "🥗" },
  { id: "mains", name: "Mains", icon: "🍽️" },
  { id: "sides", name: "Sides", icon: "🍟" },
  { id: "drinks", name: "Drinks", icon: "🧃" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
];

const menuItems: MenuItem[] = [
  // Popular
  { id: "1", name: "Jollof Rice", price: 3500, category: "popular", image: "🍚", description: "Smoky party-style jollof with perfectly seasoned tomato base", variations: [{ name: "Size", required: true, options: [{ id: "s1", name: "Regular", priceModifier: 0 }, { id: "s2", name: "Large", priceModifier: 1000 }] }] },
  { id: "2", name: "Peppered Chicken", price: 2800, category: "popular", image: "🍗", description: "Crispy fried chicken in signature spicy pepper sauce" },
  { id: "3", name: "Suya", price: 4500, category: "popular", image: "🥩", description: "Thinly sliced beef skewers with yaji spice and onions" },
  { id: "4", name: "Egusi & Pounded Yam", price: 5500, category: "popular", image: "🍲", description: "Rich melon seed soup with smooth pounded yam" },
  { id: "5", name: "Fried Rice", price: 3800, category: "popular", image: "🍛", description: "Nigerian fried rice with mixed vegetables and chicken", variations: [{ name: "Size", required: true, options: [{ id: "fr1", name: "Regular", priceModifier: 0 }, { id: "fr2", name: "Large", priceModifier: 1000 }] }] },
  { id: "6", name: "Pepper Soup", price: 4000, category: "popular", image: "🥣", description: "Spicy aromatic soup with catfish or goat meat", variations: [{ name: "Protein", required: true, options: [{ id: "ps1", name: "Catfish", priceModifier: 0 }, { id: "ps2", name: "Goat Meat", priceModifier: 500 }] }] },
  // New Release
  { id: "7", name: "Ofada Rice & Ayamase", price: 4500, category: "new", image: "🍛", description: "Unpolished ofada rice with spicy green pepper sauce" },
  { id: "8", name: "Afang Soup", price: 5200, category: "new", image: "🥬", description: "Cross River delicacy with afang leaves and water leaf" },
  { id: "9", name: "Nkwobi", price: 4800, category: "new", image: "🥘", description: "Spicy cow foot in palm oil sauce - Igbo specialty" },
  { id: "10", name: "Peppered Gizzard", price: 3200, category: "new", image: "🍖", description: "Tender gizzard in hot pepper sauce" },
  { id: "11", name: "Boli & Fish", price: 2500, category: "new", image: "🍌", description: "Roasted plantain with grilled tilapia and pepper sauce" },
  // Specialties
  { id: "12", name: "Banga Soup & Starch", price: 5500, category: "specialties", image: "🍲", description: "Palm fruit soup with starch - Delta specialty" },
  { id: "13", name: "Efo Riro", price: 4800, category: "specialties", image: "🥬", description: "Yoruba spinach stew with assorted meat and stockfish" },
  { id: "14", name: "Oha Soup", price: 5000, category: "specialties", image: "🥗", description: "Traditional Igbo soup with oha leaves and cocoyam" },
  { id: "15", name: "Edikang Ikong", price: 5800, category: "specialties", image: "🥬", description: "Premium vegetable soup with pumpkin and water leaves" },
  { id: "16", name: "Asun", price: 5000, category: "specialties", image: "🥘", description: "Spicy grilled goat meat - Lagos party favorite" },
  { id: "17", name: "Isi Ewu", price: 6500, category: "specialties", image: "🐐", description: "Spiced goat head delicacy with utazi leaves" },
  { id: "18", name: "Ogbono Soup", price: 4500, category: "specialties", image: "🍲", description: "Draw soup made with wild mango seeds", variations: [{ name: "Swallow", required: true, options: [{ id: "og1", name: "Pounded Yam", priceModifier: 0 }, { id: "og2", name: "Eba", priceModifier: 0 }, { id: "og3", name: "Semo", priceModifier: 0 }] }] },
  // Starters
  { id: "19", name: "Small Chops", price: 3500, category: "starters", image: "🍢", description: "Samosa, spring rolls, puff puff, and chicken strips" },
  { id: "20", name: "Pepper Snail", price: 4500, category: "starters", image: "🐚", description: "Tender snails in spicy pepper sauce" },
  { id: "21", name: "Gizdodo", price: 2800, category: "starters", image: "🍗", description: "Fried gizzard with diced fried plantain" },
  { id: "22", name: "Chicken Wings", price: 3200, category: "starters", image: "🍗", description: "Crispy wings with suya or BBQ sauce", variations: [{ name: "Sauce", required: false, options: [{ id: "cw1", name: "Suya", priceModifier: 0 }, { id: "cw2", name: "BBQ", priceModifier: 0 }, { id: "cw3", name: "Pepper", priceModifier: 200 }] }] },
  { id: "23", name: "Yam Fries", price: 1500, category: "starters", image: "🍟", description: "Crispy yam strips with pepper dipping sauce" },
  { id: "24", name: "Kilishi", price: 2500, category: "starters", image: "🥩", description: "Nigerian beef jerky with groundnut spice" },
  // Mains
  { id: "25", name: "Pounded Yam & Soup", price: 4500, category: "mains", image: "🍚", description: "Fresh pounded yam with choice of soup", variations: [{ name: "Soup", required: true, options: [{ id: "py1", name: "Egusi", priceModifier: 0 }, { id: "py2", name: "Ogbono", priceModifier: 0 }, { id: "py3", name: "Efo Riro", priceModifier: 200 }] }] },
  { id: "26", name: "Amala & Ewedu", price: 4000, category: "mains", image: "🍛", description: "Yam flour swallow with ewedu and gbegiri" },
  { id: "27", name: "Semo & Okra Soup", price: 3800, category: "mains", image: "🍚", description: "Semolina swallow with fresh okra and seafood" },
  { id: "28", name: "Jollof Spaghetti", price: 2800, category: "mains", image: "🍝", description: "Nigerian-style pasta in tomato stew" },
  { id: "29", name: "Beans & Plantain", price: 2500, category: "mains", image: "🫘", description: "Honey beans porridge with fried plantain" },
  { id: "30", name: "Tuwo Shinkafa", price: 3500, category: "mains", image: "🍚", description: "Rice swallow with miyan kuka or taushe" },
  { id: "31", name: "White Rice & Stew", price: 2800, category: "mains", image: "🍛", description: "Steamed rice with rich tomato stew", variations: [{ name: "Protein", required: true, options: [{ id: "wr1", name: "Chicken", priceModifier: 0 }, { id: "wr2", name: "Beef", priceModifier: 300 }, { id: "wr3", name: "Fish", priceModifier: 500 }] }] },
  // Sides
  { id: "32", name: "Dodo (Fried Plantain)", price: 800, category: "sides", image: "🍌", description: "Sweet ripe plantains fried golden" },
  { id: "33", name: "Moi Moi", price: 600, category: "sides", image: "🫘", description: "Steamed bean pudding with eggs and fish" },
  { id: "34", name: "Coleslaw", price: 500, category: "sides", image: "🥗", description: "Fresh creamy coleslaw salad" },
  { id: "35", name: "Extra Meat", price: 1500, category: "sides", image: "🥩", description: "Additional assorted meat or ponmo", variations: [{ name: "Type", required: true, options: [{ id: "em1", name: "Beef", priceModifier: 0 }, { id: "em2", name: "Goat", priceModifier: 300 }, { id: "em3", name: "Ponmo", priceModifier: -200 }] }] },
  { id: "36", name: "Steamed Vegetables", price: 800, category: "sides", image: "🥦", description: "Mixed vegetables lightly seasoned" },
  { id: "37", name: "Akara", price: 500, category: "sides", image: "🧆", description: "Fried bean cakes - 5 pieces" },
  // Drinks
  { id: "38", name: "Chapman", price: 1500, category: "drinks", image: "🍹", description: "Nigerian cocktail with Fanta, Sprite, and grenadine", variations: [{ name: "Size", required: false, options: [{ id: "d1", name: "Regular", priceModifier: 0 }, { id: "d2", name: "Large Jug", priceModifier: 2000 }] }] },
  { id: "39", name: "Zobo", price: 800, category: "drinks", image: "🧃", description: "Refreshing hibiscus drink with ginger and pineapple" },
  { id: "40", name: "Palm Wine", price: 1200, category: "drinks", image: "🥛", description: "Fresh natural palm wine - chilled" },
  { id: "41", name: "Kunu", price: 700, category: "drinks", image: "🥤", description: "Traditional millet drink with spices" },
  { id: "42", name: "Fresh Juice", price: 1000, category: "drinks", image: "🍊", description: "Orange, pineapple or watermelon", variations: [{ name: "Flavor", required: true, options: [{ id: "fj1", name: "Orange", priceModifier: 0 }, { id: "fj2", name: "Pineapple", priceModifier: 0 }, { id: "fj3", name: "Watermelon", priceModifier: 200 }] }] },
  { id: "43", name: "Bottled Water", price: 300, category: "drinks", image: "💧", description: "Eva or Nestle 75cl" },
  { id: "44", name: "Soft Drinks", price: 500, category: "drinks", image: "🥤", description: "Coke, Fanta, Sprite, or Pepsi" },
  { id: "45", name: "Malta Guinness", price: 600, category: "drinks", image: "🍺", description: "Classic non-alcoholic malt drink" },
  { id: "46", name: "Hollandia Yoghurt", price: 700, category: "drinks", image: "🥛", description: "Creamy drinking yoghurt" },
  // Desserts
  { id: "47", name: "Chin Chin", price: 1000, category: "desserts", image: "🍪", description: "Crunchy fried dough snacks" },
  { id: "48", name: "Puff Puff", price: 800, category: "desserts", image: "🧁", description: "Soft fried dough balls dusted with sugar" },
  { id: "49", name: "Coconut Candy", price: 600, category: "desserts", image: "🥥", description: "Sweet coconut treats" },
  { id: "50", name: "Fruit Salad", price: 1200, category: "desserts", image: "🍓", description: "Fresh pawpaw, watermelon, pineapple with cream" },
  { id: "51", name: "Fan Ice", price: 300, category: "desserts", image: "🍨", description: "Classic Fan Milk ice cream" },
  { id: "52", name: "Agege Bread & Butter", price: 500, category: "desserts", image: "🍞", description: "Soft sweet bread with Blue Band butter" },
];

const mockIncomingOrders: IncomingOrder[] = [
  { id: "#ORD001", source: "pos", customerName: "Walk-in", items: [{ name: "Jollof Rice (L)", quantity: 1, price: 4500 }, { name: "Chapman", quantity: 2, price: 1500 }], total: 7500, time: "2 min ago", startTime: new Date(Date.now() - 2 * 60000), estimatedMinutes: 15, status: "preparing", tableNumber: "5", orderType: "dine-in", billType: "process" },
  { id: "#ORD002", source: "website", customerName: "Jane Okafor", items: [{ name: "Fried Rice (M)", quantity: 2, price: 3500 }, { name: "Grilled Chicken", quantity: 2, price: 2800 }], total: 12600, time: "5 min ago", startTime: new Date(Date.now() - 5 * 60000), estimatedMinutes: 20, status: "pending", orderType: "delivery", billType: "process" },
];

const mockOrderHistory = [
  { id: "#ORD098", customerName: "Ada Eze", items: [{ name: "Jollof Rice", quantity: 2, price: 3500 }], total: 7000, time: "1 hour ago", status: "completed", source: "POS" },
];

const POSPage = () => {
  const navigate = useNavigate();
  const [posMode, setPosMode] = useState<"counter" | "selfservice">("counter");
  const [selectedCategory, setSelectedCategory] = useState("popular");
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selfServiceReceipt, setSelfServiceReceipt] = useState<IncomingOrder | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; action: () => void }>({ open: false, title: "", description: "", action: () => {} });
  const [toast, setToast] = useState<{ open: boolean; type: "success" | "error" | "warning" | "info"; title: string; message?: string }>({ open: false, type: "success", title: "" });
  const [currentReceipt, setCurrentReceipt] = useState<IncomingOrder | null>(null);
  const [copied, setCopied] = useState(false);
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
  
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">("dine-in");
  const [customerName, setCustomerName] = useState("");

  const virtualAccount = {
    bank: "Wema Bank",
    accountNumber: "8234567890",
    accountName: "Toasty Foods Ltd",
  };

  const playBeep = useBeepSound();

  // Simulate incoming orders from external platforms
  useEffect(() => {
    const simulateExternalOrder = () => {
      const sources: ("ubereats" | "deliveroo" | "website")[] = ["ubereats", "deliveroo", "website"];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const orderNumber = `#EXT${Date.now().toString().slice(-4)}`;
      
      setOrderNotification({
        id: orderNumber,
        orderNumber,
        source: randomSource,
        customerName: ["Ada Eze", "Chidi Obi", "Amaka Nweke"][Math.floor(Math.random() * 3)],
        itemCount: Math.floor(Math.random() * 5) + 1,
        total: Math.floor(Math.random() * 10000) + 3000,
        timestamp: new Date(),
      });
    };

    // Simulate an order after 30 seconds, then every 2 minutes
    const initialTimeout = setTimeout(simulateExternalOrder, 30000);
    const interval = setInterval(simulateExternalOrder, 120000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);


  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    // When searching, show items across all categories; otherwise filter by selected category
    if (searchQuery.trim()) {
      return matchesSearch;
    }
    return item.category === selectedCategory;
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

  const handleQuickBill = () => {
    if (cart.length === 0) return;
    setConfirmDialog({
      open: true, title: "Quick Bill", description: "This will complete the order immediately without sending to kitchen. Continue?",
      action: () => {
        setToast({ open: true, type: "success", title: "Order Completed!", message: "Quick bill has been processed" });
        setCart([]);
        setDiscount(0);
        setCustomerName("");
      }
    });
  };

  const handleProcessBill = () => {
    if (cart.length === 0) return;
    setConfirmDialog({
      open: true, title: "Process Bill", description: "This will send the order to the kitchen for preparation. Continue?",
      action: () => {
        const newOrder: IncomingOrder = {
          id: `#ORD${Date.now().toString().slice(-4)}`,
          source: "pos",
          customerName: customerName || "Walk-in",
          items: cart.map((c) => ({ name: c.name, quantity: c.quantity, price: c.price })),
          total: total,
          time: "Just now",
          startTime: new Date(),
          estimatedMinutes: 15,
          status: "preparing",
          orderType,
          billType: "process",
        };
        setIncomingOrders((prev) => [newOrder, ...prev]);
        setToast({ open: true, type: "success", title: "Order Sent!", message: "Order has been sent to the kitchen" });
        setCart([]);
        setDiscount(0);
        setCustomerName("");
      }
    });
  };

  const handleSelfServicePay = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmed = () => {
    const newOrder: IncomingOrder = {
      id: `#SS${Date.now().toString().slice(-4)}`,
      source: "selfservice",
      customerName: customerName || "Self-Service",
      items: cart.map((c) => ({ name: c.name, quantity: c.quantity, price: c.price })),
      total: total,
      time: "Just now",
      startTime: new Date(),
      estimatedMinutes: 15,
      status: "pending",
      orderType: "takeaway",
      billType: "process",
    };
    setIncomingOrders((prev) => [newOrder, ...prev]);
    setShowPaymentModal(false);
    setSelfServiceReceipt(newOrder);
    setShowReceiptModal(true);
    setToast({ open: true, type: "success", title: "Order Placed!", message: "Your order has been sent to the counter" });
    setCart([]);
    setDiscount(0);
    setCustomerName("");
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(virtualAccount.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const holdOrder = () => {
    if (cart.length === 0) return;
    const holdOrder: IncomingOrder = {
      id: `#HOLD${Date.now().toString().slice(-4)}`,
      source: "pos",
      customerName: customerName || "Hold Order",
      items: cart.map((c) => ({ name: c.name, quantity: c.quantity, price: c.price })),
      total: total,
      time: "Just now",
      startTime: new Date(),
      estimatedMinutes: 0,
      status: "hold",
      orderType,
    };
    setIncomingOrders((prev) => [holdOrder, ...prev]);
    setCart([]);
    setDiscount(0);
    setCustomerName("");
    setToast({ open: true, type: "info", title: "Order Held", message: "Order saved. Click to restore." });
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

      // Number keys 1-8 for category selection
      if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[1-8]$/.test(e.key)) {
        const categoryIndex = parseInt(e.key) - 1;
        if (categories[categoryIndex]) {
          setSelectedCategory(categories[categoryIndex].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, handleQuickBill, handleProcessBill, holdOrder]);

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
        if (order.customerName && order.customerName !== "Walk-in" && order.customerName !== "Hold Order") {
          setCustomerName(order.customerName);
        }
        if (order.orderType) {
          setOrderType(order.orderType);
        }
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

  const holdOrders = incomingOrders.filter((o) => o.status === "hold");
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
          
          <div className="flex items-center gap-3">
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
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all font-medium ${
                      selectedCategory === cat.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-card border border-border hover:border-primary/30"
                    } ${posMode === "selfservice" ? "text-base py-3 px-5" : "text-sm"}`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Category Title */}
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                {categories.find(c => c.id === selectedCategory)?.name}
                <span>{categories.find(c => c.id === selectedCategory)?.icon}</span>
              </h2>

              {/* Menu Grid */}
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
                    <div className={`flex items-center justify-center rounded-xl bg-muted mb-3 ${
                      posMode === "selfservice" ? "w-16 h-16 text-3xl" : "w-14 h-14 text-2xl"
                    }`}>
                      {item.image || "🍽️"}
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
              {holdOrders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Pause className="w-4 h-4" />
                    On Hold ({holdOrders.length})
                  </h3>
                  <div className="space-y-2">
                    {holdOrders.map((order) => (
                      <div key={order.id} className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground">{order.id}</span>
                          <p className="text-sm text-muted-foreground">₦{order.total.toLocaleString()}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => recallOrder(order)} className="rounded-xl">
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
                        {order.status === "pending" && (
                          <Button size="sm" className="rounded-lg" onClick={() => setIncomingOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "confirmed" } : o))}>
                            Confirm
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button size="sm" className="rounded-lg" onClick={() => setIncomingOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "preparing" } : o))}>
                            <ChefHat className="w-4 h-4 mr-1" />
                            Kitchen
                          </Button>
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
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                  {menuItems.find(m => m.id === item.menuItemId)?.image || "🍽️"}
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
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Complete Payment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground mb-2">₦{Math.round(total).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Transfer to the account below</p>
            </div>

            <div className="bg-muted rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Bank</span>
                <span className="font-medium text-foreground">{virtualAccount.bank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-lg">{virtualAccount.accountNumber}</span>
                  <button 
                    className="p-2 hover:bg-card rounded-lg transition-colors" 
                    onClick={copyAccountNumber}
                  >
                    {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Account Name</span>
                <span className="font-medium text-foreground">{virtualAccount.accountName}</span>
              </div>
            </div>

            <div className="bg-status-warning/10 border border-status-warning/20 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-status-warning mx-auto mb-1" />
              <p className="text-sm text-foreground">Account expires in 10:00 minutes</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button className="h-12 rounded-xl" onClick={handlePaymentConfirmed}>
                I've Paid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <ItemVariationModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={addToCart} />
      <ConfirmDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })} title={confirmDialog.title} description={confirmDialog.description} onConfirm={() => { confirmDialog.action(); setConfirmDialog({ ...confirmDialog, open: false }); }} />
      <ToastNotification open={toast.open} onClose={() => setToast({ ...toast, open: false })} type={toast.type} title={toast.title} message={toast.message} />
      <DiscountModal open={showDiscountModal} onClose={() => setShowDiscountModal(false)} subtotal={subtotal} onApplyDiscount={setDiscount} />
      <OrderHistoryModal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} orders={mockOrderHistory} onRecallOrder={(o) => { }} onPrintReceipt={(o) => { }} />
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
    </div>
  );
};

export default POSPage;
