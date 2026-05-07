import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Settings, Target, Flame, Coffee } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { updatePact } from '@/lib/database';
import { Colors } from '@/constants/colors';

export default function RulesScreen() {
  const { goal, wager, pact, refreshPact } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editGoal, setEditGoal] = useState(goal);
  const [editWager, setEditWager] = useState(wager);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setEditGoal(goal);
    setEditWager(wager);
    setIsEditing(true);
  };

  const saveChanges = async () => {
    if (!pact) {
      Alert.alert('No Pact', 'Complete onboarding and pair with a partner first.');
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updatePact(pact.id, { goal: editGoal, wager: editWager });
      await refreshPact();
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const displayGoal = isEditing ? editGoal : goal;
  const displayWager = isEditing ? editWager : wager;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="flex-1 p-6 pt-14"
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-3xl font-bold text-pastel-pink">Weekly Rules</Text>
        <Pressable
          onPress={isEditing ? saveChanges : startEditing}
          disabled={saving}
          className="bg-white/10 px-4 py-2 rounded-full flex-row items-center gap-2 active:opacity-80"
        >
          <Settings size={16} color="#fff" />
          <Text className="text-white text-sm font-medium">
            {saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      <Text className="text-white/60 mb-6 font-medium">
        Set the expectations. Hold each other accountable.
      </Text>

      {/* Target Card */}
      <View className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 mb-6 overflow-hidden">
        <View className="absolute top-0 right-0 p-6 opacity-10">
          <Target size={120} color="#fff" />
        </View>

        <Text className="text-sm font-bold uppercase tracking-widest text-[#ffdfba] mb-6">
          The Minimum
        </Text>

        <View className="relative z-10">
          {isEditing ? (
            <View className="flex-row items-center bg-black/40 p-3 rounded-2xl justify-between border border-white/10">
              <Pressable
                onPress={() => setEditGoal(Math.max(1, editGoal - 1))}
                className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center active:opacity-80"
              >
                <Text className="text-2xl font-bold text-white">-</Text>
              </Pressable>
              <Text className="text-5xl font-black text-white">{displayGoal}</Text>
              <Pressable
                onPress={() => setEditGoal(Math.min(7, editGoal + 1))}
                className="w-12 h-12 bg-white/10 rounded-xl items-center justify-center active:opacity-80"
              >
                <Text className="text-2xl font-bold text-white">+</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-baseline gap-2">
              <Text className="text-7xl font-black text-white">{displayGoal}</Text>
              <Text className="text-2xl font-medium text-white/50">workouts</Text>
            </View>
          )}
          <Text className="text-white/40 mt-2">per week, completely non-negotiable.</Text>
        </View>
      </View>

      {/* Wager Card */}
      <View className="bg-[#1A1A1A] p-6 rounded-[32px] border border-[#ff8c00]/20 overflow-hidden">
        <View className="absolute -bottom-4 -right-4 p-6 opacity-10">
          <Flame size={140} color="#fff" />
        </View>

        <Text className="text-sm font-bold uppercase tracking-widest text-[#ff8c00] mb-6">
          The Penalty
        </Text>

        <View className="relative z-10">
          {isEditing ? (
            <View className="bg-black/40 p-4 rounded-2xl border border-white/10">
              <TextInput
                value={displayWager}
                onChangeText={setEditWager}
                className="text-2xl font-bold text-pastel-orange"
                placeholderTextColor="rgba(255,255,255,0.2)"
                placeholder="e.g. 1 Coffee"
              />
            </View>
          ) : (
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-[#ff8c00]/20 items-center justify-center">
                <Coffee size={24} color="#ff8c00" />
              </View>
              <Text className="text-3xl font-bold text-pastel-orange uppercase tracking-wide flex-1">
                {displayWager}
              </Text>
            </View>
          )}
          <Text className="text-white/40 mt-4 leading-relaxed">
            Miss your weekly target? You owe this to your partner immediately.
          </Text>
        </View>
      </View>
    </MotiView>
  );
}
