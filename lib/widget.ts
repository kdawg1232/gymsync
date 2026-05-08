import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

const APP_GROUP = 'group.com.kdigavalli.gymsync';

export interface WidgetData {
  myCount: number;
  partnerCount: number;
  goal: number;
  myName: string;
  partnerName: string;
  wager: string;
  daysLeft: number;
  streak: number;
  hasPartner: boolean;
  partnerPhotoUrl: string | null;
  lastUpdated: string;
}

export async function updateWidgetData(data: WidgetData): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    await SharedGroupPreferences.setItem('widget_data', data, APP_GROUP);
  } catch (e) {
    if (__DEV__) console.warn('Failed to update widget data:', e);
  }
}

export async function clearWidgetData(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    const empty: WidgetData = {
      myCount: 0,
      partnerCount: 0,
      goal: 3,
      myName: 'You',
      partnerName: 'Partner',
      wager: '',
      daysLeft: 0,
      streak: 0,
      hasPartner: false,
      partnerPhotoUrl: null,
      lastUpdated: new Date().toISOString(),
    };
    await SharedGroupPreferences.setItem('widget_data', empty, APP_GROUP);
  } catch (e) {
    if (__DEV__) console.warn('Failed to clear widget data:', e);
  }
}
