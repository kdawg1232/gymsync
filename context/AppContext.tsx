import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { WorkoutLog } from '@/types';
import { INITIAL_LOGS } from '@/constants/demo-data';

interface AppState {
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  goal: number;
  setGoal: (v: number) => void;
  wager: string;
  setWager: (v: string) => void;
  logs: WorkoutLog[];
  setLogs: React.Dispatch<React.SetStateAction<WorkoutLog[]>>;
  addLog: (log: WorkoutLog) => void;
  myDebt: number;
  setMyDebt: (v: number) => void;
  partnerDebt: number;
  setPartnerDebt: (v: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState(false);
  const [goal, setGoal] = useState(3);
  const [wager, setWager] = useState('1 Coffee');
  const [logs, setLogs] = useState<WorkoutLog[]>(INITIAL_LOGS);
  const [myDebt, setMyDebt] = useState(2);
  const [partnerDebt, setPartnerDebt] = useState(1);

  const addLog = (log: WorkoutLog) => {
    setLogs((prev) => [log, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        onboarded,
        setOnboarded,
        goal,
        setGoal,
        wager,
        setWager,
        logs,
        setLogs,
        addLog,
        myDebt,
        setMyDebt,
        partnerDebt,
        setPartnerDebt,
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
