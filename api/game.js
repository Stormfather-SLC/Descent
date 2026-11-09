// Vercel serverless function.
// Holds the real Anthropic API key server-side and proxies game requests to it.
// The browser never sees the key.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Optional access-code gate. Set GAME_ACCESS_CODE in your hosting env vars
  // to require a shared code from players before the API will respond.
  // Leave GAME_ACCESS_CODE unset to allow anyone with the URL to play.
  const requiredCode = process.env.GAME_ACCESS_CODE;
  if (requiredCode) {
    const provided = req.headers['x-access-code'];
    if (provided !== requiredCode) {
      res.status(401).json({ error: 'Invalid or missing access code' });
      return;
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' });
    return;
  }

  const { system, prompt, maxTokens, tier } = req.body || {};
  if (!prompt) {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }

  // "fast" is used for frequent, small calls (per-action turns, tutorial phrasing checks) —
  // "quality" is used for less-frequent, higher-value calls (new floor generation, mission setup).
  const MODELS = {
    fast: 'claude-haiku-4-5-20251001',
    quality: 'claude-sonnet-5'
  };
  const model = MODELS[tier] || MODELS.quality;
  const tokenCap = Math.min(Math.max(parseInt(maxTokens, 10) || 500, 100), 1500);

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: tokenCap,
        system: system || '',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Anthropic API error', detail: data });
      return;
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Upstream request failed', detail: String(e) });
  }
}
