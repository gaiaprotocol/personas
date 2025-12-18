import { formatEther } from 'viem';

/**
 * On-chain PricingLib와 반드시 동일해야 합니다.
 *
 * Solidity:
 *   getPrice(S, A, inc, U):
 *     sqDiff = (S+A)^2 - S^2
 *     term1  = inc * sqDiff / (2*U*U)
 *     term2  = inc * A      / (2*U)
 *     return term1 + term2
 */
export const PRICE_INCREMENT_PER_FRAGMENT = 1_000_000_000_000_000n; // 1e15 wei

/**
 * Solidity PricingLib의 unitsPerToken 파라미터에 해당합니다.
 * (프로젝트 설정에 맞게 반드시 동일 값 사용)
 *
 * 예) "fragment" 단위가 토큰의 최소 단위(=1)라면 1n
 * 예) 토큰 1개가 1e18 units라면 1_000_000_000_000_000_000n
 */
export const UNITS_PER_TOKEN = 1n;

/** 안전한 BigInt 파싱(실패 시 0) */
function toBigIntSafe(v: string | number | bigint): bigint {
  try {
    return BigInt(v);
  } catch {
    return 0n;
  }
}

/**
 * PricingLib.getPrice(supply, amount, priceIncrement, unitsPerToken)
 * 와 동일한 결과(정수 나눗셈 truncation 포함)를 반환합니다.
 */
export function computePriceWei(
  supplyLike: string | number | bigint,
  amountLike: string | number | bigint,
  priceIncrement: bigint = PRICE_INCREMENT_PER_FRAGMENT,
  unitsPerToken: bigint = UNITS_PER_TOKEN,
): bigint {
  const S = toBigIntSafe(supplyLike);
  const A = toBigIntSafe(amountLike);
  const U = unitsPerToken;

  if (A <= 0n) return 0n;
  if (U <= 0n) return 0n; // 0으로 나누기 방지(온체인에선 U=0이면 revert/오류)

  const SplusA = S + A;

  // sqDiff = (S+A)^2 - S^2
  const sqDiff = SplusA * SplusA - S * S;

  // term1 = inc * sqDiff / (2 * U * U)
  const denom1 = 2n * U * U;
  const term1 = (priceIncrement * sqDiff) / denom1;

  // term2 = inc * A / (2 * U)
  const denom2 = 2n * U;
  const term2 = (priceIncrement * A) / denom2;

  return term1 + term2;
}

/**
 * PricingLib.getBuyPrice(supply, amount, inc, U)
 * => 내부적으로 getPrice(supply, amount, inc, U)
 */
export function computeBuyPriceWeiFromSupply(
  supplyLike: string | number | bigint,
  amountLike: string | number | bigint = 1n,
  priceIncrement: bigint = PRICE_INCREMENT_PER_FRAGMENT,
  unitsPerToken: bigint = UNITS_PER_TOKEN,
): bigint {
  return computePriceWei(supplyLike, amountLike, priceIncrement, unitsPerToken);
}

/**
 * PricingLib.getSellPrice(supply, amount, inc, U)
 * => supplyAfterSale = supply - amount
 * => getPrice(supplyAfterSale, amount, inc, U)
 *
 * 주의: amount > supply면 Solidity uint256 underflow로 revert(0.8+)
 * 클라이언트에서는 안전하게 0 반환(원하면 throw로 바꿔도 됨)
 */
export function computeSellPriceWeiFromSupply(
  supplyLike: string | number | bigint,
  amountLike: string | number | bigint = 1n,
  priceIncrement: bigint = PRICE_INCREMENT_PER_FRAGMENT,
  unitsPerToken: bigint = UNITS_PER_TOKEN,
): bigint {
  const supply = toBigIntSafe(supplyLike);
  const amount = toBigIntSafe(amountLike);

  if (amount <= 0n) return 0n;
  if (amount > supply) return 0n; // 온체인에서는 revert 가능 구간

  const supplyAfterSale = supply - amount;
  return computePriceWei(supplyAfterSale, amount, priceIncrement, unitsPerToken);
}

/** amount=1인 구매 가격 */
export function computeUnitBuyPriceWeiFromSupply(
  supplyLike: string | number | bigint,
  priceIncrement: bigint = PRICE_INCREMENT_PER_FRAGMENT,
  unitsPerToken: bigint = UNITS_PER_TOKEN,
): bigint {
  return computeBuyPriceWeiFromSupply(supplyLike, 1n, priceIncrement, unitsPerToken);
}

/** amount=1인 판매 가격 */
export function computeUnitSellPriceWeiFromSupply(
  supplyLike: string | number | bigint,
  priceIncrement: bigint = PRICE_INCREMENT_PER_FRAGMENT,
  unitsPerToken: bigint = UNITS_PER_TOKEN,
): bigint {
  return computeSellPriceWeiFromSupply(supplyLike, 1n, priceIncrement, unitsPerToken);
}

/**
 * wei -> ETH 라벨 포맷
 * (기존 동작 유지)
 */
export function formatEthLabelFromWei(wei: bigint): {
  value: number;
  label: string;
} {
  try {
    const n = Number(formatEther(wei));
    if (!Number.isFinite(n)) return { value: 0, label: '-' };

    const label = n >= 1000 ? `${n.toFixed(0)} ETH` : `${n.toFixed(4)} ETH`;
    return { value: n, label };
  } catch {
    return { value: 0, label: '-' };
  }
}
