import { User } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface StaffSelectorProps {
  staff: Staff[];
  selectedStaff: Staff | null;
  onSelect: (staff: Staff) => void;
}

const StaffSelector = ({ staff, selectedStaff, onSelect }: StaffSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {staff.map((member) => (
        <button
          key={member.id}
          onClick={() => onSelect(member)}
          className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
            selectedStaff?.id === member.id
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
              selectedStaff?.id === member.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-7 h-7" />
            )}
          </div>
          <span className="text-sm font-medium text-foreground text-center">
            {member.name}
          </span>
          <span className="text-xs text-muted-foreground">{member.role}</span>
        </button>
      ))}
    </div>
  );
};

export default StaffSelector;
