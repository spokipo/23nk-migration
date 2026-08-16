import type { APIRoute } from 'astro';
import {
  getPayPalAccessToken,
  getPayPalBaseUrl,
} from '@/integrations/paypal/client';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env;

  try {
    const { productId, productName, price } =
      await request.json();

    const amount = Number(price);

    if (!productId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid product or price',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const accessToken = await getPayPalAccessToken(env);
    const base = getPayPalBaseUrl(env);

    const orderRes = await fetch(
      `${base}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: String(productId),
              description: String(productName || '').slice(
                0,
                127
              ),
              amount: {
                currency_code: 'USD',
                value: amount.toFixed(2),
              },
            },
          ],
        }),
      }
    );

    const order = await orderRes.json();

    if (!orderRes.ok) {
      console.error(
        'PayPal create order error:',
        order
      );

      return new Response(
        JSON.stringify({
          error: 'Failed to create PayPal order',
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
      JSON.stringify({
        id: order.id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(
      'create-order error:',
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