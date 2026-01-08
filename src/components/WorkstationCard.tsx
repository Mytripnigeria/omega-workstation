import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WorkstationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  colorClass: string;
  iconBgClass: string;
}

const WorkstationCard = ({
  title,
  description,
  icon: Icon,
  route,
  colorClass,
  iconBgClass,
}: WorkstationCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="workstation-card bg-card border border-border group"
      onClick={() => navigate(route)}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${iconBgClass}`}
        >
          <Icon className={`w-8 h-8 ${colorClass}`} />
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        
        <div className="mt-auto pt-4">
          <span className={`text-sm font-medium ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity`}>
            Open →
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkstationCard;
