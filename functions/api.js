export async function onRequest(context) {
  const { env } = context;

  const NOTION_TOKEN = env.NOTION_TOKEN;
  const DATABASE_ID = env.NOTION_DATABASE_ID;

  const getTitle = (p) => p?.title?.[0]?.plain_text || "";
  const getRichText = (p) => p?.rich_text?.[0]?.plain_text || "";
  const getCheckbox = (p) => p?.checkbox === true;
  const getStatus = (p) => p?.status?.name || "";
  const getSelect = (p) => p?.select?.name || "";
  const getMultiSelect = (p) =>
    Array.isArray(p?.multi_select) ? p.multi_select.map((x) => x.name).join(", ") : "";
  const getUrl = (p) => p?.url || "";
  const getDate = (p) => p?.date?.start || "";
  const getFormulaBool = (p) => p?.formula?.boolean === true;

  const notionRes = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
    }
  );

  const data = await notionRes.json();

  if (!notionRes.ok) {
    return new Response(
      JSON.stringify(
        { error: "Notion query failed", status: notionRes.status, details: data },
        null,
        2
      ),
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }

  const results = Array.isArray(data?.results) ? data.results : [];

  const events = results
    .map((page) => {
      const props = page?.properties || {};

      const isPublic = getCheckbox(props["Public"]);
      const showOnHub = getFormulaBool(props["Show on Events Hub"]);
      const publishStatus = getStatus(props["Publish Status"]);

      if (!(isPublic && showOnHub && publishStatus === "Published")) return null;

      const title = getTitle(props["Event Title"]) || "Untitled event";
      const startDate = getDate(props["Start Date"]) || "";
      const region =
        getSelect(props["Associated KYMBA Chapter"]) ||
        getRichText(props["City / Region"]) ||
        "";
      const type = getMultiSelect(props["Event Type"]) || "";
      const location =
        getRichText(props["Location Name"]) ||
        getRichText(props["Address or Trail System"]) ||
        "";
      const url =
        getUrl(props["RSVP / Event Link"]) ||
        getUrl(props["Event Link (posted elsewhere)"]) ||
        "";

      return { title, date: startDate, region, type, location, url };
    })
    .filter(Boolean);

  return new Response(JSON.stringify({ events }, null, 2), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}