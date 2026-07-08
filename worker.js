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
      
      // 将 ArrayBuffer 转为 base64 字符串（官方推荐格式）
      const base64 = arrayBufferToBase64(audioBuffer);

      const result = await env.AI.run(
        '@cf/openai/whisper-large-v3-turbo',
        { audio: base64 }       // ✅ 现在是一个字符串
      );

      return Response.json(
        {
          text: result.text,
          language: result.detected_language,
        },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
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

// 辅助函数：ArrayBuffer → base64（Cloudflare Workers 完全兼容）
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
