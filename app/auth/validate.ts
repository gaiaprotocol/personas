import { tokenManager } from "@gaiaprotocol/client-common";

declare const GAIA_API_BASE_URI: string;

export async function validateToken(): Promise<boolean> {
  const token = tokenManager.getToken();
  if (!token) return false;

  const res = await fetch(`${GAIA_API_BASE_URI}/validate-token`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    tokenManager.clear();
    return false;
  }

  return true;
}
