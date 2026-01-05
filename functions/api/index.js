export async function onRequest(context) {
  const { env } = context;

  const NOTION_TOKEN = env.NOTION_TOKEN;
  const DATABASE_ID = env.NOTION_DATABASE_ID;

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${NOTION_TOKEN}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    filter: {
      property: "Public",
      checkbox: { equals: true },
    },
  }),
});
  const data = await res.json();

  const getTitle = (p) => p?.title?.[0]?.plain_text || "";
  const getRichText = (p) => p?.rich_text?.[0]?.plain_text || "";
  const getSelect = (p) => p?.select?.name || "";
  const getCheckbox = (p) => !!p?.checkbox;
  const getUrl = (p) => p?.url || getRichText(p);
  const getDate = (p) => p?.date?.start || "";

  const events = (data.results || [])
    .map(page => {
      const props = page.properties;

      const isPublic = getCheckbox(props["Public"]);
      const showOnHub = getCheckbox(props["Show on Events Hub"]);
      const publishStatus = getSelect(props["Publish Status"]);

      if (!(isPublic && showOnHub && publishStatus === "Published")) return null;

      return {
        title: getTitle(props["Event Title"]) || "Untitled event",
        date: getDate(props["Start Date"]) || "",
        region: getSelect(props["City / Region"]) || getRichText(props["City / Region"]) || "",
        type: getSelect(props["Event Type"]) || "",
        location:
          getRichText(props["Location Name"]) ||
          getRichText(props["Address or Trail System"]) ||
          "",
        url:
          getUrl(props["RSVP / Event Link"]) ||
          getUrl(props["Event link (posted elsew..."]) ||
          ""
      };
    })
    .filter(Boolean);

  return new Response(JSON.stringify({ events }), {
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  }
});
}