
export function shortenAddress(address: string, visible = 4): string {
  if (!address) return "";
  if (address.length <= visible * 2 + 2) return address;
  return `${address.slice(0, visible + 2)}...${address.slice(-visible)}`;
}

export function avatarInitialFromName(name: string): string {
  if (!name) return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
}

export function formatRelativeTimeFromSeconds(unixSeconds: number): string {
  const nowMs = Date.now();
  const tsMs = unixSeconds * 1000;
  const diffSec = Math.max(0, Math.floor((nowMs - tsMs) / 1000));

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo`;
  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear}y`;
}
