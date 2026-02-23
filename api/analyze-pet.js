// Vercel Serverless Function - 火山引擎豆包2.0版本
// 使用OpenAI SDK兼容方式调用
// 文件路径: api/analyze-pet.js

import { OpenAI } from 'openai';

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
    const petTypeHint = petType === 'dog' ? '狗' : '猫';
    
    const prompt = `[请求ID: ${requestId}] [时间: ${new Date().toISOString()}]

你正在分析一张${petTypeHint}的照片。请仔细观察这张具体照片中的细节。

基于照片中宠物的肢体语言、表情和正在做的事情，分析它当前的状态。

请以JSON格式返回结果（不要包含markdown代码块标记），格式如下：
{
  "breed": "根据照片中的视觉特征判断的具体品种名称",
  "mode": "用2-3个字描述当前状态（例如：'疯跑中'、'午睡时间'、'侧眼模式'、'抱抱心情'）",
  "humanSafe": "green 或 yellow 或 red",
  "dogSafe": "green 或 yellow 或 red", 
  "stats": [
    {"label": "活力", "value": 75},
    {"label": "傲娇", "value": 60},
    {"label": "亲和", "value": 90}
  ],
  "diary": "用第一人称写一句简短有趣的话，描述这张照片中正在发生的事"
}

重要提示：
- 分析这张实际提供的照片，而不是品种的一般信息
- 每次回复都必须是这张具体照片的独特分析
- "mode"应该反映你在图片中实际看到的内容
- "diary"应该是关于这张照片中正在发生的事
- 只返回JSON对象，不要有markdown格式`;

    console.log(`[${requestId}] 开始豆包2.0分析 ${petType}...`);

    // 准备图片数据 - 火山引擎需要完整的URL格式
    const imageUrl = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    // 初始化OpenAI客户端（兼容火山引擎）
    const client = new OpenAI({
      baseURL: "https://ark.cn-beijing.volces.com/api/v3",
      apiKey: process.env.VOLCENGINE_API_KEY,
    });

    // 调用火山引擎API - 使用responses.create方法
    const response = await client.responses.create({
      model: "doubao-seed-2-0-lite-260215",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: imageUrl
            },
            {
              type: "input_text",
              text: prompt
            }
          ]
        }
      ],
      parameters: {
        temperature: 0.9,
        max_tokens: 1000
      }
    });

    // 获取响应内容
    const responseText = response.output;
    
    console.log(`[${requestId}] 原始响应:`, responseText);

    // 清理响应（去掉可能的markdown格式）
    const cleanText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

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
