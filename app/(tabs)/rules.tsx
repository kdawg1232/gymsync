import { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { Settings, Check, Clock, Plus } from 'lucide-react-native';
import { startOfWeek, format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { updatePact, createWagerEntry, updateWagerStatus } from '@/lib/database';
import { Colors } from '@/constants/colors';
import type { WagerLedgerEntry } from '@/types';

export default function RulesScreen() {
  const {
    user, goal, wager, pact, partnerProfile, partnerName,
    wagerLedger, refreshPact, refreshLedger,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editGoal, setEditGoal] = useState(goal);
  const [editWager, setEditWager] = useState(wager);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  // Split ledger into categories
  const { iOwe, theyOwe, shelved, history } = useMemo(() => {
    const iOwe: WagerLedgerEntry[] = [];
    const theyOwe: WagerLedgerEntry[] = [];
    const shelved: WagerLedgerEntry[] = [];
    const history: WagerLedgerEntry[] = [];

    for (const entry of wagerLedger) {
      if (entry.status === 'completed') {
        history.push(entry);
      } else if (entry.status === 'deferred') {
        shelved.push(entry);
      } else if (entry.debtor_id === user?.id) {
        iOwe.push(entry);
      } else {
        theyOwe.push(entry);
      }
    }
    return { iOwe, theyOwe, shelved, history };
  }, [wagerLedger, user?.id]);

  const handleStatusUpdate = async (entryId: string, status: 'completed' | 'deferred' | 'pending') => {
    if (!user) return;
    setUpdatingId(entryId);
    try {
      await updateWagerStatus(entryId, status, user.id);
      await refreshLedger();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not update wager.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddPenalty = async () => {
    if (!pact || !user || !partnerProfile) return;
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    try {
      await createWagerEntry({
        pact_id: pact.id,
        debtor_id: partnerProfile.id,
        creditor_id: user.id,
        penalty_text: wager,
        week_start: weekStart,
      });
      await refreshLedger();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not add penalty.');
    }
  };

  const confirmAddPenalty = () => {
    Alert.alert(
      'Add Penalty',
      `Record that ${partnerName} owes you "${wager}" for missing their goal this week?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: handleAddPenalty },
      ],
    );
  };

  const renderEntry = (entry: WagerLedgerEntry, isCreditor: boolean) => {
    const isDeferred = entry.status === 'deferred';
    const isUpdating = updatingId === entry.id;
    const borderColor = isCreditor ? Colors.pastelGreen : Colors.pastelPink;

    return (
      <View
        key={entry.id}
        className="bg-[#1A1A1A] p-4 rounded-2xl border-l-4 mb-3"
        style={{ borderLeftColor: borderColor }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="text-white font-bold text-base">{entry.penalty_text}</Text>
            <Text className="text-white/40 text-xs mt-1">
              Week of {format(new Date(entry.week_start), 'MMM d')}
            </Text>
          </View>
          {isDeferred && (
            <View className="bg-[#ff8c00]/20 px-2 py-1 rounded-full">
              <Text className="text-[#ff8c00] text-xs font-bold">Shelved</Text>
            </View>
          )}
        </View>

        {isCreditor && (
          <View className="flex-row gap-2 mt-3">
            <Pressable
              onPress={() => handleStatusUpdate(entry.id, 'completed')}
              disabled={isUpdating}
              className="flex-1 flex-row items-center justify-center gap-1.5 bg-pastel-green/15 py-2.5 rounded-xl active:opacity-80"
            >
              <Check size={14} color={Colors.pastelGreen} />
              <Text className="text-pastel-green font-bold text-sm">
                {isUpdating ? '...' : 'Mark Paid'}
              </Text>
            </Pressable>
            {!isDeferred ? (
              <Pressable
                onPress={() => handleStatusUpdate(entry.id, 'deferred')}
                disabled={isUpdating}
                className="flex-1 flex-row items-center justify-center gap-1.5 bg-[#ff8c00]/15 py-2.5 rounded-xl active:opacity-80"
              >
                <Clock size={14} color="#ff8c00" />
                <Text className="text-[#ff8c00] font-bold text-sm">
                  {isUpdating ? '...' : 'Shelve'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => handleStatusUpdate(entry.id, 'pending')}
                disabled={isUpdating}
                className="flex-1 flex-row items-center justify-center gap-1.5 bg-white/10 py-2.5 rounded-xl active:opacity-80"
              >
                <Text className="text-white/80 font-bold text-sm">
                  {isUpdating ? '...' : 'Unshelve'}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  };

  const hasAnyWagers = iOwe.length > 0 || theyOwe.length > 0 || shelved.length > 0;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-6 pt-20 pb-32"
    >
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold text-pastel-pink">Wagers & Rules</Text>
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
        <View className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 mb-6 min-h-[200px] justify-center">
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
        <View className="bg-[#1A1A1A] p-6 rounded-[32px] border border-[#ff8c00]/20 min-h-[200px] justify-center mb-6">
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
              <Text className="text-3xl font-bold text-pastel-orange uppercase tracking-wide">
                {displayWager}
              </Text>
            )}
            <Text className="text-white/40 mt-4 leading-relaxed">
              Miss your weekly target? You owe this to your partner immediately.
            </Text>
          </View>
        </View>

        {/* Wager Balances */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-bold uppercase tracking-widest text-white/50">
              Wager Balances
            </Text>
            {partnerProfile && (
              <Pressable
                onPress={confirmAddPenalty}
                className="flex-row items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full active:opacity-80"
              >
                <Plus size={14} color="#fff" />
                <Text className="text-white text-xs font-bold">Add Penalty</Text>
              </Pressable>
            )}
          </View>

          {!hasAnyWagers ? (
            <View className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 items-center">
              <Text className="text-white/50 text-base font-medium">All clear — no penalties owed!</Text>
            </View>
          ) : (
            <View className="gap-4">
              {/* What partner owes you (you are creditor) */}
              {theyOwe.length > 0 && (
                <View>
                  <Text className="text-pastel-green font-bold text-sm mb-2 uppercase tracking-wide">
                    {partnerName} owes you ({theyOwe.length})
                  </Text>
                  {theyOwe.map((e) => renderEntry(e, true))}
                </View>
              )}

              {/* What you owe (you are debtor) */}
              {iOwe.length > 0 && (
                <View>
                  <Text className="text-pastel-pink font-bold text-sm mb-2 uppercase tracking-wide">
                    You owe {partnerName} ({iOwe.length})
                  </Text>
                  {iOwe.map((e) => renderEntry(e, false))}
                </View>
              )}

              {/* Shelved (deferred) — creditor or debtor */}
              {shelved.length > 0 && (
                <View>
                  <Text className="text-[#ff8c00] font-bold text-sm mb-2 uppercase tracking-wide">
                    Shelved for Later ({shelved.length})
                  </Text>
                  {shelved.map((e) => renderEntry(e, e.creditor_id === user?.id))}
                </View>
              )}
            </View>
          )}
        </View>
      </MotiView>
    </ScrollView>
  );
}
