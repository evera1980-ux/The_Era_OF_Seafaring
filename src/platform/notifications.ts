/**
 * 航海事件本地通知桥接器 (Web Notification API / Capacitor LocalNotifications)
 */
export async function sendMaritimeNotification(
  title: string,
  body: string
): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    if (Notification.permission === "granted") {
      new Notification(title, { body });
      return true;
    }
  } catch {
    // 忽略无权限环境
  }
  return false;
}
