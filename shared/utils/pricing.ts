import { formatEther } from 'viem';

/**
 * Linear increment per fragment for bonding curve pricing.
 * This must match the on-chain configuration.
 *
 * PRICE_INCREMENT_PER_FRAGMENT = 1e15 wei
 */
export const PRICE_INCREMENT_PER_FRAGMENT = 1_000_000_000_000_000n; // 1e15

/**
 * Computes the current unit price (for 1 fragment) in wei
 * based on the current supply and a linear bonding curve:
 *
 *   price = k * (supply + 1)
 *
 * where:
 *   - k = PRICE_INCREMENT_PER_FRAGMENT
 *   - supply = current fragment supply
 */
export function computeCurrentUnitPriceWei(
  supplyLike: string | number | bigint | null | undefined,
): bigint {
  if (supplyLike === null || supplyLike === undefined) return 0n;

  let supply: bigint;

  try {
    supply = BigInt(supplyLike);
  } catch {
    supply = 0n;
  }

  return PRICE_INCREMENT_PER_FRAGMENT * (supply + 1n);
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
