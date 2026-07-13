import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Full-screen "Restricted" notice shown when the merchant's workstation
 * settings (functionRoleAccess) exclude the signed-in staff role from a
 * workstation function. Mirrors the Instore/Outstore restricted screens.
 */
const FunctionRestricted = ({ label }: { label: string }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm">
        <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <h1 className="text-lg font-bold text-foreground mb-1">Restricted</h1>
        <p className="text-sm text-muted-foreground mb-4">
          {label} is not available to your role. Ask a manager to update the
          workstation settings if you need access.
        </p>
        <Button onClick={() => navigate("/dashboard")} className="rounded-xl">
          Back to dashboard
        </Button>
      </div>
    </div>
  );
};

export default FunctionRestricted;
