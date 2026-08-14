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

/**
 * How long an unacknowledged order alert keeps sounding. The client's rule:
 * loud and continuous for 30 seconds unless someone acts on the order, so it
 * can't be missed across a noisy kitchen — but it doesn't ring forever.
 */
export const ALERT_DURATION_MS = 30_000;

/** Gap between repeats inside the alert window. */
const ALERT_REPEAT_MS = 2_000;

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

/**
 * A loud, repeating order alert.
 *
 * `startBeeping()` sounds an urgent pattern immediately, repeats it every two
 * seconds, and stops itself after {@link ALERT_DURATION_MS}. Calling it again
 * (another order arrives) restarts the window; `stopBeeping()` — wired to the
 * dismiss/act handlers — silences it at once.
 */
export const useContinuousBeep = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playNotificationTone = useCallback(() => {
    if (!getCachedStaffPreference("beepEnabled")) return;

    const ctx = getAudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    if (ctx.state !== "running") return;

    // A square wave carries much further than a sine at the same gain, which is
    // what "noticeably unavoidable" needs on a busy floor. Each tone is ramped
    // down rather than cut, so it reads as a siren instead of a click.
    const playTone = (frequency: number, startTime: number, duration: number) => {
      try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = "square";
        const at = ctx.currentTime + startTime;
        gainNode.gain.setValueAtTime(0.0001, at);
        gainNode.gain.exponentialRampToValueAtTime(0.9, at + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, at + duration);
        oscillator.start(at);
        oscillator.stop(at + duration);
      } catch {
        // Fail silently — the board must keep working without sound.
      }
    };

    // Rising three-tone chime, repeated once, so a single alert lasts ~1.2s.
    playTone(880, 0, 0.18);
    playTone(1175, 0.22, 0.18);
    playTone(1568, 0.44, 0.26);
    playTone(880, 0.78, 0.18);
    playTone(1175, 1.0, 0.18);
  }, []);

  const stopBeeping = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startBeeping = useCallback(() => {
    stopBeeping();
    playNotificationTone();
    intervalRef.current = setInterval(playNotificationTone, ALERT_REPEAT_MS);
    // Self-limiting: 30 seconds of alarm, then silence until the next order.
    timeoutRef.current = setTimeout(stopBeeping, ALERT_DURATION_MS);
  }, [playNotificationTone, stopBeeping]);

  useEffect(() => {
    return () => {
      stopBeeping();
    };
  }, [stopBeeping]);

  return { startBeeping, stopBeeping };
};

/**
 * Fires the loud alert whenever `count` rises — i.e. a genuinely *new* order
 * landed on the board. Falling or unchanged counts stay silent, so working
 * through a queue doesn't re-trigger the alarm.
 */
export const useNewItemAlert = (count: number, enabled = true) => {
  const { startBeeping, stopBeeping } = useContinuousBeep();
  const previousRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const previous = previousRef.current;
    previousRef.current = count;
    // Skip the first observation: arriving at a screen that already has orders
    // waiting is not a new-order event.
    if (previous === null) return;
    if (count > previous) startBeeping();
  }, [count, enabled, startBeeping]);

  return { stopBeeping };
};
