'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog } from '@/lib/dog';
import { RaccoonStats } from '@/lib/raccoon';
import { resolveBattle, BattleResult } from '@/lib/battle';

interface NarrationResult {
  line: string;
  audioDataUri: string | null;
}

interface FightStepProps {
  dog: Dog | null;
  raccoon: RaccoonStats;
  onNext: () => void;
  onBattleResolved: (outcome: 'win' | 'lose') => void;
  onNarrationReady?: (result: NarrationResult) => void;
}

type FightPhase = 'idle' | 'charging' | 'clash' | 'stats' | 'outcome';

export default function FightStep({
  dog,
  raccoon,
  onNext,
  onBattleResolved,
  onNarrationReady,
}: FightStepProps) {
  const [phase, setPhase] = useState<FightPhase>('idle');
  const [result, setResult] = useState<BattleResult | null>(null);
  const [fightStarted, setFightStarted] = useState(false);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  // Handle the fight start
  const handleFightClick = () => {
    if (!dog) return;

    setFightStarted(true);
    const battleResult = resolveBattle(dog, raccoon);
    setResult(battleResult);
    setPhase('charging');

    // Fire the narration request without awaiting — this should not block animation
    void (async () => {
      const GENERIC_FALLBACK = `The battle is over. Your dog ${battleResult.outcome === 'win' ? 'won' : 'lost'}!`;
      try {
        const response = await fetch('/api/battle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dog: {
              speed: dog.speed,
              bark: dog.bark,
              chomp: dog.chomp,
              personality: dog.personality,
            },
            raccoon,
            outcome: battleResult.outcome,
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = (await response.json()) as { line: string; audioDataUri: string | null };
        onNarrationReady?.(data);
      } catch (error) {
        console.error('Failed to fetch narration:', error);
        // Use client-side fallback on fetch-level failure
        onNarrationReady?.({
          line: GENERIC_FALLBACK,
          audioDataUri: null,
        });
      }
    })();
  };

  // Progress through animation phases
  useEffect(() => {
    if (!fightStarted || !result) return;

    if (phase === 'charging') {
      // After charge-in animation, move to clash
      const timer = setTimeout(() => setPhase('clash'), 800);
      return () => clearTimeout(timer);
    }

    if (phase === 'clash') {
      // After clash, move to stats
      const timer = setTimeout(() => {
        setPhase('stats');
        setCurrentStatIndex(0);
      }, 500);
      return () => clearTimeout(timer);
    }

    if (phase === 'stats') {
      // Reveal each stat one by one, then move to outcome
      if (currentStatIndex < 3) {
        const timer = setTimeout(() => {
          setCurrentStatIndex(currentStatIndex + 1);
        }, 600);
        return () => clearTimeout(timer);
      } else {
        // All stats revealed, move to outcome
        const timer = setTimeout(() => setPhase('outcome'), 400);
        return () => clearTimeout(timer);
      }
    }

    if (phase === 'outcome') {
      // Outcome is displayed, call the callback
      onBattleResolved(result.outcome);
    }
  }, [phase, fightStarted, result, currentStatIndex, onBattleResolved]);

  // Handle null dog
  if (!dog) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
          Fight
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
          No dog to fight with. Please generate a dog first.
        </p>
      </div>
    );
  }

  // Pre-fight state
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 12 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Battle Time
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your dog vs. the Feral Raccoon
          </p>
        </motion.div>

        {/* Portrait display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 12,
            delay: 0.2,
          }}
          className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-2 gap-8">
            {/* Dog */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Your Dog
              </p>
              <div className="w-full flex justify-center">
                <Image
                  src={dog.portraitUrl}
                  alt={`${dog.personality} dog`}
                  width={140}
                  height={140}
                  unoptimized
                  className="rounded-lg object-cover shadow-md border-2 border-blue-200 dark:border-blue-700"
                />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {dog.personality}
              </p>
            </div>

            {/* Raccoon */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Opponent
              </p>
              <div className="w-full flex justify-center">
                <Image
                  src={raccoon.portraitUrl}
                  alt="Feral Raccoon"
                  width={140}
                  height={140}
                  unoptimized
                  className="rounded-lg object-cover shadow-md border-2 border-orange-200 dark:border-orange-700"
                />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {raccoon.label}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Fight button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 12,
            delay: 0.4,
          }}
          onClick={handleFightClick}
          disabled={fightStarted}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
        >
          Fight!
        </motion.button>
      </div>
    );
  }

  // Fight animation sequence
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-8 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Battle arena */}
      <div className="w-full bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 min-h-64 flex items-center justify-center relative overflow-hidden">
        {/* Dog portrait - charges in from left */}
        <motion.div
          className="absolute left-8 top-1/2 transform -translate-y-1/2"
          initial={{ x: -150, opacity: 0 }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          transition={{ duration: 0.6, type: 'tween', ease: 'easeOut' }}
        >
          <Image
            src={dog.portraitUrl}
            alt={`${dog.personality} dog`}
            width={120}
            height={120}
            unoptimized
            className="rounded-lg object-cover shadow-lg border-2 border-blue-300 dark:border-blue-600"
          />
        </motion.div>

        {/* Raccoon portrait - charges in from right */}
        <motion.div
          className="absolute right-8 top-1/2 transform -translate-y-1/2"
          initial={{ x: 150, opacity: 0 }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          transition={{ duration: 0.6, type: 'tween', ease: 'easeOut' }}
        >
          <Image
            src={raccoon.portraitUrl}
            alt="Feral Raccoon"
            width={120}
            height={120}
            unoptimized
            className="rounded-lg object-cover shadow-lg border-2 border-orange-300 dark:border-orange-600"
          />
        </motion.div>

        {/* Clash effect - appears when they meet */}
        <AnimatePresence>
          {(phase === 'clash' || phase === 'stats' || phase === 'outcome') && (
            <motion.div
              className="absolute inset-0 bg-white/30 dark:bg-white/10 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* Impact star burst */}
        <AnimatePresence>
          {(phase === 'clash' || phase === 'stats' || phase === 'outcome') && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-6xl">⚡</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stat comparisons - revealed one at a time */}
      <AnimatePresence mode="wait">
        {phase === 'stats' && result && (
          <motion.div
            className="w-full space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Speed */}
            {currentStatIndex >= 0 && (
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Speed
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {dog.speed}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your Dog
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">
                      vs
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {raccoon.speed}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Raccoon
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      result.statDeltas.speed > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {result.statDeltas.speed > 0 ? '+' : ''}
                    {result.statDeltas.speed}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bark */}
            {currentStatIndex >= 1 && (
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Bark
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {dog.bark}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your Dog
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">
                      vs
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {raccoon.bark}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Raccoon
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      result.statDeltas.bark > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {result.statDeltas.bark > 0 ? '+' : ''}
                    {result.statDeltas.bark}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Chomp */}
            {currentStatIndex >= 2 && (
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Chomp
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {dog.chomp}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your Dog
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-gray-400 dark:text-gray-600">
                      vs
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {raccoon.chomp}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Raccoon
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      result.statDeltas.chomp > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {result.statDeltas.chomp > 0 ? '+' : ''}
                    {result.statDeltas.chomp}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outcome banner */}
      <AnimatePresence>
        {phase === 'outcome' && result && (
          <motion.div
            className={`w-full rounded-lg p-8 border shadow-lg ${
              result.outcome === 'win'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 12,
            }}
          >
            <div className="text-center space-y-4">
              <h2
                className={`text-4xl font-bold ${
                  result.outcome === 'win'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {result.outcome === 'win' ? '🎉 Victory!' : '😢 Defeated'}
              </h2>
              <p
                className={`text-lg ${
                  result.outcome === 'win'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {result.outcome === 'win'
                  ? 'Your dog won the battle!'
                  : 'The raccoon was too strong.'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Final Advantage: {result.total > 0 ? '+' : ''}{result.total}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button - only appears after outcome */}
      <AnimatePresence>
        {phase === 'outcome' && (
          <motion.button
            onClick={onNext}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 12,
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Next
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
