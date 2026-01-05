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
      body: JSON.stringify({}),
    }
  );

  const data = await res.json();

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}