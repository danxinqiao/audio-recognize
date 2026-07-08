export default {
  async fetch(request, env) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 仅接受 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      // 获取上传的音频二进制数据
      const audioBuffer = await request.arrayBuffer();

      // 调用 Whisper 模型
      const result = await env.AI.run('@cf/openai/whisper-large-v3', {
        audio: [...new Uint8Array(audioBuffer)],
      });

      // 返回识别文本和语言
      const responseData = {
        text: result.text,
        language: result.detected_language,
      };

      return new Response(JSON.stringify(responseData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
