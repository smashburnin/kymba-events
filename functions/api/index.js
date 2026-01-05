export async function onRequest(context) {
  const { env } = context;

  const NOTION_TOKEN = env.NOTION_TOKEN;
  const DATABASE_ID = env.NOTION_DATABASE_ID;

  const res = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 5 }), // only sample 5
    }
  );

  const data = await res.json();

  const first = data?.results?.[0];
  const props = first?.properties || {};

  const propertyCatalog = Object.fromEntries(
    Object.entries(props).map(([name, val]) => [name, val?.type || "unknown"])
  );

  return new Response(
    JSON.stringify(
      {
        ok: res.ok,
        status: res.status,
        results_count: data?.results?.length || 0,
        has_more: !!data?.has_more,
        sample_page_name: first?.properties?.["Event Title"]?.title?.[0]?.plain_text
          || first?.properties?.Name?.title?.[0]?.plain_text
          || "(no title found)",
        property_catalog: propertyCatalog,
      },
      null,
      2
    ),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}