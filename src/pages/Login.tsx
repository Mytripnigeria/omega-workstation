import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChefHat } from "lucide-react";
import PinPad from "@/components/PinPad";
import StaffSelector from "@/components/StaffSelector";
import ThemeToggle from "@/components/ThemeToggle";

// Mock staff data
const mockStaff = [
  { id: "1", name: "John D.", role: "Manager" },
  { id: "2", name: "Sarah M.", role: "Server" },
  { id: "3", name: "Mike R.", role: "Chef" },
  { id: "4", name: "Emma L.", role: "Cashier" },
  { id: "5", name: "David K.", role: "Delivery" },
  { id: "6", name: "Lisa P.", role: "Server" },
];

// Mock PIN for demo (in real app, this would be validated server-side)
const DEMO_PIN = "1234";

const Login = () => {
  const navigate = useNavigate();
  const [selectedStaff, setSelectedStaff] = useState<typeof mockStaff[0] | null>(null);
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"select" | "pin">("select");

  useEffect(() => {
    // Initialize theme on load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleStaffSelect = (staff: typeof mockStaff[0]) => {
    setSelectedStaff(staff);
    setStep("pin");
    setPin("");
  };

  const handlePinSubmit = () => {
    if (pin === DEMO_PIN) {
      toast.success(`Welcome, ${selectedStaff?.name}!`);
      // Store staff info in sessionStorage for demo
      sessionStorage.setItem("currentStaff", JSON.stringify(selectedStaff));
      navigate("/dashboard");
    } else {
      toast.error("Invalid PIN. Try 1234 for demo.");
      setPin("");
    }
  };

  const handleBack = () => {
    setStep("select");
    setPin("");
    setSelectedStaff(null);
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
          {step === "select" ? (
            <>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground text-center mb-4 sm:mb-6">
                Select Staff Member
              </h2>
              <StaffSelector
                staff={mockStaff}
                selectedStaff={selectedStaff}
                onSelect={handleStaffSelect}
              />
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                ← Back to staff selection
              </button>
              
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  Enter PIN
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Signing in as <span className="text-primary font-medium">{selectedStaff?.name}</span>
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
