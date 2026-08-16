import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { buildMintTransaction } from '@/lib/solana';
import { Dog } from '@/lib/dog';

interface MintRequestBody {
  dog: Dog;
  ownerPublicKey: string;
}

export async function POST(request: Request) {
  let body: Partial<MintRequestBody>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { dog, ownerPublicKey } = body;

  if (!dog || typeof ownerPublicKey !== 'string' || !ownerPublicKey) {
    return NextResponse.json(
      { error: 'Missing dog or ownerPublicKey' },
      { status: 400 }
    );
  }

  try {
    // Validates the address, discarding the instance
    void new PublicKey(ownerPublicKey);
  } catch {
    return NextResponse.json(
      { error: 'ownerPublicKey is not a valid Solana public key' },
      { status: 400 }
    );
  }

  try {
    const result = await buildMintTransaction(dog, ownerPublicKey);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/mint:', error);
    return NextResponse.json(
      { error: 'Failed to build mint transaction' },
      { status: 500 }
    );
  }
}
