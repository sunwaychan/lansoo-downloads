import { verifyToken } from "./login";

async function requireAuth(context) {
  const auth = context.request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return await verifyToken(token, context.env.ADMIN_PASSWORD) ? true : null;
}

// PUT /api/admin/software/[id] - 更新软件
export async function onRequestPut(context) {
  const auth = await requireAuth(context);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  const { request, env, params } = context;
  const id = params.id;
  const body = await request.json();
  const { category_id, name, description, download_url, updated_at, sort_order } = body;

  await env.DB.prepare(
    "UPDATE software SET category_id=?, name=?, description=?, download_url=?, updated_at=?, sort_order=? WHERE id=?"
  ).bind(category_id, name, description || "", download_url, updated_at, sort_order || 0, id).run();

  return new Response(JSON.stringify({ ok: true }));
}

// DELETE /api/admin/software/[id] - 删除软件
export async function onRequestDelete(context) {
  const auth = await requireAuth(context);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  const { env, params } = context;
  await env.DB.prepare("DELETE FROM software WHERE id=?").bind(params.id).run();

  return new Response(JSON.stringify({ ok: true }));
}