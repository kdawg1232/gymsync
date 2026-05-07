import AsyncStorage from '@react-native-async-storage/async-storage';

const WIDGET_DATA_KEY = '@gymsync_widget_data';

export interface WidgetData {
  myCount: number;
  partnerCount: number;
  goal: number;
  myName: string;
  partnerName: string;
  wager: string;
  daysLeft: number;
  streak: number;
  lastUpdated: string;
}

export async function updateWidgetData(data: WidgetData): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to update widget data:', e);
  }
}

export async function getWidgetData(): Promise<WidgetData | null> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function clearWidgetData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WIDGET_DATA_KEY);
  } catch (e) {
    console.warn('Failed to clear widget data:', e);
  }
}
