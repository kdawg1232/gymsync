import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { ChevronLeft } from 'lucide-react-native';

import { Step0 } from './Step0';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import { Step4 } from './Step4';
import { Step5 } from './Step5';
import { Step6 } from './Step6';
import { Step7 } from './Step7';
import { Step8 } from './Step8';
import { Step9 } from './Step9';
import { Step10 } from './Step10';
import { Step11 } from './Step11';
import { StepCreateAccount } from './StepCreateAccount';
import { Step12 } from './Step12';
import { Step13 } from './Step13';

const TOTAL_STEPS = 14;

interface Props {
  onComplete: () => void;
  onSignIn: () => void;
  goal: number;
  setGoal: (v: number) => void;
  wager: string;
  setWager: (v: string) => void;
  name: string;
  setName: (v: string) => void;
}

export function OnboardingFlow({
  onComplete,
  onSignIn,
  goal,
  setGoal,
  wager,
  setWager,
  name,
  setName,
}: Props) {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else onComplete();
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const progress = (step / TOTAL_STEPS) * 100;

  function renderStep() {
    switch (step) {
      case 0:
        return <Step0 nextStep={nextStep} onSignIn={onSignIn} />;
      case 1:
        return <Step1 nextStep={nextStep} />;
      case 2:
        return <Step2 nextStep={nextStep} />;
      case 3:
        return <Step3 nextStep={nextStep} />;
      case 4:
        return <Step4 nextStep={nextStep} />;
      case 5:
        return <Step5 nextStep={nextStep} />;
      case 6:
        return <Step6 nextStep={nextStep} goal={goal} setGoal={setGoal} />;
      case 7:
        return <Step7 nextStep={nextStep} />;
      case 8:
        return <Step8 nextStep={nextStep} wager={wager} setWager={setWager} />;
      case 9:
        return <Step9 nextStep={nextStep} name={name} setName={setName} />;
      case 10:
        return <Step10 nextStep={nextStep} />;
      case 11:
        return <Step11 nextStep={nextStep} />;
      case 12:
        return <StepCreateAccount nextStep={nextStep} />;
      case 13:
        return <Step12 nextStep={nextStep} />;
      case 14:
        return <Step13 onComplete={onComplete} />;
      default:
        return null;
    }
  }

  return (
    <View className="absolute inset-0 z-50 bg-[#0A0A0A] items-center">
      {step > 0 && (
        <View className="w-full max-w-sm flex-row items-center gap-4 pt-14 px-6">
          <Pressable onPress={prevStep} className="p-2 -ml-2">
            <ChevronLeft size={24} color="rgba(255,255,255,0.6)" />
          </Pressable>
          <View className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <MotiView
              animate={{ width: `${progress}%` }}
              transition={{ type: 'timing', duration: 300 }}
              className="h-full bg-pastel-orange rounded-full"
              style={{ width: '0%' }}
            />
          </View>
        </View>
      )}

      <View className="flex-1 w-full overflow-hidden relative">
        <AnimatePresence exitBeforeEnter>
          <MotiView
            key={step}
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -20 }}
            transition={{ type: 'timing', duration: 250 }}
            className="flex-1 w-full px-6"
          >
            {renderStep()}
          </MotiView>
        </AnimatePresence>
      </View>
    </View>
  );
}
