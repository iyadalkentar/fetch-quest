import { Connection, VersionedTransaction } from '@solana/web3.js';
import { Dog } from './dog';

export interface MintResult {
  mintAddress: string;
}

interface MintApiResponse {
  mintAddress: string;
  serializedTransaction: string;
  blockhash: string;
  lastValidBlockHeight: number;
}

interface MintApiErrorResponse {
  error?: string;
}

type SendTransactionFn = (
  transaction: VersionedTransaction,
  connection: Connection
) => Promise<string>;

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Requests an unsigned mint transaction from the server, has the connected
 * wallet sign and send it, then waits for on-chain confirmation.
 */
export async function mintDog(
  dog: Dog,
  ownerPublicKey: string,
  connection: Connection,
  sendTransaction: SendTransactionFn
): Promise<MintResult> {
  const response = await fetch('/api/mint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dog, ownerPublicKey }),
  });

  if (!response.ok) {
    const errorBody: MintApiErrorResponse = await response
      .json()
      .catch(() => ({}));
    throw new Error(errorBody.error ?? 'Failed to build mint transaction');
  }

  const { mintAddress, serializedTransaction, blockhash, lastValidBlockHeight } =
    (await response.json()) as MintApiResponse;

  const transaction = VersionedTransaction.deserialize(
    base64ToBytes(serializedTransaction)
  );

  const signature = await sendTransaction(transaction, connection);

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed'
  );

  return { mintAddress };
}
