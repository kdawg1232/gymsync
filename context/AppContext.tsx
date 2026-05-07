import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getProfile, getActivePact } from '@/lib/database';
import { updateWidgetData, clearWidgetData } from '@/lib/widget';
import type { Profile, Pact } from '@/types';

interface AppState {
  // Auth
  session: Session | null;
  user: Session['user'] | null;
  authLoading: boolean;
  profileLoading: boolean;

  // Profile
  profile: Profile | null;
  partnerProfile: Profile | null;

  // Pact
  pact: Pact | null;

  // Convenience getters
  goal: number;
  wager: string;
  myDebt: number;
  partnerDebt: number;
  partnerName: string;

  // Onboarding local state (used before data is persisted)
  onboardingGoal: number;
  setOnboardingGoal: (v: number) => void;
  onboardingWager: string;
  setOnboardingWager: (v: string) => void;
  onboardingName: string;
  setOnboardingName: (v: string) => void;
  onboardingAvatarUri: string | null;
  setOnboardingAvatarUri: (v: string | null) => void;

  // Refresh functions
  refreshProfile: () => Promise<void>;
  refreshPact: () => Promise<void>;

  // Sign out
  handleSignOut: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [pact, setPact] = useState<Pact | null>(null);

  // Onboarding local state
  const [onboardingGoal, setOnboardingGoal] = useState(3);
  const [onboardingWager, setOnboardingWager] = useState('1 Coffee');
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingAvatarUri, setOnboardingAvatarUri] = useState<string | null>(null);

  const user = session?.user ?? null;

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const p = await getProfile(user.id);
      setProfile(p);
      if (p?.partner_id) {
        const partner = await getProfile(p.partner_id);
        setPartnerProfile(partner);
      } else {
        setPartnerProfile(null);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  const refreshPact = useCallback(async () => {
    if (!user) return;
    try {
      const p = await getActivePact(user.id);
      setPact(p);
    } catch (e) {
      console.error('Error fetching pact:', e);
    }
  }, [user]);

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load profile & pact when user changes
  useEffect(() => {
    if (user) {
      refreshProfile();
      refreshPact();
    } else {
      setProfile(null);
      setPartnerProfile(null);
      setPact(null);
      setProfileLoading(false);
    }
  }, [user, refreshProfile, refreshPact]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`app-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        () => refreshProfile(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pacts' },
        () => refreshPact(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshProfile, refreshPact]);

  const isUser1 = pact ? pact.user1_id === user?.id : true;

  // Sync widget data whenever pact/profile changes
  useEffect(() => {
    if (!profile || !pact) return;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    updateWidgetData({
      myCount: 0,
      partnerCount: 0,
      goal: pact.goal,
      myName: profile.name,
      partnerName: partnerProfile?.name ?? 'Partner',
      wager: pact.wager,
      daysLeft,
      streak: 0,
      lastUpdated: now.toISOString(),
    });
  }, [profile, partnerProfile, pact]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setPartnerProfile(null);
    setPact(null);
    setOnboardingGoal(3);
    setOnboardingWager('1 Coffee');
    setOnboardingName('');
    setOnboardingAvatarUri(null);
    clearWidgetData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        session,
        user,
        authLoading,
        profileLoading,
        profile,
        partnerProfile,
        pact,
        goal: pact?.goal ?? onboardingGoal,
        wager: pact?.wager ?? onboardingWager,
        myDebt: pact ? (isUser1 ? pact.user1_debt : pact.user2_debt) : 0,
        partnerDebt: pact ? (isUser1 ? pact.user2_debt : pact.user1_debt) : 0,
        partnerName: partnerProfile?.name ?? 'Partner',
        onboardingGoal,
        setOnboardingGoal,
        onboardingWager,
        setOnboardingWager,
        onboardingName,
        setOnboardingName,
        onboardingAvatarUri,
        setOnboardingAvatarUri,
        refreshProfile,
        refreshPact,
        handleSignOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
