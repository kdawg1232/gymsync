import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Pressable, TextInput, ScrollView, Alert,
  Image, Linking, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MotiView } from 'moti';
import {
  Settings, X, Shield, FileText, Check, HelpCircle,
  Bell, BellOff, Clock, Smartphone, User as UserIcon,
  Camera, KeyRound, Trash2,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { SettingsMenuItem } from '@/components/ui/SettingsMenuItem';
import { SettingsToggle } from '@/components/ui/SettingsToggle';
import { Colors } from '@/constants/colors';
import {
  getProfileByInviteCode, pairPartner, updatePact, unpairPartners,
  updateProfile, getNotificationPrefs, updateNotificationPrefs,
  clearMyData, deleteMyAccount,
} from '@/lib/database';
import { uploadAvatar } from '@/lib/storage';
import {
  scheduleWorkoutReminder, scheduleWeeklySummary,
  cancelAllNotifications, registerForPushNotifications,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { clearWidgetData } from '@/lib/widget';
import type { NotificationPreference } from '@/types';

const GYMSYNC_WEB_BASE = 'https://thegymsyncapp.netlify.app';

export default function ProfileScreen() {
  const {
    user, profile, partnerProfile, pact,
    wager, myDebt, partnerDebt, partnerName, goal,
    refreshProfile, refreshPact, handleSignOut,
  } = useApp();

  const [showSettings, setShowSettings] = useState(false);
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [addingPartner, setAddingPartner] = useState(false);
  const [removingPartner, setRemovingPartner] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreference | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [changingAvatar, setChangingAvatar] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const isUser1 = pact ? pact.user1_id === user?.id : true;

  // Load notification preferences when settings open
  useEffect(() => {
    if (showSettings && user) {
      getNotificationPrefs(user.id).then(setNotifPrefs).catch(() => {});
    }
  }, [showSettings, user]);

  const resolveMyDebt = async () => {
    if (!pact || myDebt <= 0) return;
    try {
      await updatePact(pact.id, {
        [isUser1 ? 'user1_debt' : 'user2_debt']: myDebt - 1,
      });
      await refreshPact();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update debt.');
    }
  };

  const clearPartnerDebt = async () => {
    if (!pact || partnerDebt <= 0) return;
    try {
      await updatePact(pact.id, {
        [isUser1 ? 'user2_debt' : 'user1_debt']: partnerDebt - 1,
      });
      await refreshPact();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update debt.');
    }
  };

  const copyInviteCode = async () => {
    if (!profile?.invite_code) return;
    await Clipboard.setStringAsync(profile.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addPartner = async () => {
    if (!user || !partnerCodeInput.trim()) return;
    setAddingPartner(true);
    try {
      const partner = await getProfileByInviteCode(partnerCodeInput.trim());
      if (!partner) {
        Alert.alert('Not Found', 'No user found with that invite code.');
        return;
      }
      if (partner.id === user.id) {
        Alert.alert('Oops', "You can't pair with yourself!");
        return;
      }
      await pairPartner(user.id, partner.id, goal, wager);
      await refreshProfile();
      await refreshPact();
      setPartnerCodeInput('');
      Alert.alert('Paired!', `You're now connected with ${partner.name}.`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not add partner.');
    } finally {
      setAddingPartner(false);
    }
  };

  const removePartner = () => {
    if (!user) return;
    Alert.alert(
      'Remove partner?',
      'You will both be unlinked and your current pact will end. You can pair with someone else using invite codes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingPartner(true);
            try {
              await unpairPartners(user.id);
              await refreshProfile();
              await refreshPact();
              Alert.alert('Done', 'Your partner has been removed.');
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Could not remove partner.');
            } finally {
              setRemovingPartner(false);
            }
          },
        },
      ],
    );
  };

  // ── Settings handlers ──

  const toggleNotifPref = async (
    key: 'workout_reminders' | 'partner_activity' | 'weekly_summary',
    value: boolean,
  ) => {
    if (!user || !notifPrefs) return;
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    try {
      await updateNotificationPrefs(user.id, { [key]: value });

      if (key === 'workout_reminders' && value) {
        await registerForPushNotifications(user.id);
      }

      await cancelAllNotifications();
      if (updated.workout_reminders) await scheduleWorkoutReminder(9, 0);
      if (updated.weekly_summary) await scheduleWeeklySummary();
    } catch (e: any) {
      setNotifPrefs(notifPrefs);
      Alert.alert('Error', e.message ?? 'Could not update preferences.');
    }
  };

  const startEditingName = () => {
    setNewName(profile?.name ?? '');
    setEditingName(true);
  };

  const saveName = async () => {
    if (!user || !newName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(user.id, { name: newName.trim() });
      await refreshProfile();
      setEditingName(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update name.');
    } finally {
      setSavingName(false);
    }
  };

  const changeAvatar = async () => {
    if (!user) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    setChangingAvatar(true);
    try {
      const url = await uploadAvatar(user.id, result.assets[0].uri);
      await updateProfile(user.id, { avatar_url: url });
      await refreshProfile();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update avatar.');
    } finally {
      setChangingAvatar(false);
    }
  };

  const changePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your new password (at least 6 characters):',
      async (newPassword) => {
        if (!newPassword || newPassword.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters.');
          return;
        }
        try {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw error;
          Alert.alert('Success', 'Password updated successfully.');
        } catch (e: any) {
          Alert.alert('Error', e.message ?? 'Could not change password.');
        }
      },
      'secure-text',
    );
  };

  const confirmClearData = () => {
    if (!user) return;
    Alert.alert(
      'Delete your app data?',
      'This deletes your workout logs, photos, avatar, partner link, and active pact data. Notification settings reset to defaults. Your account stays active.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Data',
          style: 'destructive',
          onPress: async () => {
            setClearingData(true);
            try {
              await clearMyData();
              await cancelAllNotifications();
              await clearWidgetData();
              await refreshProfile();
              await refreshPact();
              setNotifPrefs(await getNotificationPrefs(user.id));
              Alert.alert('Data Deleted', 'Your stored app data has been removed.');
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Could not delete your data.');
            } finally {
              setClearingData(false);
            }
          },
        },
      ],
    );
  };

  const confirmDeleteAccount = () => {
    if (!user) return;
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your account and all GymSync data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);
            try {
              await deleteMyAccount();
              await cancelAllNotifications();
              await clearWidgetData();
              setShowSettings(false);
              await handleSignOut();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Could not delete your account.');
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ],
    );
  };

  const onSignOut = async () => {
    setShowSettings(false);
    await handleSignOut();
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="p-6 pt-20 pb-32">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-row items-center gap-3 flex-1">
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} className="w-12 h-12 rounded-full" />
              ) : (
                <View className="w-12 h-12 rounded-full bg-pastel-green/20 items-center justify-center">
                  <UserIcon size={22} color={Colors.pastelGreen} />
                </View>
              )}
              <Text className="text-3xl font-bold text-pastel-green flex-1" numberOfLines={1}>
                {profile?.name ?? 'Profile'}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowSettings(true)}
              className="p-2 bg-white/10 rounded-full active:opacity-80"
            >
              <Settings size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Wager Balances */}
          <View className="gap-4 mb-8">
            <Text className="text-sm font-bold uppercase tracking-widest text-white/50">
              Wager Balances
            </Text>

            <View className="bg-[#1A1A1A] p-5 rounded-3xl flex-row justify-between items-center border-l-4 border-pastel-pink">
              <View>
                <Text className="text-white/60 text-sm font-medium mb-1">You owe {partnerName}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-3xl font-black text-pastel-pink">{myDebt}</Text>
                  <Text className="text-sm font-bold text-white/80">{wager}</Text>
                </View>
              </View>
              {myDebt > 0 && (
                <Pressable
                  onPress={resolveMyDebt}
                  className="bg-pastel-pink/10 px-4 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-pastel-pink font-bold">Resolve 1</Text>
                </Pressable>
              )}
            </View>

            <View className="bg-[#1A1A1A] p-5 rounded-3xl flex-row justify-between items-center border-l-4 border-pastel-green">
              <View>
                <Text className="text-white/60 text-sm font-medium mb-1">{partnerName} owes you</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-3xl font-black text-pastel-green">{partnerDebt}</Text>
                  <Text className="text-sm font-bold text-white/80">{wager}</Text>
                </View>
              </View>
              {partnerDebt > 0 && (
                <Pressable
                  onPress={clearPartnerDebt}
                  className="bg-pastel-green/10 px-4 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-pastel-green font-bold">Clear 1</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Partner Info Card (shown when connected) */}
          {partnerProfile && (
            <View className="gap-4 mb-8">
              <Text className="text-sm font-bold uppercase tracking-widest text-white/50">
                Your Partner
              </Text>
              <View className="bg-[#1A1A1A] border border-white/10 p-6 rounded-[32px]">
                <View className="flex-row items-center gap-4">
                  {partnerProfile.avatar_url ? (
                    <Image source={{ uri: partnerProfile.avatar_url }} className="w-14 h-14 rounded-full" />
                  ) : (
                    <View className="w-14 h-14 rounded-full bg-pastel-purple/20 items-center justify-center">
                      <UserIcon size={24} color={Colors.pastelPurple} />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="font-bold text-white text-lg">{partnerProfile.name}</Text>
                    <Text className="text-white/40 text-sm">Paired & Active</Text>
                  </View>
                  <View className="bg-pastel-green/20 px-3 py-1.5 rounded-full">
                    <Text className="text-pastel-green text-xs font-bold">Connected</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Partner Sync */}
          <View className="gap-4 pt-4 pb-12">
            <Text className="text-sm font-bold uppercase tracking-widest text-white/50">
              Partner Sync
            </Text>
            <View className="bg-[#1A1A1A] border border-white/10 p-6 rounded-[32px] gap-6">
              {!partnerProfile && (
                <View>
                  <Text className="font-bold text-white/80 mb-3">Sync a new partner</Text>
                  <View className="flex-row gap-2">
                    <TextInput
                      value={partnerCodeInput}
                      onChangeText={setPartnerCodeInput}
                      placeholder="ENTER CODE"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-xl font-black tracking-widest text-white text-center uppercase"
                      maxLength={6}
                      autoCapitalize="characters"
                    />
                    <Pressable
                      onPress={addPartner}
                      disabled={addingPartner || !partnerCodeInput.trim()}
                      className="bg-white px-6 py-3 rounded-xl active:opacity-80"
                    >
                      <Text className="text-black font-bold">
                        {addingPartner ? '...' : 'Add'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              <View className={!partnerProfile ? "pt-6 border-t border-white/10" : ""}>
                <Text className="text-sm text-white/50 mb-2 font-medium">Your Invite Code</Text>
                <View className="flex-row items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                  <Text className="text-2xl font-black tracking-widest text-pastel-yellow">
                    {profile?.invite_code ?? '-----'}
                  </Text>
                  <Pressable
                    onPress={copyInviteCode}
                    className="bg-white/10 px-4 py-2 rounded-lg active:opacity-80"
                  >
                    <Text className="text-white text-sm font-bold">
                      {copied ? 'Copied!' : 'Copy'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {partnerProfile && (
                <View className="pt-6 border-t border-white/10">
                  <Pressable
                    onPress={removePartner}
                    disabled={removingPartner}
                    className="w-full py-3.5 items-center rounded-xl border border-white/15 bg-white/5 active:opacity-80"
                  >
                    <Text className="text-white/80 font-bold">
                      {removingPartner ? 'Removing...' : 'Remove partner & pair with someone else'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </MotiView>
      </ScrollView>

      {/* Settings overlay */}
      {showSettings && (
        <View className="absolute inset-0 z-50 bg-[#0A0A0A]">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <ScrollView className="flex-1" contentContainerClassName="p-6 pb-32">
                <View className="flex-row justify-between items-center mb-10 pt-14">
                  <Text className="text-3xl font-black text-white">Settings</Text>
                  <Pressable
                    onPress={() => {
                      setShowSettings(false);
                      setEditingName(false);
                    }}
                    className="p-3 bg-white/10 rounded-full active:opacity-80"
                  >
                    <X size={24} color="#fff" />
                  </Pressable>
                </View>

                {/* Account Section */}
                <Text className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
                  Account
                </Text>
                <View className="gap-3 mb-8">
                  {editingName ? (
                    <View className="w-full p-5 bg-[#1A1A1A] rounded-3xl gap-3">
                      <TextInput
                        value={newName}
                        onChangeText={setNewName}
                        placeholder="Your name"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        autoFocus
                        className="text-lg font-bold text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10"
                      />
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => setEditingName(false)}
                          className="flex-1 py-3 items-center bg-white/10 rounded-xl"
                        >
                          <Text className="text-white font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable
                          onPress={saveName}
                          disabled={savingName || !newName.trim()}
                          className="flex-1 py-3 items-center bg-pastel-green rounded-xl"
                        >
                          <Text className="text-black font-bold">
                            {savingName ? 'Saving...' : 'Save'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <SettingsMenuItem
                      icon={<UserIcon size={24} color={Colors.pastelGreen} />}
                      label="Edit Name"
                      onPress={startEditingName}
                    />
                  )}
                  <SettingsMenuItem
                    icon={<Camera size={24} color={Colors.pastelOrange} />}
                    label="Change Avatar"
                    onPress={changeAvatar}
                  />
                  <SettingsMenuItem
                    icon={<KeyRound size={24} color={Colors.pastelBlue} />}
                    label="Change Password"
                    onPress={changePassword}
                  />
                </View>

                {/* Notifications Section */}
                <Text className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
                  Notifications
                </Text>
                <View className="gap-3 mb-8">
                  <SettingsToggle
                    icon={<Bell size={24} color={Colors.pastelOrange} />}
                    label="Workout Reminders"
                    value={notifPrefs?.workout_reminders ?? false}
                    onValueChange={(v) => toggleNotifPref('workout_reminders', v)}
                    disabled={!notifPrefs}
                  />
                  <SettingsToggle
                    icon={<BellOff size={24} color={Colors.pastelPurple} />}
                    label="Partner Activity"
                    value={notifPrefs?.partner_activity ?? false}
                    onValueChange={(v) => toggleNotifPref('partner_activity', v)}
                    disabled={!notifPrefs}
                  />
                  <SettingsToggle
                    icon={<Clock size={24} color={Colors.pastelYellow} />}
                    label="Weekly Summary"
                    value={notifPrefs?.weekly_summary ?? false}
                    onValueChange={(v) => toggleNotifPref('weekly_summary', v)}
                    disabled={!notifPrefs}
                  />
                </View>

                {/* Widget Section */}
                <Text className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
                  Widget
                </Text>
                <View className="gap-3 mb-8">
                  <SettingsMenuItem
                    icon={<Smartphone size={24} color={Colors.pastelBlue} />}
                    label="Setup Widget"
                    onPress={() =>
                      Alert.alert(
                        'Add Widget',
                        Platform.OS === 'ios'
                          ? 'Long-press your home screen → tap the "+" button in the top-left → search "GymSync" → choose a widget size → tap "Add Widget".'
                          : 'Long-press your home screen → tap "Widgets" → find "GymSync" → drag the widget to your home screen.',
                      )
                    }
                  />
                  <SettingsMenuItem
                    icon={<Trash2 size={24} color={Colors.pastelRed} />}
                    label="Remove Widget"
                    onPress={() =>
                      Alert.alert(
                        'Remove Widget',
                        Platform.OS === 'ios'
                          ? 'Long-press the widget on your home screen → tap "Remove Widget" → confirm.'
                          : 'Long-press the widget → drag it to "Remove" at the top of the screen.',
                      )
                    }
                  />
                </View>

                {/* About Section */}
                <Text className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3">
                  About
                </Text>
                <View className="gap-3">
                  <SettingsMenuItem
                    icon={<Shield size={24} color={Colors.pastelPurple} />}
                    label="Privacy Policy"
                    onPress={() => Linking.openURL(`${GYMSYNC_WEB_BASE}/privacy`)}
                  />
                  <SettingsMenuItem
                    icon={<FileText size={24} color={Colors.pastelYellow} />}
                    label="Terms of Service"
                    onPress={() => Linking.openURL(`${GYMSYNC_WEB_BASE}/terms`)}
                  />
                  <SettingsMenuItem
                    icon={<Check size={24} color={Colors.pastelGreen} />}
                    label="Request a Feature"
                    onPress={() => Linking.openURL('mailto:karsai1232@gmail.com?subject=Feature%20Request')}
                  />
                  <SettingsMenuItem
                    icon={<HelpCircle size={24} color={Colors.pastelPink} />}
                    label="Support"
                    onPress={() => Linking.openURL(`${GYMSYNC_WEB_BASE}/support`)}
                  />
                </View>

                {/* Danger Zone */}
                <Text className="text-sm font-bold uppercase tracking-widest text-red-500/60 mt-8 mb-3">
                  Danger Zone
                </Text>
                <View className="gap-3">
                  <Pressable
                    onPress={clearingData ? undefined : confirmClearData}
                    disabled={clearingData || deletingAccount}
                    className="w-full flex-row items-center justify-between p-5 bg-red-500/10 rounded-3xl active:scale-95 disabled:opacity-50"
                    style={{ transform: [{ scale: 1 }] }}
                  >
                    <View className="flex-row items-center gap-4">
                      <Trash2 size={24} color={Colors.pastelRed} />
                      <Text className="font-bold text-lg text-red-400">
                        {clearingData ? 'Deleting Data...' : 'Delete All Data'}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={deletingAccount ? undefined : confirmDeleteAccount}
                    disabled={clearingData || deletingAccount}
                    className="w-full flex-row items-center justify-between p-5 bg-red-500/10 rounded-3xl border border-red-500/20 active:scale-95 disabled:opacity-50"
                    style={{ transform: [{ scale: 1 }] }}
                  >
                    <View className="flex-row items-center gap-4">
                      <Trash2 size={24} color={Colors.pastelRed} />
                      <Text className="font-bold text-lg text-red-500">
                        {deletingAccount ? 'Deleting Account...' : 'Delete My Account'}
                      </Text>
                    </View>
                  </Pressable>
                </View>

                <View className="mt-16">
                  <Pressable
                    onPress={onSignOut}
                    className="w-full py-4 items-center bg-red-500/10 rounded-2xl active:opacity-80"
                  >
                    <Text className="text-red-500 font-bold">Sign Out</Text>
                  </Pressable>
                  <Text className="text-white/20 text-xs text-center mt-4">GymSync v1.0.0</Text>
                </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}
