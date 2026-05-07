import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Settings, X, Shield, FileText, Check, HelpCircle } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { SettingsMenuItem } from '@/components/ui/SettingsMenuItem';
import { Colors } from '@/constants/colors';

export default function ProfileScreen() {
  const { wager, myDebt, setMyDebt, partnerDebt, setPartnerDebt, setOnboarded } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const myCode = 'X9K2M';

  return (
    <View className="flex-1">
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="flex-1 p-6 pt-14"
      >
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-bold text-pastel-green">Profile</Text>
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

          {/* I owe partner */}
          <View className="bg-[#1A1A1A] p-5 rounded-3xl flex-row justify-between items-center border-l-4 border-pastel-pink">
            <View>
              <Text className="text-white/60 text-sm font-medium mb-1">You owe Sarah</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-3xl font-black text-pastel-pink">{myDebt}</Text>
                <Text className="text-sm font-bold text-white/80">{wager}</Text>
              </View>
            </View>
            {myDebt > 0 && (
              <Pressable
                onPress={() => setMyDebt(Math.max(0, myDebt - 1))}
                className="bg-pastel-pink/10 px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-pastel-pink font-bold">Resolve 1</Text>
              </Pressable>
            )}
          </View>

          {/* Partner owes me */}
          <View className="bg-[#1A1A1A] p-5 rounded-3xl flex-row justify-between items-center border-l-4 border-pastel-green">
            <View>
              <Text className="text-white/60 text-sm font-medium mb-1">Sarah owes you</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-3xl font-black text-pastel-green">{partnerDebt}</Text>
                <Text className="text-sm font-bold text-white/80">{wager}</Text>
              </View>
            </View>
            {partnerDebt > 0 && (
              <Pressable
                onPress={() => setPartnerDebt(Math.max(0, partnerDebt - 1))}
                className="bg-pastel-green/10 px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-pastel-green font-bold">Clear 1</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Partner Sync */}
        <View className="gap-4 pt-4 pb-12">
          <Text className="text-sm font-bold uppercase tracking-widest text-white/50">
            Partner Sync
          </Text>
          <View className="bg-[#1A1A1A] border border-white/10 p-6 rounded-[32px] gap-6">
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
                <Pressable className="bg-white px-6 py-3 rounded-xl active:opacity-80">
                  <Text className="text-black font-bold">Add</Text>
                </Pressable>
              </View>
            </View>

            <View className="pt-6 border-t border-white/10">
              <Text className="text-sm text-white/50 mb-2 font-medium">Your Invite Code</Text>
              <View className="flex-row items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                <Text className="text-2xl font-black tracking-widest text-pastel-yellow">
                  {myCode}
                </Text>
                <Pressable className="bg-white/10 px-4 py-2 rounded-lg active:opacity-80">
                  <Text className="text-white text-sm font-bold">Copy</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </MotiView>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <MotiView
            from={{ opacity: 0, translateY: 800 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 800 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-50 bg-[#0A0A0A]"
          >
            <ScrollView className="flex-1 p-6 pb-24">
              <View className="flex-row justify-between items-center mb-10 pt-14">
                <Text className="text-3xl font-black text-white">Settings</Text>
                <Pressable
                  onPress={() => setShowSettings(false)}
                  className="p-3 bg-white/10 rounded-full active:opacity-80"
                >
                  <X size={24} color="#fff" />
                </Pressable>
              </View>

              <View className="gap-3">
                <SettingsMenuItem
                  icon={<Shield size={24} color={Colors.pastelPurple} />}
                  label="Privacy Policy"
                />
                <SettingsMenuItem
                  icon={<FileText size={24} color={Colors.pastelYellow} />}
                  label="Terms of Service"
                />
                <SettingsMenuItem
                  icon={<Check size={24} color={Colors.pastelGreen} />}
                  label="Request a Feature"
                />
                <SettingsMenuItem
                  icon={<HelpCircle size={24} color={Colors.pastelPink} />}
                  label="Support"
                />
              </View>

              <View className="mt-16">
                <Pressable
                  onPress={() => {
                    setShowSettings(false);
                    setOnboarded(false);
                  }}
                  className="w-full py-4 items-center bg-red-500/10 rounded-2xl active:opacity-80"
                >
                  <Text className="text-red-500 font-bold">Sign Out</Text>
                </Pressable>
              </View>
            </ScrollView>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}
