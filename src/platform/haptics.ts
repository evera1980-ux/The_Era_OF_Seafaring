export type HapticStyle = "light" | "medium" | "heavy" | "warning" | "error";

/**
 * 移动端触觉反馈桥接器 (Capacitor Haptics / Web Vibration API)
 */
export function triggerHapticFeedback(style: HapticStyle = "light"): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      switch (style) {
        case "light":
          navigator.vibrate(10);
          break;
        case "medium":
          navigator.vibrate(25);
          break;
        case "heavy":
          navigator.vibrate(50);
          break;
        case "warning":
          navigator.vibrate([30, 40, 30]);
          break;
        case "error":
          navigator.vibrate([60, 50, 80]);
          break;
      }
    }
  } catch {
    // 忽略不支持震动的桌面浏览器环境
  }
}
