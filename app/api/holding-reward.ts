import { Address, HoldingRewardData } from '../contracts/persona-fragments';

declare const GAIA_API_BASE_URI: string;

export type HoldingRewardSide = 'buy' | 'sell';

export type HoldingRewardResponse = {
  ok: boolean;
  rewardRatio: string;   // 1e18 기준 비율 (string 으로 내려온다고 가정)
  nonce: string;         // uint256 string
  signature: `0x${string}`;
  error?: string;
};

/**
 * 특정 지갑 주소(trader)가 특정 persona 에 대해
 * amount 만큼 buy/sell 할 때 사용할 holding reward 서명 데이터 요청
 *
 * 서버 엔드포인트 예시: GET /persona/holding-reward
 *   ?persona=<address>
 *   &trader=<address>
 *   &amount=<bigint>
 *   &side=buy|sell
 *
 * 실제 서버 구현에 맞게 URL/파라미터/응답 타입은 조정하면 됩니다.
 */
export async function fetchHoldingReward(params: {
  persona: Address;
  trader: Address;
  amount: bigint;
  side: HoldingRewardSide;
}): Promise<HoldingRewardData> {
  const { persona, trader, amount, side } = params;

  const url = new URL(
    `${GAIA_API_BASE_URI}/persona/holding-reward`,
  );

  url.searchParams.set('persona', persona);
  url.searchParams.set('trader', trader);
  url.searchParams.set('amount', amount.toString());
  url.searchParams.set('side', side);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    let message = `Failed to fetch holding reward: ${res.status}`;
    try {
      const data = (await res.json()) as Partial<HoldingRewardResponse>;
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = (await res.json()) as HoldingRewardResponse;

  if (!data.ok) {
    throw new Error(data.error || 'Failed to fetch holding reward.');
  }

  const rewardRatio = BigInt(data.rewardRatio);
  const nonce = BigInt(data.nonce);
  const signature = data.signature;

  return {
    rewardRatio,
    nonce,
    signature,
  };
}
