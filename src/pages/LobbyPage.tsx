import { useState } from "react";
import { Users, Clock, Monitor, Package, Globe, Smartphone, Utensils, Bike, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface WaitingCustomer {
  id: string;
  name: string;
  orderNumber: string;
  platform: string;
  items: number;
  estimatedTime: number;
  startTime: Date;
  orderType: "dine-in" | "takeaway" | "delivery";
}

const mockWaitingCustomers: WaitingCustomer[] = [
  {
    id: "1",
    name: "John Adeyemi",
    orderNumber: "#ORD-2678",
    platform: "POS",
    items: 3,
    estimatedTime: 5,
    startTime: new Date(Date.now() - 2 * 60 * 1000),
    orderType: "dine-in",
  },
  {
    id: "2",
    name: "Sarah Okonkwo",
    orderNumber: "#ORD-2679",
    platform: "Website",
    items: 5,
    estimatedTime: 8,
    startTime: new Date(Date.now() - 4 * 60 * 1000),
    orderType: "takeaway",
  },
  {
    id: "3",
    name: "Michael Bello",
    orderNumber: "#ORD-2680",
    platform: "UberEats",
    items: 2,
    estimatedTime: 10,
    startTime: new Date(Date.now() - 1 * 60 * 1000),
    orderType: "delivery",
  },
  {
    id: "4",
    name: "Amara Eze",
    orderNumber: "#ORD-2681",
    platform: "Deliveroo",
    items: 4,
    estimatedTime: 12,
    startTime: new Date(Date.now() - 3 * 60 * 1000),
    orderType: "delivery",
  },
  {
    id: "5",
    name: "David Okoro",
    orderNumber: "#ORD-2682",
    platform: "POS",
    items: 6,
    estimatedTime: 15,
    startTime: new Date(Date.now() - 5 * 60 * 1000),
    orderType: "takeaway",
  },
];

const LobbyPage = () => {
  const navigate = useNavigate();
  const [customers] = useState<WaitingCustomer[]>(mockWaitingCustomers);

  const getRemainingTime = (customer: WaitingCustomer) => {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - customer.startTime.getTime()) / 1000 / 60);
    const remaining = customer.estimatedTime - elapsed;
    return remaining;
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    return getRemainingTime(a) - getRemainingTime(b);
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "pos":
        return <Monitor className="w-4 h-4 text-foreground" />;
      case "website":
        return <Globe className="w-4 h-4 text-foreground" />;
      case "ubereats":
      case "deliveroo":
        return <Smartphone className="w-4 h-4 text-foreground" />;
      default:
        return <Package className="w-4 h-4 text-foreground" />;
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "dine-in":
        return <Utensils className="w-3 h-3 text-foreground" />;
      case "takeaway":
        return <Package className="w-3 h-3 text-foreground" />;
      case "delivery":
        return <Bike className="w-3 h-3 text-foreground" />;
      default:
        return null;
    }
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case "dine-in":
        return "Dine In";
      case "takeaway":
        return "Takeaway";
      case "delivery":
        return "Delivery";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-muted rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Users className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Order Lobby</h1>
                <p className="text-xs text-muted-foreground">{customers.length} customers waiting</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
        {/* Now Serving Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Now Serving</h2>
              <p className="text-muted-foreground">Your order will be ready shortly</p>
            </div>
          </div>
        </div>

        {/* Waiting List */}
        <div className="space-y-3">
          {sortedCustomers.map((customer, index) => {
            const remaining = getRemainingTime(customer);
            const isNext = index === 0;
            const isReady = remaining <= 0;

            return (
              <div
                key={customer.id}
                className={`bg-card border-2 rounded-2xl p-5 transition-all ${
                  isReady
                    ? "border-status-success bg-status-success/5"
                    : isNext
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                        isReady
                          ? "bg-status-success text-white"
                          : isNext
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{customer.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="font-medium text-sm text-muted-foreground">{customer.orderNumber}</span>
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          {getPlatformIcon(customer.platform)}
                          <span>{customer.platform}</span>
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                          {getOrderTypeIcon(customer.orderType)}
                          <span>{getOrderTypeLabel(customer.orderType)}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">{customer.items} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0">
                    {isReady ? (
                      <div className="text-status-success">
                        <p className="text-2xl font-bold">READY!</p>
                        <p className="text-sm">Please collect your order</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-3xl font-bold text-foreground">{remaining} min</p>
                        <p className="text-sm text-muted-foreground">estimated wait</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default LobbyPage;