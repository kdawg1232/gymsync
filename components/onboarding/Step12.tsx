import { useState } from 'react';
import { View, Text, Pressable, Share, TextInput, Alert } from 'react-native';
import { User, Plus, Share2 } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { getProfileByInviteCode, pairPartner } from '@/lib/database';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step12({ nextStep }: Props) {
  const { user, profile, goal, wager, refreshProfile, refreshPact } = useApp();
  const [partnerCode, setPartnerCode] = useState('');
  const [joining, setJoining] = useState(false);

  const shareInvite = async () => {
    if (!profile?.invite_code) return;
    try {
      await Share.share({
        message: `Join me on GymSync! Use my invite code: ${profile.invite_code}\n\nDownload: https://gymsync.app`,
      });
    } catch (_) {}
  };

  const joinWithCode = async () => {
    if (!user || !partnerCode.trim()) return;
    setJoining(true);
    try {
      const partner = await getProfileByInviteCode(partnerCode.trim());
      if (!partner) {
        Alert.alert('Not Found', 'No user found with that code.');
        return;
      }
      if (partner.id === user.id) {
        Alert.alert('Oops', "That's your own code!");
        return;
      }
      await pairPartner(user.id, partner.id, goal, wager);
      await refreshProfile();
      await refreshPact();
      Alert.alert('Paired!', `You're now connected with ${partner.name}.`);
      nextStep();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not join.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <View className="flex-1 items-center w-full">
      <View className="flex-1 w-full max-w-sm justify-center items-center px-4">
        <Text className="text-4xl font-black text-white text-center mb-4">
          Tandem requires two.
        </Text>
        <Text className="text-pastel-blue text-base text-center leading-relaxed mb-12">
          Your dashboard is locked until your partner joins the pact. Summon them.
        </Text>

        <View className="bg-[#1A1A1A] w-full p-8 rounded-[32px] border border-white/5 overflow-hidden mb-6">
          <View className="flex-row justify-center items-center gap-4 mb-8">
            <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center border border-white/20">
              <User size={24} color="#fff" />
            </View>
            <View className="items-center gap-1">
              <View className="w-1 h-1 bg-white/20 rounded-full" />
              <View className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <View className="w-2 h-2 bg-pastel-purple rounded-full" />
            </View>
            <View className="w-16 h-16 rounded-full border-2 border-dashed border-pastel-purple/50 items-center justify-center bg-pastel-purple/5">
              <Plus size={24} color={Colors.pastelPurple} />
            </View>
          </View>

          {profile?.invite_code && (
            <View className="bg-white/5 p-3 rounded-xl mb-4 items-center border border-white/5">
              <Text className="text-xs text-white/45 mb-1 font-bold">Your Code</Text>
              <Text className="text-2xl font-black tracking-widest text-pastel-yellow">
                {profile.invite_code}
              </Text>
            </View>
          )}

          <Pressable
            onPress={shareInvite}
            className="w-full bg-white/10 border border-white/10 py-4 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-80"
          >
            <Share2 size={20} color="#fff" />
            <Text className="text-white font-bold text-base">Share Invite Link</Text>
          </Pressable>
        </View>

        {/* Join with partner's code */}
        <View className="bg-[#1A1A1A] w-full p-6 rounded-[32px] border border-white/5">
          <Text className="text-white/50 text-sm font-bold mb-3">Have a code from your partner?</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={partnerCode}
              onChangeText={setPartnerCode}
              placeholder="ENTER CODE"
              placeholderTextColor="rgba(255,255,255,0.35)"
              className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-xl font-black tracking-widest text-white text-center uppercase"
              maxLength={6}
              autoCapitalize="characters"
            />
            <Pressable
              onPress={joinWithCode}
              disabled={joining || !partnerCode.trim()}
              className="bg-pastel-purple px-5 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-black font-bold">{joining ? '...' : 'Join'}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="w-full pt-4 pb-2 mb-5 max-w-sm px-4 gap-4 self-center">
        <Pressable
          onPress={nextStep}
          className="w-full bg-pastel-purple py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Continue</Text>
        </Pressable>
        <Pressable onPress={nextStep} className="w-full py-2 items-center">
          <Text className="text-white/45 font-bold text-sm">Skip — I'll pair later</Text>
        </Pressable>
      </View>
    </View>
  );
}
