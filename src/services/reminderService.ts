import { ReminderRule } from '../types';

export class ReminderService {
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  public getNotificationPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public isInQuietHours(rule: ReminderRule): boolean {
    if (!rule.quietHoursStart || !rule.quietHoursEnd) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = rule.quietHoursStart.split(':').map(Number);
    const [endH, endM] = rule.quietHoursEnd.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight (e.g., 22:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  public triggerTestNotification(rule: ReminderRule): void {
    const title = `MyMentor Check-in: ${rule.curatedCategory || 'Daily Nudge'}`;
    const body = rule.customMessage || 'Take a moment to reflect on your primary goal and align your focus.';

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg'
        });
      } catch {
        // Fallback to in-app alert or log
      }
    }
  }
}

export const reminderService = new ReminderService();
