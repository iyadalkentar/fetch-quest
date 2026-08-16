import { Dog } from './dog';

export interface MintResult {
  mintAddress: string;
}

// STUB: not implemented. This must POST { dog, ownerPublicKey } to /api/mint,
// get back a serialized unsigned transaction, have the connected wallet sign
// and send it via wallet-adapter's sendTransaction, then await confirmation.
// Left as a stub because the actual mint-transaction construction (server side)
// and client sign/send flow needs Solana/Metaplex-Umi-specific implementation
// beyond this pass.
export async function mintDog(
  _dog: Dog, // eslint-disable-line @typescript-eslint/no-unused-vars
  _ownerPublicKey: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<MintResult> {
  throw new Error('NOT_IMPLEMENTED: mintDog stub — see lib/mint.ts');
}
