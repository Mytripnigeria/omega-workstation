import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/tables": "Table Map",
  "/reports": "Reports",
  "/settings": "Settings",
};

const PlaceholderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Page";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground max-w-md">
          This feature is coming soon. We're working hard to bring you an amazing experience.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
