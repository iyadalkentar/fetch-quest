'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog } from '@/lib/dog';
import { RaccoonStats } from '@/lib/raccoon';

interface BattleNarration {
  outcome: 'win' | 'lose';
  line: string | null;
  audioDataUri: string | null;
}

interface ResultStepProps {
  narration: BattleNarration | null;
  dog: Dog | null;
  raccoon: RaccoonStats;
  onNext?: () => void;
}

// AbortError fires whenever a play() request is superseded by a new
// load/play (e.g. a duplicate effect run, or the user clicking replay while
// autoplay was still starting up) — harmless, so don't log it as an error.
function logPlaybackError(message: string, err: unknown) {
  if (err instanceof DOMException && err.name === 'AbortError') return;
  console.error(message, err);
}

export default function ResultStep({
  narration,
  dog,
  raccoon,
  onNext,
}: ResultStepProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Tracks which data URI we've already started loading/playing, so a
  // duplicate effect run (e.g. React Strict Mode's dev double-invoke) with
  // the same URI doesn't reassign `src` mid-flight and abort the pending
  // play() request.
  const playedUriRef = useRef<string | null>(null);

  // Auto-play audio when audioDataUri becomes available
  useEffect(() => {
    const audio = audioRef.current;
    const uri = narration?.audioDataUri;
    if (!uri || !audio || playedUriRef.current === uri) return;

    playedUriRef.current = uri;
    audio.src = uri;
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        logPlaybackError('Failed to autoplay audio:', err);
      });
  }, [narration?.audioDataUri]);

  // Track audio play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          logPlaybackError('Failed to play audio:', err);
        });
      }
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        logPlaybackError('Failed to replay audio:', err);
      });
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-8 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 12 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Battle Result
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          The battle is complete!
        </p>
      </motion.div>

      {/* Outcome Badge */}
      <AnimatePresence>
        {narration && (
          <motion.div
            className={`w-full rounded-lg p-8 border shadow-lg ${
              narration.outcome === 'win'
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
            <div className="text-center space-y-2">
              <h2
                className={`text-4xl font-bold ${
                  narration.outcome === 'win'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {narration.outcome === 'win' ? '🎉 Victory!' : '😢 Defeated'}
              </h2>
              <p
                className={`text-lg ${
                  narration.outcome === 'win'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {narration.outcome === 'win'
                  ? 'Your dog won the battle!'
                  : 'The raccoon was too strong.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portrait Display */}
      {dog && (
        <motion.div
          className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 12,
            delay: 0.1,
          }}
        >
          <div className="flex flex-col items-center gap-4">
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
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {dog.personality}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Stats: Speed {dog.speed} | Bark {dog.bark} | Chomp {dog.chomp}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Outcome Line with Loading State */}
      <motion.div
        className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 12,
          delay: 0.15,
        }}
      >
        <AnimatePresence mode="wait">
          {narration?.line ? (
            <motion.div
              key="line-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <p className="text-center text-gray-800 dark:text-gray-100 text-lg leading-relaxed italic">
                "{narration.line}"
              </p>

              {/* Audio Player */}
              {narration.audioDataUri && (
                <motion.div
                  className="flex flex-col gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <audio
                    ref={audioRef}
                    className="hidden"
                    onError={(e) => {
                      console.error('Audio error:', e);
                    }}
                  />

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md active:scale-95"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={handleReplay}
                      className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors active:scale-95"
                      aria-label="Replay"
                    >
                      🔄
                    </button>
                  </div>

                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Narrated by ElevenLabs
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="line-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
                ✍️ Writing the story...
              </p>
              {/* Skeleton lines */}
              <div className="space-y-2">
                <motion.div
                  className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  style={{ width: '85%' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Completion Message */}
      <motion.div
        className="text-center text-sm text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <p>The journey is complete! You can refresh to start again.</p>
      </motion.div>
    </motion.div>
  );
}
