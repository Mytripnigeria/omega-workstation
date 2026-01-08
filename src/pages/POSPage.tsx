import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const categories = [
  { id: "all", name: "All Items", icon: "🍽️", color: "bg-category-mint" },
  { id: "pizza", name: "Pizza", icon: "🍕", color: "bg-category-lavender" },
  { id: "pasta", name: "Pasta", icon: "🍝", color: "bg-category-pink" },
  { id: "sides", name: "Sides", icon: "🥗", color: "bg-category-peach" },
  { id: "drinks", name: "Drinks", icon: "🥤", color: "bg-category-sky" },
  { id: "dessert", name: "Dessert", icon: "🍰", color: "bg-category-coral" },
];

const menuItems: MenuItem[] = [
  { id: "1", name: "Margherita", price: 10, category: "pizza" },
  { id: "2", name: "Pepperoni", price: 12, category: "pizza" },
  { id: "3", name: "Hawaiian", price: 13, category: "pizza" },
  { id: "4", name: "Veggie Supreme", price: 14, category: "pizza" },
  { id: "5", name: "Spaghetti Bolognese", price: 11, category: "pasta" },
  { id: "6", name: "Carbonara", price: 12, category: "pasta" },
  { id: "7", name: "Lasagna", price: 13, category: "pasta" },
  { id: "8", name: "Garlic Bread", price: 4, category: "sides" },
  { id: "9", name: "Caesar Salad", price: 7, category: "sides" },
  { id: "10", name: "Cola", price: 2.5, category: "drinks" },
  { id: "11", name: "Lemonade", price: 3, category: "drinks" },
  { id: "12", name: "Tiramisu", price: 6, category: "dessert" },
  { id: "13", name: "Gelato", price: 5, category: "dessert" },
];

const POSPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
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

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Panel - Menu */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-foreground">Counter POS</h1>
          <div className="w-20" />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-tile ${cat.color} ${
                selectedCategory === cat.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-medium text-foreground/80">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/50 hover:bg-card/80 transition-all duration-200 group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary mb-3">
                <Utensils className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <p className="text-primary font-semibold mt-1">£{item.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-full lg:w-96 bg-card border-l border-border p-4 lg:p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Current Order</h2>
          <Badge variant="secondary" className="ml-auto">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </Badge>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto space-y-3 mb-6">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items in cart</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    £{item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="font-semibold text-foreground w-16 text-right">
                  £{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">£{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (20%)</span>
            <span className="text-foreground">£{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
            <span className="text-foreground">Total</span>
            <span className="text-primary">£{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="h-14" disabled={cart.length === 0}>
            <Banknote className="w-5 h-5 mr-2" />
            Cash
          </Button>
          <Button className="h-14 gradient-primary" disabled={cart.length === 0}>
            <CreditCard className="w-5 h-5 mr-2" />
            Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
