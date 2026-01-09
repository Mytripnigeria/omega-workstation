import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChefHat } from "lucide-react";
import PinPad from "@/components/PinPad";
import ThemeToggle from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock staff data
const mockStaff = [
  { id: "STF001", name: "John D.", role: "Manager" },
  { id: "STF002", name: "Sarah M.", role: "Server" },
  { id: "STF003", name: "Mike R.", role: "Chef" },
  { id: "STF004", name: "Emma L.", role: "Cashier" },
  { id: "STF005", name: "David K.", role: "Delivery" },
  { id: "STF006", name: "Lisa P.", role: "Server" },
];

// Mock PIN for demo (in real app, this would be validated server-side)
const DEMO_PIN = "1234";

const Login = () => {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"staffid" | "pin">("staffid");
  const [foundStaff, setFoundStaff] = useState<typeof mockStaff[0] | null>(null);

  useEffect(() => {
    // Initialize theme on load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleStaffIdSubmit = () => {
    const staff = mockStaff.find((s) => s.id.toLowerCase() === staffId.toLowerCase());
    if (staff) {
      setFoundStaff(staff);
      setStep("pin");
      setPin("");
    } else {
      toast.error("Staff ID not found. Try STF001-STF006 for demo.");
    }
  };

  const handlePinSubmit = () => {
    if (pin === DEMO_PIN) {
      toast.success(`Welcome, ${foundStaff?.name}!`);
      // Store staff info in sessionStorage for demo
      sessionStorage.setItem("currentStaff", JSON.stringify(foundStaff));
      navigate("/dashboard");
    } else {
      toast.error("Invalid PIN. Try 1234 for demo.");
      setPin("");
    }
  };

  const handleBack = () => {
    setStep("staffid");
    setPin("");
    setFoundStaff(null);
    setStaffId("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Background glow effect */}
      <div className="absolute inset-0 gradient-glow opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 animate-fade-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-effect">
            <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Workstation</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Restaurant Management</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl animate-slide-up">
          {step === "staffid" ? (
            <>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground text-center mb-4 sm:mb-6">
                Enter Staff ID
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="e.g. STF001"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider h-12"
                  onKeyDown={(e) => e.key === "Enter" && handleStaffIdSubmit()}
                  autoFocus
                />
                <Button 
                  className="w-full h-12 gradient-primary text-lg font-semibold"
                  onClick={handleStaffIdSubmit}
                  disabled={!staffId.trim()}
                >
                  Continue
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6">
                Demo Staff IDs: STF001 - STF006
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                ← Back to Staff ID
              </button>
              
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  Enter PIN
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Signing in as <span className="text-primary font-medium">{foundStaff?.name}</span>
                </p>
              </div>
              
              <PinPad
                pin={pin}
                onPinChange={setPin}
                onSubmit={handlePinSubmit}
              />
              
              <p className="text-center text-xs text-muted-foreground mt-4 sm:mt-6">
                Demo PIN: 1234
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
