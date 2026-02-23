// Vercel Edge Function - 无10秒限制，API Key安全保护
// 文件路径: api/analyze-pet.js

export const config = {
  runtime: 'edge',
};

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
    const imageUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const prompt = `You are analyzing a photo of a ${petTypeHint}.
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

    const apiResponse = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VOLCENGINE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "doubao-seed-2-0-lite-260215",
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: prompt }
          ]
        }],
        temperature: 0.8,
        max_tokens: 400
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return new Response(JSON.stringify({
        success: false,
        error: `豆包API错误 ${apiResponse.status}`,
        details: errText.slice(0, 200)
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await apiResponse.json();
    const responseText = result.choices?.[0]?.message?.content;

    if (!responseText) {
      return new Response(JSON.stringify({ success: false, error: 'AI返回空响应' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    let cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch {
      const match = cleanText.match(/\{[\s\S]*\}/);
      if (match) data = JSON.parse(match[0]);
      else throw new Error('无法解析AI响应');
    }

    if (!data.breed || !data.mode) throw new Error('AI响应缺少必需字段');

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || '分析失败'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}