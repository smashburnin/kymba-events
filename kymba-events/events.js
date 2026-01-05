const regionSelect = document.getElementById("region");
const typeSelect = document.getElementById("type");
const searchInput = document.getElementById("search");
const cardsEl = document.getElementById("cards");
const statusEl = document.getElementById("status");

let allEvents = [];

function createOption(select, value, label) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = label;
  select.appendChild(opt);
}

function renderFilters() {
  regionSelect.innerHTML = "";
  typeSelect.innerHTML = "";

  createOption(regionSelect, "", "All regions");
  createOption(typeSelect, "", "All types");

  [...new Set(allEvents.map(e => e.region).filter(Boolean))]
    .sort()
    .forEach(r => createOption(regionSelect, r, r));

  [...new Set(allEvents.map(e => e.type).filter(Boolean))]
    .sort()
    .forEach(t => createOption(typeSelect, t, t));
}

function renderEvents() {
  cardsEl.innerHTML = "";

  const region = regionSelect.value;
  const type = typeSelect.value;
  const q = searchInput.value.toLowerCase();

  const filtered = allEvents.filter(e => {
    return (
      (!region || e.region === region) &&
      (!type || e.type === type) &&
      (!q || `${e.title} ${e.location}`.toLowerCase().includes(q))
    );
  });

  if (!filtered.length) {
    statusEl.textContent = "No upcoming events.";
    return;
  }

  statusEl.textContent = `${filtered.length} event(s)`;

  filtered.forEach(e => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="chip">${e.type || "Event"}</div>
      <div class="title">${e.title}</div>
      <div class="meta">${e.date}</div>
      <div class="meta">${e.location || ""}</div>
      ${e.url ? `<a class="btn" href="${e.url}" target="_blank">Details</a>` : ""}
    `;

    cardsEl.appendChild(card);
  });
}

async function loadEvents() {
  try {
    statusEl.textContent = "Loading events…";

    const res = await fetch(`${window.location.origin}/api`);

    const data = await res.json();
    allEvents = data.events || [];

    renderFilters();
    renderEvents();
  } catch (err) {
    statusEl.textContent = "Error loading events.";
  }
}

if (regionSelect) regionSelect.addEventListener("change", renderEvents);
if (typeSelect) typeSelect.addEventListener("change", renderEvents);
if (searchInput) searchInput.addEventListener("input", renderEvents);

loadEvents();

