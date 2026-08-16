'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Dog } from '@/lib/dog';
import { RACCOON } from '@/lib/raccoon';
import GenerateStep from './components/GenerateStep';
import MintStep from './components/MintStep';
import FightStep from './components/FightStep';
import ResultStep from './components/ResultStep';

// Loaded on demand: the wallet-adapter bundle is only needed once the user
// reaches Mint, not on first paint of the Generate step.
const WalletContextProvider = dynamic(
  () => import('./components/WalletContextProvider'),
  { ssr: false }
);

type Step = 'generate' | 'mint' | 'fight' | 'result';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('generate');
  const [generatedDog, setGeneratedDog] = useState<Dog | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [battleOutcome, setBattleOutcome] = useState<'win' | 'lose' | null>(
    null
  );

  const handleNextStep = () => {
    if (currentStep === 'generate') setCurrentStep('mint');
    else if (currentStep === 'mint') setCurrentStep('fight');
    else if (currentStep === 'fight') setCurrentStep('result');
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center justify-center w-full max-w-2xl px-4 py-12">
        {currentStep === 'generate' && (
          <GenerateStep
            onNext={handleNextStep}
            onDogGenerated={setGeneratedDog}
          />
        )}
        {currentStep === 'mint' && (
          <WalletContextProvider>
            <MintStep onNext={handleNextStep} dog={generatedDog} />
          </WalletContextProvider>
        )}
        {currentStep === 'fight' && (
          <FightStep
            dog={generatedDog}
            raccoon={RACCOON}
            onNext={handleNextStep}
            onBattleResolved={setBattleOutcome}
          />
        )}
        {currentStep === 'result' && <ResultStep onNext={handleNextStep} />}
      </main>
    </div>
  );
}
