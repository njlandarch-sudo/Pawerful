// Vercel Edge Function - Geo-based API routing
// CN users → Doubao (Volcengine), all others → Google Gemini Flash
// 文件路径: api/analyze-pet.js

export const config = {
  runtime: 'edge',
};

// ─── Shared prompt ────────────────────────────────────────────────────────────
const buildPrompt = (petTypeHint) =>
  `You are analyzing a photo of a ${petTypeHint}.
Analyze this pet's current vibe based on their body language, expression, and what they're doing.
Return ONLY a valid JSON object, no markdown, no extra text:
{
  "breed": "specific breed name",
  "mode": "current vibe in 2-3 words (e.g. 'Side-Eye Mode', 'Nap Time', 'Zoomies Mode')",
  "humanSafe": "green",
  "dogSafe": "green",
  "stats": [
    {"label": "Energy", "value": 75},
    {"label": "Sass", "value": 60},
    {"label": "Affection", "value": 90}
  ],
  "diary": "one short funny first-person sentence from this pet about what's happening"
}
Rules: JSON only. English only. humanSafe/dogSafe must be green/yellow/red. Stats 0-100.`;

// ─── Response parser (shared) ─────────────────────────────────────────────────
function parseAIResponse(text) {
  let clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response');
  }
}

// ─── Doubao (Volcengine) ──────────────────────────────────────────────────────
async function callDoubao(imageUrl, petTypeHint) {
  const res = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOLCENGINE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'doubao-seed-2-0-lite-260215',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: buildPrompt(petTypeHint) }
        ]
      }],
      temperature: 0.8,
      max_tokens: 400
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Doubao API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const result = await res.json();
  const text = result.choices?.[0]?.message?.content;
  if (!text) throw new Error('Doubao returned empty response');
  return parseAIResponse(text);
}

// ─── Google Gemini Flash ──────────────────────────────────────────────────────
async function callGemini(imageBase64, petTypeHint) {
  // Strip the data URI prefix to get raw base64 + detect mime type
  const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: rawBase64 } },
            { text: buildPrompt(petTypeHint) }
          ]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 400,
        }
      })
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const result = await res.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');
  return parseAIResponse(text);
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { imageBase64, petType } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'Missing image data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const petTypeHint = petType === 'dog' ? 'dog' : 'cat';

    // ── Geo routing ──────────────────────────────────────────────────────────
    // Vercel Edge populates req.geo automatically.
    // Fall back to CN if geo is unavailable (conservative choice for edge cases).
    const country = req.geo?.country ?? 'CN';
    const useChinaAPI = country === 'CN';

    console.log(`[analyze-pet] country=${country} → ${useChinaAPI ? 'Doubao' : 'Gemini'}`);

    let data;
    if (useChinaAPI) {
      // Doubao expects a full data URI
      const imageUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      data = await callDoubao(imageUrl, petTypeHint);
    } else {
      // Gemini receives raw base64 (we handle the stripping inside callGemini)
      const imageUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      data = await callGemini(imageUrl, petTypeHint);
    }

    if (!data.breed || !data.mode) throw new Error('AI response missing required fields');

    return new Response(JSON.stringify({
      success: true,
      data,
      // Expose routing info for debugging (remove in production if desired)
      _meta: { provider: useChinaAPI ? 'doubao' : 'gemini', country }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[analyze-pet] Error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Analysis failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}