import { useState, useEffect, useCallback } from "react";

export const useCountdown = (targetMinutes: number, startTime: Date) => {
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

  const formatTime = useCallback((seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${isNegative ? "-" : ""}${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isOverdue: remainingSeconds < 0,
  };
};
