import { useNavigate } from "react-router-dom";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "./ThemeToggle";
import FullscreenToggle from "./FullscreenToggle";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: string | number;
  showBack?: boolean;
}

const PageHeader = ({
  title,
  icon: Icon,
  iconColor = "text-primary",
  badge,
  showBack = true,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
        <h1 className="text-lg sm:text-xl font-bold text-foreground">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {badge !== undefined && (
          <Badge variant="secondary">{badge}</Badge>
        )}
        <ThemeToggle />
        <FullscreenToggle />
      </div>
    </div>
  );
};

export default PageHeader;
