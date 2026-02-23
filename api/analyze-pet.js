// Vercel Serverless Function - 火山引擎豆包2.0版本
// 使用原始fetch调用
// 文件路径: api/analyze-pet.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, petType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // 防止缓存：每次请求都加上唯一ID和时间戳
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const petTypeHint = petType === 'dog' ? 'dog' : 'cat';
    
    const prompt = `[Request ID: ${requestId}] [Timestamp: ${new Date().toISOString()}]

You are analyzing a photo of a ${petTypeHint}. Look carefully at the SPECIFIC details in THIS exact image.

Analyze this pet's current vibe based on their body language, expression, and what they're doing in the photo.

Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) in this EXACT format:
{
  "breed": "Specific breed name based on visual features in the photo",
  "mode": "Current vibe in 2-3 words describing what you see (e.g. 'Zooming Around', 'Nap Time', 'Side-Eye Mode', 'Cuddle Mood')",
  "humanSafe": "green",
  "dogSafe": "green",
  "stats": [
    {"label": "Energy", "value": 75},
    {"label": "Sass", "value": 60},
    {"label": "Affection", "value": 90}
  ],
  "diary": "One short, funny first-person sentence from this pet's perspective about what's happening in this specific photo"
}

CRITICAL RULES:
- Analyze the ACTUAL image provided, not generic breed info
- Each response must be unique to this specific photo
- The "mode" should reflect what you actually see in the image
- The "diary" should be about what's happening in THIS photo
- Return ONLY the JSON object, absolutely no markdown formatting
- All text must be in English
- Values for humanSafe and dogSafe should be "green", "yellow", or "red"
- Stats values should be numbers between 0-100`;

    console.log(`[${requestId}] 开始豆包2.0分析 ${petType}...`);
    console.log(`[${requestId}] API Key配置: ${process.env.VOLCENGINE_API_KEY ? '已配置' : '❌未配置'}`);

    // 准备图片数据
    const imageUrl = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    // 使用原始fetch调用 - chat/completions端点
    const apiResponse = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VOLCENGINE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "doubao-seed-2-0-lite-260215",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
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
        max_tokens: 1000
      })
    });

    console.log(`[${requestId}] API响应状态: ${apiResponse.status}`);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`[${requestId}] API错误响应:`, errorText);
      
      return res.status(500).json({
        success: false,
        error: 'API调用失败',
        status: apiResponse.status,
        details: errorText,
        hint: '请检查：1) API Key是否正确 2) 模型是否已开通 3) 是否有余额'
      });
    }

    const result = await apiResponse.json();
    console.log(`[${requestId}] API响应结构:`, Object.keys(result));

    // chat/completions返回格式：{ choices: [{ message: { content: "..." } }] }
    const responseText = result.choices?.[0]?.message?.content;
    
    console.log(`[${requestId}] 原始响应:`, responseText);

    if (!responseText) {
      console.error(`[${requestId}] 响应内容为空`);
      throw new Error('AI返回了空响应');
    }

    // 清理响应（去掉可能的markdown格式）
    let cleanText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // 如果响应以```开头但没有json标记，也去掉
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    console.log(`[${requestId}] 清理后的响应:`, cleanText);

    // 解析JSON
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (parseError) {
      console.error(`[${requestId}] JSON解析失败:`, cleanText);
      throw new Error('无法解析AI响应为JSON');
    }

    // 验证必需字段
    if (!data.breed || !data.mode || !data.stats || !data.diary) {
      console.error(`[${requestId}] 缺少必需字段:`, data);
      throw new Error('AI响应缺少必需字段');
    }

    console.log(`[${requestId}] 成功！品种: ${data.breed}, 模式: ${data.mode}`);

    return res.status(200).json({
      success: true,
      data,
      requestId,
      timestamp: new Date().toISOString(),
      model: 'doubao-seed-2.0-lite'
    });

  } catch (error) {
    console.error('分析错误:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || '分析失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export const config = {
  maxDuration: 30,
};