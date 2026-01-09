import { useState } from "react";
import { Users, Clock, Monitor, Package } from "lucide-react";
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
  },
  {
    id: "2",
    name: "Sarah Okonkwo",
    orderNumber: "#ORD-2679",
    platform: "Website",
    items: 5,
    estimatedTime: 8,
    startTime: new Date(Date.now() - 4 * 60 * 1000),
  },
  {
    id: "3",
    name: "Michael Bello",
    orderNumber: "#ORD-2680",
    platform: "UberEats",
    items: 2,
    estimatedTime: 10,
    startTime: new Date(Date.now() - 1 * 60 * 1000),
  },
  {
    id: "4",
    name: "Amara Eze",
    orderNumber: "#ORD-2681",
    platform: "Deliveroo",
    items: 4,
    estimatedTime: 12,
    startTime: new Date(Date.now() - 3 * 60 * 1000),
  },
  {
    id: "5",
    name: "David Okoro",
    orderNumber: "#ORD-2682",
    platform: "POS",
    items: 6,
    estimatedTime: 15,
    startTime: new Date(Date.now() - 5 * 60 * 1000),
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
        return <Monitor className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <PageHeader
        title="Order Lobby"
        icon={Users}
        iconColor="text-category-sky"
        badge={`${customers.length} Waiting`}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <Clock className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Now Serving</h2>
            <p className="text-muted-foreground">Your order will be ready shortly</p>
          </div>
        </div>
      </div>

      {/* Waiting List */}
      <div className="grid gap-4">
        {sortedCustomers.map((customer, index) => {
          const remaining = getRemainingTime(customer);
          const isNext = index === 0;
          const isReady = remaining <= 0;

          return (
            <div
              key={customer.id}
              className={`bg-card border-2 rounded-2xl p-6 transition-all ${
                isReady
                  ? "border-status-success bg-status-success/5 animate-pulse"
                  : isNext
                  ? "border-primary"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                      isReady
                        ? "bg-status-success text-white"
                        : isNext
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{customer.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{customer.orderNumber}</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getPlatformIcon(customer.platform)}
                        {customer.platform}
                      </Badge>
                      <span>• {customer.items} items</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
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
    </div>
  );
};

export default LobbyPage;
