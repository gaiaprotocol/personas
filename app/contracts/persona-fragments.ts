import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { PERSONA_FRAGMENTS_ADDRESS } from '../vars';
import { abi } from './PersonaFragments.json';

const chain = process.env.NODE_ENV === 'production' ? base : baseSepolia;
const client = createPublicClient({ chain, transport: http() });

export async function test() {
  console.log(await client.readContract({
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: "personaOwnerFeeRate",
  }));
}
