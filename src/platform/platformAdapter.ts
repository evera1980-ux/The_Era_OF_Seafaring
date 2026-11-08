import { triggerHapticFeedback, HapticStyle } from "./haptics";
import { sendMaritimeNotification } from "./notifications";

export interface PlatformCapabilities {
  isMobileViewport: boolean;
  supportsTouch: boolean;
  supportsVibration: boolean;
}

export class PlatformAdapter {
  getCapabilities(): PlatformCapabilities {
    if (typeof window === "undefined") {
      return {
        isMobileViewport: false,
        supportsTouch: false,
        supportsVibration: false,
      };
    }
    return {
      isMobileViewport: window.innerWidth < 768,
      supportsTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      supportsVibration:
        typeof navigator !== "undefined" && typeof navigator.vibrate === "function",
    };
  }

  haptic(style: HapticStyle = "light"): void {
    triggerHapticFeedback(style);
  }

  notify(title: string, body: string): Promise<boolean> {
    return sendMaritimeNotification(title, body);
  }
}

export const platformAdapter = new PlatformAdapter();
