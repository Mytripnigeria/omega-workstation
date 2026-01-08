import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Plus, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Table {
  id: string;
  number: string;
  seats: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  guests?: number;
  orderTotal?: number;
  time?: string;
}

const mockTables: Table[] = [
  { id: "1", number: "1", seats: 2, status: "occupied", guests: 2, orderTotal: 32.14, time: "45 min" },
  { id: "2", number: "2", seats: 4, status: "available" },
  { id: "3", number: "3", seats: 4, status: "occupied", guests: 4, orderTotal: 106.99, time: "1h 12min" },
  { id: "4", number: "4", seats: 2, status: "reserved" },
  { id: "5", number: "5", seats: 6, status: "occupied", guests: 5, orderTotal: 84.50, time: "28 min" },
  { id: "6", number: "6", seats: 4, status: "cleaning" },
  { id: "7", number: "7", seats: 2, status: "available" },
  { id: "8", number: "8", seats: 4, status: "occupied", guests: 3, orderTotal: 24.59, time: "15 min" },
  { id: "9", number: "9", seats: 8, status: "available" },
  { id: "10", number: "10", seats: 4, status: "reserved" },
  { id: "11", number: "11", seats: 2, status: "available" },
  { id: "12", number: "12", seats: 6, status: "occupied", guests: 6, orderTotal: 156.00, time: "52 min" },
];

const WaiterPage = () => {
  const navigate = useNavigate();
  const [tables] = useState<Table[]>(mockTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "bg-status-success";
      case "occupied":
        return "bg-status-process";
      case "reserved":
        return "bg-status-warning";
      case "cleaning":
        return "bg-muted";
    }
  };

  const getStatusLabel = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "Available";
      case "occupied":
        return "Occupied";
      case "reserved":
        return "Reserved";
      case "cleaning":
        return "Cleaning";
    }
  };

  const getTableBg = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "bg-status-success/10 border-status-success/30 hover:border-status-success";
      case "occupied":
        return "bg-status-process/10 border-status-process/30 hover:border-status-process";
      case "reserved":
        return "bg-status-warning/10 border-status-warning/30";
      case "cleaning":
        return "bg-muted/50 border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-category-pink" />
            <h1 className="text-xl font-bold text-foreground">Waiter Display</h1>
          </div>
          <div className="flex gap-2">
            {["available", "occupied", "reserved", "cleaning"].map((status) => (
              <div key={status} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status as Table["status"])}`} />
                <span className="text-xs text-muted-foreground capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${getTableBg(table.status)} ${
                selectedTable?.id === table.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-foreground">T{table.number}</span>
                <Badge className={`${getStatusColor(table.status)} text-white text-xs`}>
                  {table.seats}
                </Badge>
              </div>
              
              {table.status === "occupied" && (
                <>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <Users className="w-3 h-3" />
                    {table.guests} guests
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <Clock className="w-3 h-3" />
                    {table.time}
                  </div>
                  <p className="text-lg font-semibold text-primary">
                    £{table.orderTotal?.toFixed(2)}
                  </p>
                </>
              )}
              
              {table.status === "available" && (
                <p className="text-sm text-status-success font-medium">Ready</p>
              )}
              
              {table.status === "reserved" && (
                <p className="text-sm text-status-warning font-medium">7:30 PM</p>
              )}
              
              {table.status === "cleaning" && (
                <p className="text-sm text-muted-foreground">In progress...</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Selected Table */}
      {selectedTable && (
        <div className="w-80 bg-card border-l border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Table {selectedTable.number}
            </h2>
            <Badge className={`${getStatusColor(selectedTable.status)} text-white`}>
              {getStatusLabel(selectedTable.status)}
            </Badge>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Seats</span>
              <span className="text-foreground">{selectedTable.seats}</span>
            </div>
            {selectedTable.guests && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guests</span>
                <span className="text-foreground">{selectedTable.guests}</span>
              </div>
            )}
            {selectedTable.time && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time Seated</span>
                <span className="text-foreground">{selectedTable.time}</span>
              </div>
            )}
            {selectedTable.orderTotal && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Order</span>
                <span className="text-primary font-semibold">£{selectedTable.orderTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {selectedTable.status === "available" && (
              <Button className="w-full gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Seat Guests
              </Button>
            )}
            {selectedTable.status === "occupied" && (
              <>
                <Button className="w-full gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Order
                </Button>
                <Button variant="secondary" className="w-full">
                  View Full Order
                </Button>
                <Button variant="outline" className="w-full">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Close Table
                </Button>
              </>
            )}
            {selectedTable.status === "cleaning" && (
              <Button variant="secondary" className="w-full bg-status-success hover:bg-status-success/80 text-white">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Ready
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterPage;
