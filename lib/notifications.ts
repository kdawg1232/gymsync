import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { updateProfile } from './database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(
  userId: string,
): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'd3a3c000-50bb-4232-bf26-37bf5aa68ed6',
  });
  const token = tokenData.data;

  await updateProfile(userId, { notification_token: token });

  return token;
}

export async function scheduleWorkoutReminder(
  hour: number,
  minute: number,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to work out! 💪',
      body: "Your partner is counting on you. Don't break the streak!",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}

export async function scheduleWeeklySummary(): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Weekly Check-in 📊',
      body: 'How did your week go? Check your progress and settle any wagers!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 19,
      minute: 0,
    },
  });

  return id;
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function onNotificationResponse(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
