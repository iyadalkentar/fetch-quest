interface FightStepProps {
  onNext: () => void;
}

export default function FightStep({ onNext }: FightStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
        Fight
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
        Send your dog into battle against a raccoon.
      </p>
      <button
        onClick={onNext}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
