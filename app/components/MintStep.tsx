interface MintStepProps {
  onNext: () => void;
}

export default function MintStep({ onNext }: MintStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
        Mint
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
        Mint your dog as an NFT on Solana devnet.
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
