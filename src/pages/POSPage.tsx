import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/PageHeader";
import ItemVariationModal from "@/components/ItemVariationModal";

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
  status: "pending" | "confirmed" | "preparing" | "ready";
  tableNumber?: string;
}

const categories = [
  { id: "all", name: "All Items", icon: "🍽️" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "pasta", name: "Pasta", icon: "🍝" },
  { id: "sides", name: "Sides", icon: "🥗" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
  { id: "dessert", name: "Dessert", icon: "🍰" },
];

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita",
    price: 10,
    category: "pizza",
    variations: [
      {
        name: "Size",
        required: true,
        options: [
          { id: "s1", name: "Small (10\")", priceModifier: 0 },
          { id: "s2", name: "Medium (12\")", priceModifier: 2 },
          { id: "s3", name: "Large (14\")", priceModifier: 4 },
        ],
      },
      {
        name: "Crust",
        required: true,
        options: [
          { id: "c1", name: "Classic", priceModifier: 0 },
          { id: "c2", name: "Thin Crust", priceModifier: 0 },
          { id: "c3", name: "Stuffed Crust", priceModifier: 2.5 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Pepperoni",
    price: 12,
    category: "pizza",
    variations: [
      {
        name: "Size",
        required: true,
        options: [
          { id: "s1", name: "Small (10\")", priceModifier: 0 },
          { id: "s2", name: "Medium (12\")", priceModifier: 2 },
          { id: "s3", name: "Large (14\")", priceModifier: 4 },
        ],
      },
    ],
  },
  { id: "3", name: "Hawaiian", price: 13, category: "pizza" },
  { id: "4", name: "Veggie Supreme", price: 14, category: "pizza" },
  { id: "5", name: "Spaghetti Bolognese", price: 11, category: "pasta" },
  { id: "6", name: "Carbonara", price: 12, category: "pasta" },
  { id: "7", name: "Lasagna", price: 13, category: "pasta" },
  { id: "8", name: "Garlic Bread", price: 4, category: "sides" },
  { id: "9", name: "Caesar Salad", price: 7, category: "sides" },
  {
    id: "10",
    name: "Cola",
    price: 2.5,
    category: "drinks",
    variations: [
      {
        name: "Size",
        required: false,
        options: [
          { id: "d1", name: "Regular", priceModifier: 0 },
          { id: "d2", name: "Large", priceModifier: 1 },
        ],
      },
    ],
  },
  { id: "11", name: "Lemonade", price: 3, category: "drinks" },
  { id: "12", name: "Tiramisu", price: 6, category: "dessert" },
  { id: "13", name: "Gelato", price: 5, category: "dessert" },
];

const mockIncomingOrders: IncomingOrder[] = [
  {
    id: "#ORD001",
    source: "pos",
    customerName: "Walk-in",
    items: [
      { name: "Margherita (L)", quantity: 1, price: 14 },
      { name: "Cola", quantity: 2, price: 2.5 },
    ],
    total: 19,
    time: "2 min ago",
    status: "preparing",
    tableNumber: "5",
  },
  {
    id: "#ORD002",
    source: "website",
    customerName: "Jane Smith",
    items: [
      { name: "Pepperoni (M)", quantity: 2, price: 14 },
      { name: "Garlic Bread", quantity: 1, price: 4 },
    ],
    total: 32,
    time: "5 min ago",
    status: "pending",
  },
  {
    id: "#ORD003",
    source: "ubereats",
    customerName: "Mike Johnson",
    items: [
      { name: "Carbonara", quantity: 3, price: 12 },
      { name: "Tiramisu", quantity: 2, price: 6 },
    ],
    total: 48,
    time: "8 min ago",
    status: "confirmed",
  },
  {
    id: "#ORD004",
    source: "deliveroo",
    customerName: "Sarah Wilson",
    items: [
      { name: "Veggie Supreme", quantity: 1, price: 14 },
      { name: "Caesar Salad", quantity: 1, price: 7 },
    ],
    total: 21,
    time: "12 min ago",
    status: "ready",
  },
];

const POSPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState("menu");
  const [incomingOrders, setIncomingOrders] = useState<IncomingOrder[]>(mockIncomingOrders);

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

  const addToCart = (item: MenuItem, selectedVariations: Record<string, Variation>) => {
    const variationText = Object.values(selectedVariations)
      .map((v) => v.name)
      .join(", ");
    
    let finalPrice = item.price;
    Object.values(selectedVariations).forEach((v) => {
      finalPrice += v.priceModifier;
    });

    const cartItemId = `${item.id}-${JSON.stringify(selectedVariations)}`;
    
    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          menuItemId: item.id,
          name: item.name,
          price: finalPrice,
          quantity: 1,
          variations: selectedVariations,
          variationText,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const sendToKitchen = () => {
    if (cart.length === 0) return;
    // In real app, this would send the order to kitchen
    alert("Order sent to kitchen!");
    setCart([]);
  };

  const getSourceIcon = (source: IncomingOrder["source"]) => {
    switch (source) {
      case "pos":
        return <Monitor className="w-4 h-4" />;
      case "website":
        return <Globe className="w-4 h-4" />;
      case "ubereats":
      case "deliveroo":
        return <Smartphone className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: IncomingOrder["source"]) => {
    switch (source) {
      case "pos":
        return "POS";
      case "website":
        return "Website";
      case "ubereats":
        return "UberEats";
      case "deliveroo":
        return "Deliveroo";
    }
  };

  const getStatusColor = (status: IncomingOrder["status"]) => {
    switch (status) {
      case "pending":
        return "bg-status-warning text-foreground";
      case "confirmed":
        return "bg-status-info text-white";
      case "preparing":
        return "bg-status-process text-white";
      case "ready":
        return "bg-status-success text-white";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Panel - Menu & Orders */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
        <PageHeader title="Counter POS" icon={Monitor} iconColor="text-category-mint" />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="menu" className="flex-1 sm:flex-none">
              <Utensils className="w-4 h-4 mr-2" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 sm:flex-none">
              <ListOrdered className="w-4 h-4 mr-2" />
              Orders
              <Badge variant="secondary" className="ml-2">
                {incomingOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:border-primary/50"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-card border border-border rounded-xl p-3 sm:p-4 text-left hover:border-primary/50 hover:bg-card/80 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary mb-2 sm:mb-3">
                    <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground text-xs sm:text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-primary font-semibold text-sm sm:text-base">
                      £{item.price.toFixed(2)}
                    </p>
                    {item.variations && (
                      <Badge variant="outline" className="text-xs">
                        +Options
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <div className="space-y-3">
              {incomingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getSourceIcon(order.source)}
                        {getSourceLabel(order.source)}
                      </Badge>
                      <span className="font-semibold text-foreground">{order.id}</span>
                      {order.tableNumber && (
                        <Badge variant="secondary">Table {order.tableNumber}</Badge>
                      )}
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {order.customerName} • {order.time}
                  </p>

                  <div className="space-y-1 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-muted-foreground">
                          £{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="font-semibold text-foreground">
                      Total: £{order.total.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            setIncomingOrders((prev) =>
                              prev.map((o) =>
                                o.id === order.id ? { ...o, status: "confirmed" } : o
                              )
                            )
                          }
                        >
                          Confirm
                        </Button>
                      )}
                      {order.status === "confirmed" && (
                        <Button
                          size="sm"
                          className="gradient-primary"
                          onClick={() =>
                            setIncomingOrders((prev) =>
                              prev.map((o) =>
                                o.id === order.id ? { ...o, status: "preparing" } : o
                              )
                            )
                          }
                        >
                          <ChefHat className="w-4 h-4 mr-1" />
                          Send to Kitchen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-full lg:w-80 xl:w-96 bg-card border-t lg:border-t-0 lg:border-l border-border p-3 sm:p-4 lg:p-6 flex flex-col max-h-[50vh] lg:max-h-screen lg:h-screen">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Current Order</h2>
          <Badge variant="secondary" className="ml-auto">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </Badge>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto space-y-2 mb-4">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-6 sm:py-10">
              <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
              <p>No items in cart</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 sm:gap-3 bg-secondary/50 rounded-xl p-2 sm:p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                  {item.variationText && (
                    <p className="text-xs text-muted-foreground truncate">{item.variationText}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    £{item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <span className="w-5 sm:w-6 text-center font-medium text-sm">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                <p className="font-semibold text-foreground w-14 sm:w-16 text-right text-sm">
                  £{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-3 sm:pt-4 space-y-2 mb-3 sm:mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">£{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (20%)</span>
            <span className="text-foreground">£{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-border">
            <span className="text-foreground">Total</span>
            <span className="text-primary">£{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
          <Button
            variant="secondary"
            className="h-10 sm:h-12"
            disabled={cart.length === 0}
            onClick={sendToKitchen}
          >
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">To Kitchen</span>
          </Button>
          <Button
            variant="outline"
            className="h-10 sm:h-12"
            disabled={cart.length === 0}
          >
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Checkout</span>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Button variant="secondary" className="h-10 sm:h-12" disabled={cart.length === 0}>
            <Banknote className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Cash</span>
          </Button>
          <Button className="h-10 sm:h-12 gradient-primary" disabled={cart.length === 0}>
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Card</span>
          </Button>
        </div>
      </div>

      {/* Item Variation Modal */}
      <ItemVariationModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default POSPage;
