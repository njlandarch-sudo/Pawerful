// Vercel Serverless Function - Claude Version
// 文件路径: api/analyze-pet-claude.js
// 等Anthropic API批准后使用这个版本

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, petType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const petTypeHint = petType === 'dog' ? 'dog' : 'cat';
    
    const prompt = `[Request ID: ${requestId}] [Timestamp: ${new Date().toISOString()}]

You are analyzing a ${petTypeHint} photo. Look carefully at the SPECIFIC details in THIS exact image.

Analyze this pet's current vibe based on their body language, expression, and what they're doing in the photo.

Return ONLY valid JSON (no markdown, no extra text) in this exact format:
{
  "breed": "Specific breed name based on visual features",
  "mode": "Current vibe in 2-3 words (e.g. 'Zooming Around', 'Nap Time', 'Side-Eye Mode')",
  "humanSafe": "green or yellow or red",
  "dogSafe": "green or yellow or red", 
  "stats": [
    {"label": "Energy", "value": 75},
    {"label": "Sass", "value": 60},
    {"label": "Affection", "value": 90}
  ],
  "diary": "One short, funny first-person sentence from this pet's perspective about what's happening in this photo"
}

CRITICAL: Analyze the ACTUAL image. Each response must be unique to this specific photo.`;

    console.log(`[${requestId}] Starting Claude analysis for ${petType}...`);

    // 准备图片数据（Claude需要base64格式，不带data:前缀）
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    // 调用Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022", // 最新的Claude模型
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Data,
                }
              },
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ],
        temperature: 0.9,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[${requestId}] Claude API error:`, errorData);
      throw new Error(errorData.error?.message || 'Claude API request failed');
    }

    const result = await response.json();
    const responseText = result.content[0].text;
    
    console.log(`[${requestId}] Raw response:`, responseText);

    // 清理响应
    const cleanText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // 解析JSON
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse failed:`, cleanText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // 验证必需字段
    if (!data.breed || !data.mode || !data.stats || !data.diary) {
      console.error(`[${requestId}] Missing required fields:`, data);
      throw new Error('AI response missing required fields');
    }

    console.log(`[${requestId}] Success! Breed: ${data.breed}, Mode: ${data.mode}`);

    return res.status(200).json({
      success: true,
      data,
      requestId,
      timestamp: new Date().toISOString(),
      model: 'claude-3-5-sonnet'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export const config = {
  maxDuration: 30,
};
