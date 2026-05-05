import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChefHat, ArrowLeft } from "lucide-react";
import PinPad from "@/components/PinPad";
import ThemeToggle from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { staffAuthService, type StaffLookupResult } from "@/services/auth";

const Login = () => {
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"staffid" | "pin">("staffid");
  const [foundStaff, setFoundStaff] = useState<StaffLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleStaffIdSubmit = async () => {
    if (!staffId.trim()) return;
    setIsLoading(true);
    try {
      const staff = await staffAuthService.lookup(staffId.toUpperCase());
      setFoundStaff(staff);
      setStep("pin");
      setPin("");
    } catch {
      toast.error("Staff ID not found. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return;
    setIsLoading(true);
    try {
      const staff = await staffAuthService.login(staffId.toUpperCase(), pin);
      toast.success(`Welcome, ${staff.firstName}!`);
      navigate("/dashboard");
    } catch {
      toast.error("Invalid PIN. Please try again.");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep("staffid");
    setPin("");
    setFoundStaff(null);
    setStaffId("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Mr. Jollof</h1>
          <p className="text-muted-foreground mt-1 text-sm">Staff Workstation</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-clean border border-border">
          {step === "staffid" ? (
            <>
              <h2 className="text-lg font-semibold text-foreground text-center mb-6">
                Enter Staff ID
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="e.g. STF001"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider h-14 rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleStaffIdSubmit()}
                  autoFocus
                />
                <Button
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  onClick={handleStaffIdSubmit}
                  disabled={!staffId.trim() || isLoading}
                >
                  {isLoading ? "Checking..." : "Continue"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Enter PIN
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Signing in as <span className="text-foreground font-medium">{foundStaff?.name}</span>
                </p>
              </div>
              
              <PinPad
                pin={pin}
                onPinChange={setPin}
                onSubmit={isLoading ? () => {} : handlePinSubmit}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2026 Mr. Jollof Foods Ltd
        </p>
      </div>
    </div>
  );
};

export default Login;
