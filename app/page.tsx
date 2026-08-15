'use client';

import { useState } from 'react';
import { Dog } from '@/lib/dog';
import GenerateStep from './components/GenerateStep';
import MintStep from './components/MintStep';
import FightStep from './components/FightStep';
import ResultStep from './components/ResultStep';

type Step = 'generate' | 'mint' | 'fight' | 'result';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('generate');
  const [generatedDog, setGeneratedDog] = useState<Dog | null>(null);

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
        {currentStep === 'mint' && <MintStep onNext={handleNextStep} />}
        {currentStep === 'fight' && <FightStep onNext={handleNextStep} />}
        {currentStep === 'result' && <ResultStep onNext={handleNextStep} />}
      </main>
    </div>
  );
}
