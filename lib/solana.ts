import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createGenericFile,
  createNoopSigner,
  generateSigner,
  keypairIdentity,
  none,
  percentAmount,
  publicKey as toUmiPublicKey,
  Umi,
} from '@metaplex-foundation/umi';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import bs58 from 'bs58';
import { Dog } from './dog';

const MINT_SYMBOL = 'FETCH';

let umi: Umi | null = null;

/**
 * SOLANA_MINT_AUTHORITY_SECRET may be a base58-encoded secret key (e.g. from
 * a wallet export) or a JSON array of bytes (e.g. from `solana-keygen new`).
 */
function parseMintAuthoritySecretKey(secret: string): Uint8Array {
  const trimmed = secret.trim();
  if (trimmed.startsWith('[')) {
    return new Uint8Array(JSON.parse(trimmed));
  }
  return bs58.decode(trimmed);
}

/**
 * Lazily-created Umi client, identified as the server's mint-authority
 * keypair. This identity only ever pays for/authorizes the Arweave upload —
 * it never signs the mint transaction itself, and never becomes the NFT's
 * owner or update authority (see requirements.md).
 */
export function getUmi(): Umi {
  if (umi) return umi;

  // Server-side reads NEXT_PUBLIC_SOLANA_RPC_URL too since it's the same
  // devnet endpoint the client already uses — no need for a second var.
  const rpcUrl = process.env.SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (!rpcUrl) {
    throw new Error(
      'SOLANA_RPC_URL or NEXT_PUBLIC_SOLANA_RPC_URL must be set'
    );
  }

  const secret = process.env.SOLANA_MINT_AUTHORITY_SECRET;
  if (!secret) {
    throw new Error('SOLANA_MINT_AUTHORITY_SECRET is not set');
  }

  const instance = createUmi(rpcUrl).use(mplTokenMetadata()).use(irysUploader());

  const secretKey = parseMintAuthoritySecretKey(secret);
  const keypair = instance.eddsa.createKeypairFromSecretKey(secretKey);
  instance.use(keypairIdentity(keypair));

  umi = instance;
  return umi;
}

function decodeDataUri(dataUri: string): { bytes: Uint8Array; contentType: string } {
  const match = dataUri.match(/^data:([^;,]+)(;base64)?,([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid data URI for dog portrait');
  }

  const [, contentType, isBase64, data] = match;
  if (isBase64) {
    return { bytes: Buffer.from(data, 'base64'), contentType };
  }
  return { bytes: Buffer.from(decodeURIComponent(data), 'utf-8'), contentType };
}

export interface UploadedDogAssets {
  metadataUri: string;
}

/**
 * Uploads the dog's portrait and a Metaplex-standard metadata JSON
 * (referencing the uploaded image) to Arweave via Umi's Irys uploader.
 */
export async function uploadDogAssets(
  dog: Dog,
  mintAddress: string
): Promise<UploadedDogAssets> {
  const instance = getUmi();

  const { bytes, contentType } = decodeDataUri(dog.portraitUrl);
  const extension = (contentType.split('/')[1] ?? 'png').split('+')[0];
  const imageFile = createGenericFile(bytes, `${mintAddress}.${extension}`, {
    contentType,
  });

  const [imageUri] = await instance.uploader.upload([imageFile]);

  const metadataUri = await instance.uploader.uploadJson({
    name: `FetchQuest Dog (${dog.personality})`,
    symbol: MINT_SYMBOL,
    description: dog.bio,
    image: imageUri,
    attributes: [
      { trait_type: 'Speed', value: dog.speed },
      { trait_type: 'Bark', value: dog.bark },
      { trait_type: 'Chomp', value: dog.chomp },
      { trait_type: 'Personality', value: dog.personality },
    ],
  });

  return { metadataUri };
}

export interface BuildMintTransactionResult {
  mintAddress: string;
  serializedTransaction: string;
  blockhash: string;
  lastValidBlockHeight: number;
}

/**
 * Builds an unsigned mint transaction for the given dog, fee-paid, owned,
 * and authorized entirely by `ownerPublicKey` (the connected wallet). Only
 * the new mint account's own keypair is pre-signed server-side (required to
 * create that account at all); the wallet signs everything else client-side.
 */
export async function buildMintTransaction(
  dog: Dog,
  ownerPublicKey: string
): Promise<BuildMintTransactionResult> {
  const instance = getUmi();
  const owner = toUmiPublicKey(ownerPublicKey);
  const ownerSigner = createNoopSigner(owner);

  const mintSigner = generateSigner(instance);
  const { metadataUri } = await uploadDogAssets(dog, mintSigner.publicKey.toString());

  // Fetch the blockhash as late as possible (right before build) to keep
  // its ~60-90s validity window from expiring before the client signs+sends.
  const latestBlockhash = await instance.rpc.getLatestBlockhash();

  const builder = createNft(instance, {
    mint: mintSigner,
    name: `FetchQuest Dog (${dog.personality})`,
    symbol: MINT_SYMBOL,
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(0),
    // createNft passes this same `authority` to both the create AND mint
    // instructions internally. mintV1 specifically requires authority's
    // pubkey to equal updateAuthority ("Update Authority given does not
    // match" otherwise) — so authority must be the wallet, not the server
    // identity. The server's mint-authority keypair is never involved in
    // signing the mint transaction itself, only in paying for the Arweave
    // upload (see uploadDogAssets/getUmi).
    authority: ownerSigner,
    payer: ownerSigner,
    updateAuthority: owner,
    tokenOwner: owner,
    // No royalty/creator logic needed for this devnet demo (requirements.md).
    // Must be an explicit `none()`, not null/undefined/[]:
    //   - null/undefined are falsy, so createV1's `if (!resolvedArgs.creators)`
    //     default-value resolver overwrites them with a creator entry
    //     verified:true for the `authority` signer — which the Token
    //     Metadata program then rejects on-chain ("You cannot unilaterally
    //     verify another creator, they must sign", error 0x36).
    //   - a raw [] is truthy (bypasses that default) but gets serialized as
    //     Some([]), which the program also rejects ("Creators must be at
    //     least one if set", error 0x25).
    // none() is a truthy Option object that serializes to a real None,
    // avoiding both.
    creators: none(),
  })
    .useV0()
    .setFeePayer(ownerSigner)
    .setBlockhash(latestBlockhash);

  const transaction = await builder.buildAndSign(instance);
  const serialized = instance.transactions.serialize(transaction);

  return {
    mintAddress: mintSigner.publicKey.toString(),
    serializedTransaction: Buffer.from(serialized).toString('base64'),
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  };
}
