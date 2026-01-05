document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("events");

  if (!container) {
    console.error("Events container not found");
    return;
  }

  try {
    const res = await fetch("/api");
    if (!res.ok) throw new Error("Failed to fetch events");

    const data = await res.json();
    const events = Array.isArray(data.events) ? data.events : [];

    if (events.length === 0) {
      container.innerHTML = "<p>No upcoming events found.</p>";
      return;
    }

    // Sort by date (ascending)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = events
      .map((e) => {
        const date = e.date
          ? new Date(e.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "";

        return `
          <div class="event-card">
            <h3>${e.title}</h3>
            ${date ? `<p><strong>Date:</strong> ${date}</p>` : ""}
            ${e.region ? `<p><strong>Region:</strong> ${e.region}</p>` : ""}
            ${e.type ? `<p><strong>Type:</strong> ${e.type}</p>` : ""}
            ${e.location ? `<p><strong>Location:</strong> ${e.location}</p>` : ""}
            ${
              e.url
                ? `<p><a href="${e.url}" target="_blank" rel="noopener">Event details</a></p>`
                : ""
            }
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    container.innerHTML =
      "<p>There was a problem loading events. Please try again later.</p>";
  }
});