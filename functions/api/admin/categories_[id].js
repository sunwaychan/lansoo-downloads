import { verifyToken } from "./login";

async function requireAuth(context) {
  const auth = context.request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return await verifyToken(token, context.env.ADMIN_PASSWORD) ? true : null;
}

// PUT /api/admin/categories/[id]
export async function onRequestPut(context) {
  const auth = await requireAuth(context);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  const { name, sort_order } = await context.request.json();
  await context.env.DB.prepare(
    "UPDATE categories SET name=?, sort_order=? WHERE id=?"
  ).bind(name, sort_order || 0, context.params.id).run();

  return new Response(JSON.stringify({ ok: true }));
}

// DELETE /api/admin/categories/[id]
export async function onRequestDelete(context) {
  const auth = await requireAuth(context);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  await context.env.DB.prepare(
    "DELETE FROM categories WHERE id=?"
  ).bind(context.params.id).run();

  return new Response(JSON.stringify({ ok: true }));
}