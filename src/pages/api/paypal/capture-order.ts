import type { APIRoute } from 'astro';
import {
  getPayPalAccessToken,
  getPayPalBaseUrl,
} from '@/integrations/paypal/client';

export const POST: APIRoute = async ({
  request,
  locals,
}) => {
  const env = (locals as any).runtime.env;

  try {
    const { orderID } = await request.json();

    if (!orderID) {
      return new Response(
        JSON.stringify({
          error: 'orderID is required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const accessToken =
      await getPayPalAccessToken(env);

    const base = getPayPalBaseUrl(env);

    const captureRes = await fetch(
      `${base}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData =
      await captureRes.json();

    if (!captureRes.ok) {
      console.error(
        'PayPal capture error:',
        captureData
      );

      return new Response(
        JSON.stringify({
          error: 'Failed to capture payment',
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify(captureData),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(
      'capture-order error:',
      error
    );

    return new Response(
      JSON.stringify({
        error: 'Internal error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};