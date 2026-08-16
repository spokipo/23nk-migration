export interface PayPalEnv {
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  PAYPAL_ENV?: string;
}

export function getPayPalBaseUrl(env: PayPalEnv): string {
  return env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

export async function getPayPalAccessToken(
  env: PayPalEnv
): Promise<string> {
  const base = getPayPalBaseUrl(env);

  const credentials =
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`;

  const auth = btoa(credentials);

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `PayPal auth failed (${res.status}): ${text}`
    );
  }

  const data = (await res.json()) as {
    access_token: string;
  };

  return data.access_token;
}