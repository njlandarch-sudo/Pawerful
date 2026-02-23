// Vercel Serverless Function
// 文件路径: api/analyze-pet.js
// 这个文件要放在你的项目根目录下的 /api 文件夹里

import { GoogleGenerativeAI } from "@google/generative-ai";

// 从环境变量读取API key（在Vercel dashboard设置）
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, petType } = req.body;

    // 验证输入
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // 根据宠物类型（cat/dog）调整prompt
    const petTypeHint = petType === 'dog' ? 'dog' : 'cat';
    
    // 🔥 关键改进：每次请求都加上随机ID和时间戳，防止缓存
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const prompt = `[Request ID: ${requestId}] [Timestamp: ${new Date().toISOString()}]

Analyze this ${petTypeHint} photo carefully. Look at the specific details in THIS image.

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
  "diary": "One funny first-person sentence from this pet's perspective about what's happening in this specific photo"
}

CRITICAL: Analyze the ACTUAL image provided. Do not give generic responses. Each response must be unique to the specific pet photo.`;

    // 准备图片数据
    const imagePart = {
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64, // 移除 data:image/jpeg;base64, 前缀
        mimeType: "image/jpeg"
      }
    };

    // 调用Gemini API
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9, // 🔥 增加随机性，防止重复
        topP: 0.95,
        topK: 40,
      }
    });

    console.log(`[${requestId}] Starting analysis for ${petType}...`);

    const result = await model.generateContent([
      { text: prompt },
      imagePart
    ]);

    const responseText = result.response.text();
    console.log(`[${requestId}] Raw response:`, responseText);

    // 清理响应（去掉markdown格式）
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

    // 返回结果（加上requestId用于调试）
    return res.status(200).json({
      success: true,
      data,
      requestId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // 返回友好的错误信息
    return res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed',
      // 不暴露内部错误细节给前端
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 配置函数选项
export const config = {
  maxDuration: 30, // 最多30秒（Vercel Pro plan可以用，免费版是10秒）
};
