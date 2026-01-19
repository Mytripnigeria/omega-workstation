import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote, Calculator, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffSales {
  staffId: string;
  staffName: string;
  role: string;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  totalSales: number;
  ordersCount: number;
  refunds: number;
  discountsGiven: number;
  openingBalance: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  shiftStart: Date;
}

interface StaffFinancePanelProps {
  currentStaffId: string;
  isManager: boolean;
}

const mockStaffSales: StaffSales[] = [
  {
    staffId: "1",
    staffName: "John Doe",
    role: "Cashier",
    cashSales: 45600,
    cardSales: 32400,
    transferSales: 18500,
    totalSales: 96500,
    ordersCount: 28,
    refunds: 2500,
    discountsGiven: 4200,
    openingBalance: 10000,
    expectedCash: 53100,
    shiftStart: new Date(Date.now() - 4 * 60 * 60000),
  },
  {
    staffId: "2",
    staffName: "Sarah Obi",
    role: "Cashier",
    cashSales: 38200,
    cardSales: 28100,
    transferSales: 15600,
    totalSales: 81900,
    ordersCount: 24,
    refunds: 1200,
    discountsGiven: 3100,
    openingBalance: 10000,
    expectedCash: 47000,
    shiftStart: new Date(Date.now() - 5 * 60 * 60000),
  },
  {
    staffId: "3",
    staffName: "Mike Johnson",
    role: "Supervisor",
    cashSales: 52300,
    cardSales: 41200,
    transferSales: 22800,
    totalSales: 116300,
    ordersCount: 35,
    refunds: 3800,
    discountsGiven: 5500,
    openingBalance: 15000,
    expectedCash: 63500,
    shiftStart: new Date(Date.now() - 6 * 60 * 60000),
  },
];

const StaffFinancePanel = ({ currentStaffId, isManager }: StaffFinancePanelProps) => {
  const [selectedStaff, setSelectedStaff] = useState<string>(currentStaffId);
  
  const staffData = isManager 
    ? mockStaffSales 
    : mockStaffSales.filter(s => s.staffId === currentStaffId);
  
  const currentStaffData = staffData.find(s => s.staffId === selectedStaff) || staffData[0];
  
  const formatDuration = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (60 * 60000));
    const mins = Math.floor(((Date.now() - date.getTime()) % (60 * 60000)) / 60000);
    return `${hours}h ${mins}m`;
  };

  const teamTotal = staffData.reduce((sum, s) => sum + s.totalSales, 0);
  const teamOrders = staffData.reduce((sum, s) => sum + s.ordersCount, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl gap-2">
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">Sales Balance</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Sales & Finance
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Staff Selector (Managers only) */}
          {isManager && staffData.length > 1 && (
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="rounded-xl">
                <User className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {staffData.map((staff) => (
                  <SelectItem key={staff.staffId} value={staff.staffId}>
                    {staff.staffName} ({staff.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Team Summary (Managers only) */}
          {isManager && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Team Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">₦{teamTotal.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Team Sales</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{teamOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </div>
          )}

          {/* Individual Staff Stats */}
          {currentStaffData && (
            <>
              {/* Staff Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{currentStaffData.staffName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Shift: {formatDuration(currentStaffData.shiftStart)}</span>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-lg">{currentStaffData.role}</Badge>
              </div>

              {/* Total Sales */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Total Sales</span>
                  <Badge className="bg-status-success text-white rounded-lg">
                    {currentStaffData.ordersCount} orders
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  ₦{currentStaffData.totalSales.toLocaleString()}
                </p>
              </div>

              {/* Sales Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Sales Breakdown</h4>
                
                <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Cash</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((currentStaffData.cashSales / currentStaffData.totalSales) * 100)}% of total
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">₦{currentStaffData.cashSales.toLocaleString()}</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Card</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((currentStaffData.cardSales / currentStaffData.totalSales) * 100)}% of total
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">₦{currentStaffData.cardSales.toLocaleString()}</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Transfer</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((currentStaffData.transferSales / currentStaffData.totalSales) * 100)}% of total
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">₦{currentStaffData.transferSales.toLocaleString()}</p>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Deductions</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-700">Refunds</span>
                    </div>
                    <p className="text-xl font-bold text-red-700">₦{currentStaffData.refunds.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-700">Discounts</span>
                    </div>
                    <p className="text-xl font-bold text-amber-700">₦{currentStaffData.discountsGiven.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Cash Balancing */}
              <div className="bg-secondary/50 border border-border rounded-2xl p-5 space-y-4">
                <h4 className="font-medium text-foreground">Cash Drawer Balance</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opening Balance</span>
                    <span className="text-foreground">₦{currentStaffData.openingBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">+ Cash Sales</span>
                    <span className="text-foreground">₦{currentStaffData.cashSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">- Refunds (Cash)</span>
                    <span className="text-foreground">₦{Math.round(currentStaffData.refunds * 0.5).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Expected Cash</span>
                    <span className="text-primary">₦{currentStaffData.expectedCash.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StaffFinancePanel;
