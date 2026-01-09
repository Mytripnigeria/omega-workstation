import { useCallback } from "react";

export const useOrderNotification = () => {
  const playNotificationSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play a distinctive two-tone notification
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gainNode.gain.value = 0.4;

      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };

    // Two-tone alert pattern
    playTone(880, 0, 0.15);
    playTone(1100, 0.2, 0.15);
    playTone(880, 0.4, 0.15);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
      });
    }
  }, []);

  const notifyNewOrder = useCallback((orderNumber: string, source: string) => {
    playNotificationSound();
    showNotification("New Order!", `Order #${orderNumber} from ${source}`);
  }, [playNotificationSound, showNotification]);

  return {
    playNotificationSound,
    requestNotificationPermission,
    showNotification,
    notifyNewOrder,
  };
};
