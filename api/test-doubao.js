// 测试火山引擎API是否正常
// 文件路径: api/test-doubao.js

export default async function handler(req, res) {
  try {
    console.log('测试开始...');
    console.log('API Key配置:', process.env.VOLCENGINE_API_KEY ? '✅已配置' : '❌未配置');
    console.log('API Key长度:', process.env.VOLCENGINE_API_KEY?.length || 0);
    
    // 简单的文本测试（不用图片）
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
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
            content: "你好，请回复'测试成功'"
          }
        ]
      })
    });

    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('响应内容:', responseText);

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        status: response.status,
        error: responseText,
        hint: '检查API Key是否正确，模型是否开通'
      });
    }

    const result = JSON.parse(responseText);

    return res.status(200).json({
      success: true,
      message: '豆包API测试成功！',
      result: result
    });

  } catch (error) {
    console.error('测试错误:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
