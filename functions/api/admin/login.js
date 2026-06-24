// POST /api/admin/login - 管理员登录
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { password } = await request.json();

    if (password !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 简单 token: 用 ADMIN_PASSWORD 做 HMAC 签名
    const token = await generateToken(env.ADMIN_PASSWORD);

    return new Response(JSON.stringify({ token }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function generateToken(secret) {
  const data = `admin:${Date.now()}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const hex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${btoa(data)}.${hex}`;
}

export async function verifyToken(token, secret) {
  try {
    const [b64Data, hexSig] = token.split(".");
    const data = atob(b64Data);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const sigBytes = new Uint8Array(hexSig.match(/.{2}/g).map(b => parseInt(b, 16)));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(data));
    if (!valid) return false;

    // 检查 token 是否在 24 小时内
    const timestamp = parseInt(data.split(":")[1]);
    return Date.now() - timestamp < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
