interface ResultStepProps {
  onNext?: () => void;
}

export default function ResultStep({}: ResultStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
        Result
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
        See the battle result and hear the narration.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        The journey is complete! You can refresh to start again.
      </p>
    </div>
  );
}
