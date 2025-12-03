import { PersonaFragmentHolding } from '../../shared/types/persona-fragments';

declare const GAIA_API_BASE_URI: string;

export type FetchHeldPersonaFragmentsResult = {
  holdings: PersonaFragmentHolding[];
};

export async function fetchHeldPersonaFragments(
  token: string,
): Promise<FetchHeldPersonaFragmentsResult> {
  if (!token) throw new Error('Missing authorization token.');

  const res = await fetch(`${GAIA_API_BASE_URI}/persona/held-fragments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let message = `Failed to fetch held personas: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await res.json()) as FetchHeldPersonaFragmentsResult;
}
