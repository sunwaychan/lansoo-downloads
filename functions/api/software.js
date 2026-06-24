// GET /api/software - 公开接口，返回所有分类和软件数据
export async function onRequestGet(context) {
  const { env } = context;

  try {
    const categories = await env.DB.prepare(
      "SELECT id, name, sort_order FROM categories ORDER BY sort_order"
    ).all();

    const software = await env.DB.prepare(
      `SELECT s.id, s.name, s.description, s.download_url, s.updated_at, s.sort_order, c.name as category
       FROM software s
       JOIN categories c ON s.category_id = c.id
       ORDER BY c.sort_order, s.sort_order`
    ).all();

    // 按分类分组
    const grouped = {};
    for (const cat of categories.results) {
      grouped[cat.name] = [];
    }
    for (const item of software.results) {
      if (grouped[item.category]) {
        grouped[item.category].push({
          id: item.id,
          name: item.name,
          description: item.description,
          downloadUrl: item.download_url,
          updatedAt: item.updated_at,
        });
      }
    }

    return new Response(JSON.stringify(grouped), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
