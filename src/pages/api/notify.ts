import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env;
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return new Response(JSON.stringify({ error: 'Telegram credentials missing' }), { status: 500 });
  }

  try {
    const payload = await request.json();
    const { title, productName, price, formData } = payload;

    const lines = [
      `✨ <b>${title || 'Новый заказ'}</b>`,
      productName ? `👗 <b>Product:</b> ${productName}` : '',
      price ? `💵 <b>Price:</b> $${typeof price === 'number' ? price.toFixed(2) : price}` : '',
      `----------------------------------`,
      formData?.fullName ? `👤 <b>Name:</b> ${formData.fullName}` : '',
      formData?.country ? `🌍 <b>Country:</b> ${formData.country}` : '',
      formData?.city ? `🏙 <b>City/Region:</b> ${formData.city} ${formData.stateRegion ? `(${formData.stateRegion})` : ''}` : '',
      formData?.streetAddress ? `📍 <b>Address:</b> ${formData.streetAddress}` : '',
      formData?.postalCode ? `📮 <b>ZIP:</b> ${formData.postalCode}` : '',
      formData?.phone ? `📱 <b>Phone:</b> <code>${formData.phone}</code>` : '',
      formData?.email ? `✉️ <b>Email:</b> ${formData.email}` : '',
      formData?.preferredContactMethod ? `💬 <b>Contact via:</b> ${formData.preferredContactMethod}` : '',
      formData?.contactDetails ? `🔗 <b>Contact info:</b> <code>${formData.contactDetails}</code>` : '',
      formData?.message ? `\n📝 <b>Notes:</b>\n<i>${formData.message}</i>` : '',
    ].filter(Boolean);

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Telegram API error:', errText);
      return new Response(JSON.stringify({ error: 'Telegram failed' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Notify endpoint error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
};