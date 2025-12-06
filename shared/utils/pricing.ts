import { formatEther } from 'viem';

/**
 * Linear increment per fragment for bonding curve pricing.
 * This must match the on-chain configuration.
 *
 * PRICE_INCREMENT_PER_FRAGMENT = 1e15 wei
 */
export const PRICE_INCREMENT_PER_FRAGMENT = 1_000_000_000_000_000n; // 1e15

/**
 * Scale factor used in Solidity PricingLib.
 * In PersonaFragments, scaleFactor is always 1.
 */
export const SCALE_FACTOR = 1n;

/**
 * Computes the total buy price (in wei) for `amount` fragments
 * at the current `supply`, using the same formula as
 * PricingLib.getBuyPrice(supply, amount, priceIncrement, scaleFactor):
 *
 *   startPrice = priceIncrement + (supply * priceIncrement) / scaleFactor;
 *   endSupply  = supply + amount;
 *   endPrice   = priceIncrement + (endSupply * priceIncrement) / scaleFactor;
 *   average    = (startPrice + endPrice) / 2;
 *   price      = (average * amount) / scaleFactor;
 */
export function computeBuyPriceWeiFromSupply(
  supplyLike: string | number | bigint,
  amountLike: string | number | bigint = 1n,
): bigint {
  let supply: bigint;
  let amount: bigint;

  try {
    supply = BigInt(supplyLike);
  } catch {
    supply = 0n;
  }

  try {
    amount = BigInt(amountLike);
  } catch {
    amount = 0n;
  }

  const priceIncrement = PRICE_INCREMENT_PER_FRAGMENT;
  const scaleFactor = SCALE_FACTOR;

  const startPrice =
    priceIncrement + (supply * priceIncrement) / scaleFactor;

  const endSupply = supply + amount;
  const endPrice =
    priceIncrement + (endSupply * priceIncrement) / scaleFactor;

  const averagePrice = (startPrice + endPrice) / 2n;

  return (averagePrice * amount) / scaleFactor;
}

/**
 * Convenience helper for the unit buy price (amount = 1).
 * Returns the price to buy exactly 1 fragment at the given supply.
 */
export function computeUnitBuyPriceWeiFromSupply(
  supplyLike: string | number | bigint,
): bigint {
  return computeBuyPriceWeiFromSupply(supplyLike, 1n);
}

/**
 * Formats a wei amount into a compact ETH label and returns both
 * the numeric ETH value and the human-readable label.
 *
 * Examples:
 *   0.12345678 => "0.1235 ETH"
 *   1234.5678  => "1235 ETH"
 */
export function formatEthLabelFromWei(wei: bigint): {
  value: number;
  label: string;
} {
  try {
    const n = Number(formatEther(wei));
    if (!Number.isFinite(n)) {
      return { value: 0, label: '-' };
    }

    const label =
      n >= 1000 ? `${n.toFixed(0)} ETH` : `${n.toFixed(4)} ETH`;

    return { value: n, label };
  } catch {
    return { value: 0, label: '-' };
  }
}
