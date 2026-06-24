import { verifyToken } from "./login";

async function requireAuth(context) {
  const auth = context.request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return await verifyToken(token, context.env.ADMIN_PASSWORD) ? true : null;
}

// GET /api/admin/categories
export async function onRequestGet(context) {
  const auth = await requireAuth(context);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  const cats = await context.env.DB.prepare(
    "SELECT id, name, sort_order FROM categories ORDER BY sort_order"
  ).all();

  return new Response(JSON.stringify(cats.results), {
    headers: { "Content-Type": "application/json" },
  });
}

// POST /api/admin/categories - 新增分类
export async function onRequestPost(context) {
  const auth = await requireAuth(context);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  const { name, sort_order } = await context.request.json();
  if (!name) return new Response(JSON.stringify({ error: "名称不能为空" }), { status: 400 });

  const result = await context.env.DB.prepare(
    "INSERT INTO categories (name, sort_order) VALUES (?, ?)"
  ).bind(name, sort_order || 0).run();

  return new Response(JSON.stringify({ id: result.meta.last_row_id }));
}