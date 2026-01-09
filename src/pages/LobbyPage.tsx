import { useState } from "react";
import { Users, Clock, Monitor, Package, Globe, Smartphone, Utensils, Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";

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
        return <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "website":
        return <Globe className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "ubereats":
      case "deliveroo":
        return <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Package className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "dine-in":
        return <Utensils className="w-3 h-3" />;
      case "takeaway":
        return <Package className="w-3 h-3" />;
      case "delivery":
        return <Bike className="w-3 h-3" />;
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
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-10">
      <PageHeader
        title="Order Lobby"
        icon={Users}
        iconColor="text-category-sky"
        badge={`${customers.length} Waiting`}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Now Serving</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Your order will be ready shortly</p>
          </div>
        </div>
      </div>

      {/* Waiting List */}
      <div className="grid gap-3 sm:gap-4">
        {sortedCustomers.map((customer, index) => {
          const remaining = getRemainingTime(customer);
          const isNext = index === 0;
          const isReady = remaining <= 0;

          return (
            <div
              key={customer.id}
              className={`bg-card border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 transition-all ${
                isReady
                  ? "border-status-success bg-status-success/5 animate-pulse"
                  : isNext
                  ? "border-primary"
                  : "border-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0 ${
                      isReady
                        ? "bg-status-success text-white"
                        : isNext
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground truncate">{customer.name}</h3>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="font-medium">{customer.orderNumber}</span>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs px-1.5 py-0.5">
                        {getPlatformIcon(customer.platform)}
                        <span className="hidden xs:inline">{customer.platform}</span>
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs px-1.5 py-0.5">
                        {getOrderTypeIcon(customer.orderType)}
                        <span className="hidden xs:inline">{getOrderTypeLabel(customer.orderType)}</span>
                      </Badge>
                      <span className="hidden sm:inline">• {customer.items} items</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right flex-shrink-0">
                  {isReady ? (
                    <div className="text-status-success">
                      <p className="text-xl sm:text-2xl font-bold">READY!</p>
                      <p className="text-xs sm:text-sm">Please collect your order</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{remaining} min</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">estimated wait</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LobbyPage;