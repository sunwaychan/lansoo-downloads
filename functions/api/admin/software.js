import { verifyToken } from "./login";

async function requireAuth(context) {
  const auth = context.request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return null;
  }
  const token = auth.slice(7);
  const valid = await verifyToken(token, context.env.ADMIN_PASSWORD);
  return valid ? true : null;
}

// GET /api/admin/software - 获取所有软件（含 category_id）
export async function onRequestGet(context) {
  const auth = await requireAuth(context);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  const { env } = context;
  const software = await env.DB.prepare(
    `SELECT s.id, s.name, s.description, s.download_url, s.updated_at, s.sort_order, s.category_id, c.name as category_name
     FROM software s JOIN categories c ON s.category_id = c.id
     ORDER BY c.sort_order, s.sort_order`
  ).all();

  return new Response(JSON.stringify(software.results), {
    headers: { "Content-Type": "application/json" },
  });
}

// POST /api/admin/software - 新增软件
export async function onRequestPost(context) {
  const auth = await requireAuth(context);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  const { request, env } = context;
  const body = await request.json();

  const { category_id, name, description, download_url, updated_at, sort_order } = body;

  if (!category_id || !name || !download_url) {
    return new Response(JSON.stringify({ error: "缺少必填字段" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await env.DB.prepare(
    `INSERT INTO software (category_id, name, description, download_url, updated_at, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    category_id,
    name,
    description || "",
    download_url,
    updated_at || new Date().toISOString().slice(0, 10),
    sort_order || 0
  ).run();

  return new Response(JSON.stringify({ id: result.meta.last_row_id }), {
    headers: { "Content-Type": "application/json" },
  });
}
