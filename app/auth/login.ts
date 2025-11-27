declare const GAIA_API_BASE_URI: string;

async function requestLogin(address: `0x${string}`, signature: `0x${string}`): Promise<string> {
  const response = await fetch(
    `${GAIA_API_BASE_URI}/login/personas`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        signature,
      }),
    },
  );
  if (!response.ok) throw new Error('Failed to login');
  const data = await response.json();
  if (!data.token) throw new Error('Invalid response from server');

  return data.token;
}

export { requestLogin };
