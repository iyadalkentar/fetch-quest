'use client';

import { motion } from 'framer-motion';

const STEPS = [
  { key: 'generate', label: 'Generate' },
  { key: 'mint', label: 'Mint' },
  { key: 'fight', label: 'Fight' },
  { key: 'result', label: 'Result' },
] as const;

export type StepKey = (typeof STEPS)[number]['key'];

interface StepIndicatorProps {
  currentStep: StepKey;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 w-full">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className={`w-2.5 h-2.5 rounded-full ${
                  isCurrent
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : isComplete
                      ? 'bg-purple-500 dark:bg-purple-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                }`}
                animate={{ scale: isCurrent ? 1.4 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isCurrent
                    ? 'text-blue-600 dark:text-blue-400'
                    : isComplete
                      ? 'text-purple-500 dark:text-purple-400'
                      : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 rounded-full transition-colors duration-300 ${
                  isComplete
                    ? 'bg-purple-500 dark:bg-purple-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
