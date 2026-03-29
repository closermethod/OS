exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Valid email required' }) };
    }

    const apiSecret = process.env.KIT_API_SECRET;

    // Subscribe to form (triggers automation for new subscribers)
    const formResponse = await fetch('https://api.convertkit.com/v3/forms/9259574/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_secret: apiSecret, email: email })
    });

    if (!formResponse.ok) {
      return { statusCode: formResponse.status, body: JSON.stringify({ error: 'Subscription failed' }) };
    }

    // Also tag directly (ensures tag applies even for existing subscribers)
    await fetch('https://api.convertkit.com/v3/tags/18168606/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_secret: apiSecret, email: email })
    }).catch(() => {});

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
