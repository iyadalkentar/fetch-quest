'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { Dog } from '@/lib/dog';
import { mintDog } from '@/lib/mint';

interface MintStepProps {
  dog: Dog | null;
  onNext: () => void;
}

type MintState = 'idle' | 'pending' | 'confirming' | 'minted' | 'error';

const MIN_SOL_TO_MINT = 0.05;
const AIRDROP_AMOUNT = 1; // 1 SOL

export default function MintStep({ dog, onNext }: MintStepProps) {
  const { connection } = useConnection();
  const { wallet, publicKey, connected, connecting, connect, sendTransaction } =
    useWallet();
  const { visible: walletModalVisible, setVisible: setWalletModalVisible } =
    useWalletModal();

  // The wallet-adapter modal only *selects* a wallet on click; it never calls
  // connect() itself (that only happens automatically when autoConnect is on,
  // which we deliberately keep off). This flag makes sure we only auto-connect
  // right after the user explicitly opened the modal this session — not just
  // because a wallet name persisted in localStorage from a prior visit.
  const hasRequestedConnectRef = useRef(false);
  const wasModalVisibleRef = useRef(false);
  const [walletConnectError, setWalletConnectError] = useState<string | null>(
    null
  );

  const openWalletModal = () => {
    hasRequestedConnectRef.current = true;
    setWalletConnectError(null);
    setWalletModalVisible(true);
  };

  useEffect(() => {
    // Trigger on the modal's visible:true -> false transition rather than on
    // `wallet` changing: re-selecting an already-selected wallet (e.g. one
    // persisted in localStorage from a prior visit) is a no-op in
    // wallet-adapter-react's own selection logic, so `wallet`'s reference
    // never changes even though the modal did close after a real click.
    const wasVisible = wasModalVisibleRef.current;
    wasModalVisibleRef.current = walletModalVisible;
    if (!wasVisible || walletModalVisible) return;

    if (!hasRequestedConnectRef.current) return;
    hasRequestedConnectRef.current = false;

    if (!wallet || connected || connecting) return;

    const run = async () => {
      // A freshly-created adapter can already report `connected: true` if
      // the wallet extension (e.g. Phantom via the Wallet Standard) has
      // persisted trust for this origin from an earlier session — before
      // our React state has ever seen this adapter instance's 'connect'
      // event. wallet-adapter-react's connect() silently no-ops in that
      // case (it only updates state in response to a genuine 'connect'
      // event), leaving our UI stuck showing "not connected" forever.
      // Forcing a disconnect first guarantees connect() actually runs.
      if (wallet.adapter.connected) {
        await wallet.adapter.disconnect().catch(() => {});
      }
      await connect();
    };

    run().catch((err) => {
      console.error('Wallet connect failed:', err);
      setWalletConnectError(
        err instanceof Error ? err.message : 'Failed to connect wallet'
      );
    });
  }, [walletModalVisible, wallet, connected, connecting, connect]);

  const [balance, setBalance] = useState<number | null>(null);
  const [state, setState] = useState<MintState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [isAirdropInFlight, setIsAirdropInFlight] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, [publicKey, connection]);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection, fetchBalance]);

  const requestAirdrop = async () => {
    if (!publicKey) return;
    setIsAirdropInFlight(true);
    setError(null);

    try {
      await connection.requestAirdrop(
        publicKey,
        AIRDROP_AMOUNT * LAMPORTS_PER_SOL
      );

      // Poll for balance update
      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 1500; // 1.5 seconds

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        const newBalance = await connection.getBalance(publicKey);
        const newBalanceSOL = newBalance / LAMPORTS_PER_SOL;
        setBalance(newBalanceSOL);

        if (newBalanceSOL >= MIN_SOL_TO_MINT) {
          setIsAirdropInFlight(false);
          return;
        }

        attempts++;
      }

      // Timeout
      setError(
        'Airdrop timeout. Visit https://faucet.solana.com to request SOL.'
      );
      setIsAirdropInFlight(false);
    } catch (err) {
      console.error('Airdrop failed:', err);
      setError(
        'Airdrop failed. Visit https://faucet.solana.com to request SOL.'
      );
      setIsAirdropInFlight(false);
    }
  };

  const handleMint = async () => {
    if (!publicKey || !dog) return;

    setState('pending');
    setError(null);

    try {
      // Once lib/mint.ts has a real implementation with a submit->confirm flow,
      // call setState('confirming') here after the transaction is submitted but before confirmation
      const result = await mintDog(
        dog,
        publicKey.toString(),
        connection,
        sendTransaction
      );
      setMintAddress(result.mintAddress);
      setState('minted');
    } catch (err) {
      console.error('Mint failed:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to mint dog';
      setError(errorMessage);
      setState('error');
    }
  };

  const handleRetry = () => {
    setState('idle');
    setError(null);
    setMintAddress(null);
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

  // Not connected state
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
          Mint
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">
          Mint your dog as an NFT on Solana devnet.
        </p>
        {walletConnectError && (
          <div className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ {walletConnectError}
            </p>
          </div>
        )}
        <button
          onClick={openWalletModal}
          disabled={connecting}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {connecting ? (
            <>
              <span className="inline-block animate-spin">⌛</span>
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
        <button
          onClick={onNext}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline transition-colors"
        >
          Skip minting for now
        </button>
      </div>
    );
  }

  // Connected state - show wallet info
  const truncatedPublicKey = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  const balanceKnown = balance !== null;
  const insufficientBalance = balance !== null && balance < MIN_SOL_TO_MINT;

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
          Mint Your Dog
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Create an NFT on Solana devnet
        </p>
      </motion.div>

      {/* Wallet Info Card */}
      <motion.div
        variants={itemVariants}
        className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Wallet
            </p>
            <p className="text-lg font-mono text-gray-900 dark:text-gray-100">
              {truncatedPublicKey}
            </p>
          </div>
          {balanceKnown ? (
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Balance
              </p>
              <p className="text-lg font-mono text-gray-900 dark:text-gray-100">
                {balance.toFixed(4)} SOL
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Balance
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Checking balance...
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error Banner */}
      {error && state === 'error' && (
        <motion.div
          variants={itemVariants}
          className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg"
        >
          <div className="space-y-2">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ {error}
            </p>
            {error.includes('faucet.solana.com') && (
              <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-700 dark:text-red-300 hover:underline inline-block"
              >
                Request devnet SOL →
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Low Balance Banner */}
      {insufficientBalance && state !== 'error' && (
        <motion.div
          variants={itemVariants}
          className="w-full px-4 py-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg"
        >
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Insufficient SOL. Need at least {MIN_SOL_TO_MINT} SOL to mint.
          </p>
        </motion.div>
      )}

      {/* Minted State */}
      {state === 'minted' && mintAddress && (
        <motion.div
          variants={itemVariants}
          className="w-full bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700"
        >
          <div className="space-y-4">
            <p className="text-center text-green-800 dark:text-green-200 font-semibold">
              ✅ Successfully minted!
            </p>
            <div className="bg-white dark:bg-gray-800 rounded p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Mint Address
              </p>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                {mintAddress}
              </p>
            </div>
            <a
              href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-700 dark:text-green-300 hover:underline block text-center"
            >
              View on Solana Explorer →
            </a>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="w-full flex flex-col gap-3 sm:flex-row sm:justify-center"
      >
        {/* Request Airdrop Button */}
        {balanceKnown && insufficientBalance && state !== 'error' && (
          <button
            onClick={requestAirdrop}
            disabled={isAirdropInFlight}
            className="flex-1 sm:flex-none px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isAirdropInFlight ? (
              <>
                <span className="inline-block animate-spin">⌛</span>
                Requesting SOL...
              </>
            ) : (
              'Request Devnet SOL'
            )}
          </button>
        )}

        {/* Mint Button */}
        {state !== 'minted' && state !== 'error' && (
          <button
            onClick={handleMint}
            disabled={!balanceKnown || insufficientBalance || isAirdropInFlight || state === 'pending' || state === 'confirming' || !dog}
            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {state === 'pending' || state === 'confirming' ? (
              <>
                <span className="inline-block animate-spin">⌛</span>
                {state === 'pending' ? 'Minting...' : 'Confirming...'}
              </>
            ) : (
              'Mint Dog'
            )}
          </button>
        )}

        {/* Retry Button (Error State) */}
        {state === 'error' && (
          <button
            onClick={handleRetry}
            className="flex-1 sm:flex-none px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        )}

        {/* Next Button (Minted State) */}
        {state === 'minted' && (
          <button
            onClick={onNext}
            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        )}
      </motion.div>

      {/* Skip Link */}
      {state !== 'minted' && state !== 'pending' && state !== 'confirming' && (
        <motion.button
          variants={itemVariants}
          onClick={onNext}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline transition-colors"
        >
          Skip minting for now
        </motion.button>
      )}
    </motion.div>
  );
}
