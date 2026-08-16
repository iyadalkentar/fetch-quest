'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Dog } from '@/lib/dog';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Banner } from './ui/Banner';

interface GenerateStepProps {
  onNext: () => void;
  onDogGenerated: (dog: Dog) => void;
}

export default function GenerateStep({
  onNext,
  onDogGenerated,
}: GenerateStepProps) {
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDog = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-dog', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const generatedDog: Dog = await response.json();
      setDog(generatedDog);
      onDogGenerated(generatedDog);
    } catch (error) {
      console.error('Failed to generate dog:', error);
      // Show an error message but keep the currently displayed dog (if any)
      setError('Something went wrong generating your dog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  if (!dog) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
          Generate
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
          Generate a unique dog with random stats and personality.
        </p>
        {error && (
          <Banner variant="error">
            <p>❌ {error}</p>
          </Banner>
        )}
        <Button onClick={generateDog} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block animate-spin">⌛</span>
              Generating...
            </span>
          ) : (
            'Generate'
          )}
        </Button>

        {/* Skeleton of the stats/portrait/bio layout, shown while the first
            generation is in flight so the wait feels shorter. */}
        {loading && (
          <motion.div
            className="w-full flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full space-y-4">
              <motion.div
                className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-10 bg-gray-200 dark:bg-gray-700 rounded"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </Card>
            <motion.div
              className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div
              className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-8 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Your Dog
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Meet your new companion!
        </p>
      </motion.div>

      {/* Failure Notice */}
      {dog.generationFailed && (
        <motion.div variants={itemVariants} className="w-full">
          <Banner variant="warning">
            <p>
              ⚠️ AI generation unavailable — showing a placeholder. Want to retry?
            </p>
          </Banner>
        </motion.div>
      )}

      {/* Error Banner */}
      {error && (
        <motion.div variants={itemVariants} className="w-full">
          <Banner variant="error">
            <p>❌ {error}</p>
          </Banner>
        </motion.div>
      )}

      {/* Stats Card */}
      <motion.div variants={itemVariants} className="w-full">
        <Card>
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Personality
          </p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {dog.personality}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Speed
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {dog.speed}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Bark
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {dog.bark}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
              Chomp
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {dog.chomp}
            </p>
          </div>
        </div>
        </Card>
      </motion.div>

      {/* Portrait Image */}
      <motion.div
        variants={itemVariants}
        className="w-full flex justify-center"
      >
        <Image
          src={dog.portraitUrl}
          alt={`${dog.personality} dog`}
          width={192}
          height={192}
          unoptimized
          className="rounded-lg object-cover shadow-lg border-4 border-gray-200 dark:border-gray-700"
        />
      </motion.div>

      {/* Bio/Taunt */}
      <motion.div variants={itemVariants} className="w-full">
        <Card variant="purple">
          <p className="text-center text-gray-700 dark:text-gray-300 italic">
            &quot;{dog.bio}&quot;
          </p>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="w-full flex flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <Button
          onClick={generateDog}
          disabled={loading}
          variant="secondary"
          className="flex-1 sm:flex-none"
        >
          {loading ? 'Generating...' : 'Generate Another'}
        </Button>

        {dog.generationFailed && (
          <Button
            onClick={generateDog}
            disabled={loading}
            variant="warning"
            className="flex-1 sm:flex-none"
          >
            {loading ? 'Retrying...' : 'Retry'}
          </Button>
        )}

        <Button onClick={onNext} className="flex-1 sm:flex-none">
          Next
        </Button>
      </motion.div>
    </motion.div>
  );
}
