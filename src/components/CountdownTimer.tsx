import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  targetMinutes: number;
  startTime: Date;
  showIcon?: boolean;
  className?: string;
}

const CountdownTimer = ({
  targetMinutes,
  startTime,
  showIcon = true,
  className = "",
}: CountdownTimerProps) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const targetSeconds = targetMinutes * 60;
      return targetSeconds - elapsed;
    };

    setRemainingSeconds(calculateRemaining());

    const interval = setInterval(() => {
      setRemainingSeconds(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetMinutes, startTime]);

  const formatTime = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${isNegative ? "-" : ""}${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isOverdue = remainingSeconds < 0;

  return (
    <div
      className={`flex items-center gap-1 text-sm font-medium ${
        isOverdue ? "text-destructive" : "text-muted-foreground"
      } ${className}`}
    >
      {showIcon && (
        isOverdue ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        )
      )}
      <span>{formatTime(remainingSeconds)}</span>
      {isOverdue && <span className="text-xs">(Delayed)</span>}
    </div>
  );
};

export default CountdownTimer;
