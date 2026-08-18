import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime.env;

  return new Response(
    JSON.stringify({
      clientId: env.PAYPAL_CLIENT_ID || '',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
