import { useCallback, useRef, useEffect } from "react";
import { getCachedStaffPreference } from "./useStaffPreferences";

// One shared AudioContext for every beep in the app. Browsers create contexts
// in the "suspended" state unless construction/resume happens inside a user
// gesture — unlockAudio() is called from a one-time gesture listener (see
// POSPage) so notification tones fired by background polling are audible.
let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return sharedCtx;
}

/** Create/resume the shared AudioContext. Must be called from a user gesture. */
export function unlockAudio(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    // Audio unavailable (e.g. no output device) — beeps just stay silent.
  }
}

export const useBeepSound = () => {
  const playBeep = useCallback(() => {
    // Respect the staff member's beep preference (settable from /settings).
    if (!getCachedStaffPreference("beepEnabled")) return;

    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.3;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  }, []);

  return playBeep;
};

export const useContinuousBeep = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playNotificationTone = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") void ctx.resume();

    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gainNode.gain.value = 0.4;
      oscillator.start(ctx.currentTime + startTime);
      oscillator.stop(ctx.currentTime + startTime + duration);
    };

    playTone(880, 0, 0.15);
    playTone(1100, 0.2, 0.15);
    playTone(880, 0.4, 0.15);
  }, []);

  const startBeeping = useCallback(() => {
    // Play immediately
    playNotificationTone();
    // Then repeat every 3 seconds
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(playNotificationTone, 3000);
  }, [playNotificationTone]);

  const stopBeeping = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopBeeping();
    };
  }, [stopBeeping]);

  return { startBeeping, stopBeeping };
};
