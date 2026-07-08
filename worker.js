export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const audioBuffer = await request.arrayBuffer();

      // 尝试用 -turbo 模型（如果 -large-v3 不可用就换这个）
      const modelName = '@cf/openai/whisper-large-v3-turbo';
      // 如果账号有 large-v3 权限，也可以替换为 '@cf/openai/whisper-large-v3'

      const result = await env.AI.run(modelName, {
        audio: [...new Uint8Array(audioBuffer)], // 二进制数组输入
      });

      return Response.json(
        {
          text: result.text,
          language: result.detected_language, // 模型返回的语言代码
        },
        {
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    } catch (error) {
      return Response.json(
        { error: error.message },
        {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }
  },
};
