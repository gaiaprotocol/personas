import { wagmiConfig } from '@gaiaprotocol/client-common';
import { Abi } from 'viem';
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions';
import { PERSONA_FRAGMENTS_ADDRESS } from '../vars';
import personaFragmentsJson from './PersonaFragments.json';

const abi = personaFragmentsJson.abi as Abi;

const ONE_ETHER = 10n ** 18n;

export type Address = `0x${string}`;

//
// ---------- Read helpers ----------
//

// persona → amount 만큼 살 때 가격
export async function getBuyPrice(persona: Address, amount: bigint): Promise<bigint> {
  return readContract(wagmiConfig, {
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: 'getBuyPrice',
    args: [persona, amount],
  }) as Promise<bigint>;
}

// persona → amount 만큼 팔 때 가격
export async function getSellPrice(persona: Address, amount: bigint): Promise<bigint> {
  return readContract(wagmiConfig, {
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: 'getSellPrice',
    args: [persona, amount],
  }) as Promise<bigint>;
}

// 수수료율들
export async function getProtocolFeeRate(): Promise<bigint> {
  return readContract(wagmiConfig, {
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: 'protocolFeeRate',
  }) as Promise<bigint>;
}

export async function getPersonaOwnerFeeRate(): Promise<bigint> {
  return readContract(wagmiConfig, {
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: 'personaOwnerFeeRate',
  }) as Promise<bigint>;
}

// 특정 persona / user 보유량
export async function getPersonaBalance(
  persona: Address,
  user: Address,
): Promise<bigint> {
  return readContract(wagmiConfig, {
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: 'balance',
    args: [persona, user],
  }) as Promise<bigint>;
}

// persona 총 공급량
export async function getPersonaSupply(persona: Address): Promise<bigint> {
  return readContract(wagmiConfig, {
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: 'supply',
    args: [persona],
  }) as Promise<bigint>;
}

// holdingRewards nonce (msg.sender 기준)
export async function getUserNonce(user: Address): Promise<bigint> {
  return readContract(wagmiConfig, {
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: 'nonces',
    args: [user],
  }) as Promise<bigint>;
}

//
// ---------- Fee 계산 헬퍼 (클라이언트에서 쓸 수 있도록) ----------
//

export function calcBuyFees(params: {
  price: bigint;              // getBuyPrice 결과
  protocolFeeRate: bigint;    // getProtocolFeeRate 결과
  personaOwnerFeeRate: bigint;// getPersonaOwnerFeeRate 결과
  holdingReward?: bigint;     // calculateHoldingReward 결과(옵션, 몰라도 됨)
}) {
  const { price, protocolFeeRate, personaOwnerFeeRate, holdingReward = 0n } = params;

  const rawProtocolFee = (price * protocolFeeRate) / ONE_ETHER;
  const protocolFee = rawProtocolFee - holdingReward;
  const personaFee = (price * personaOwnerFeeRate) / ONE_ETHER + holdingReward;
  const total = price + protocolFee + personaFee;

  return { protocolFee, personaFee, total };
}

export function calcSellProceeds(params: {
  price: bigint;              // getSellPrice 결과
  protocolFeeRate: bigint;
  personaOwnerFeeRate: bigint;
  holdingReward?: bigint;
}) {
  const { price, protocolFeeRate, personaOwnerFeeRate, holdingReward = 0n } = params;

  const rawProtocolFee = (price * protocolFeeRate) / ONE_ETHER;
  const protocolFee = rawProtocolFee - holdingReward;
  const personaFee = (price * personaOwnerFeeRate) / ONE_ETHER + holdingReward;
  const proceeds = price - protocolFee - personaFee;

  return { protocolFee, personaFee, proceeds };
}

//
// ---------- Write helpers (buy / sell) ----------
//

// 백엔드에서 받는 서명 데이터 타입
export type HoldingRewardData = {
  rewardRatio: bigint;        // 1e18 기준 비율
  nonce: bigint;
  signature: `0x${string}`;   // verifier signature
};

// buy: msg.value = totalCost(= price + protocol + persona)
export async function buyPersonaFragments(params: {
  persona: Address;
  amount: bigint;
  holdingReward: HoldingRewardData;
  totalValueWei: bigint; // msg.value 로 보낼 금액
}) {
  const { persona, amount, holdingReward, totalValueWei } = params;

  const { request } = await simulateContract(wagmiConfig, {
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: 'buy',
    args: [
      persona,
      amount,
      holdingReward.rewardRatio,
      holdingReward.nonce,
      holdingReward.signature,
    ],
    value: totalValueWei,
  });

  const hash = await writeContract(wagmiConfig, request);
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

  return { hash, receipt };
}

// sell: msg.value 없음
export async function sellPersonaFragments(params: {
  persona: Address;
  amount: bigint;
  holdingReward: HoldingRewardData;
}) {
  const { persona, amount, holdingReward } = params;

  const { request } = await simulateContract(wagmiConfig, {
    address: PERSONA_FRAGMENTS_ADDRESS,
    abi,
    functionName: 'sell',
    args: [
      persona,
      amount,
      holdingReward.rewardRatio,
      holdingReward.nonce,
      holdingReward.signature,
    ],
  });

  const hash = await writeContract(wagmiConfig, request);
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

  return { hash, receipt };
}
