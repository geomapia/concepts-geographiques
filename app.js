const PAGE_SIZE = 18;
const editionSeries = [
  [2015, 3741], [2016, 4315], [2017, 4862], [2018, 5308],
  [2019, 5343], [2020, 5534], [2021, 5726], [2022, 5730],
  [2023, 5804], [2024, 5878], [2025, 5999], [2026, 6116],
];
const colors = [
  "#8b2e3f", "#2f6f6d", "#496a8a", "#a6672b", "#52623b",
  "#5d4b76", "#8b6f47", "#3d7187", "#75685b", "#9a4d45",
  "#4f7656", "#76506f",
];

let concepts = [];
let filtered = [];
let currentPage = 1;

const elements = {
  search: document.querySelector("#search"),
  domain: document.querySelector("#domain"),
  type: document.querySelector("#noticeType"),
  relevance: document.querySelector("#relevance"),
  grid: document.querySelector("#conceptGrid"),
  count: document.querySelector("#resultCount"),
  reset: document.querySelector("#resetFilters"),
  empty: document.querySelector("#emptyState"),
  emptyReset: document.querySelector("#emptyReset"),
  pagination: document.querySelector("#pagination"),
  previous: document.querySelector("#previousPage"),
  next: document.querySelector("#nextPage"),
  page: document.querySelector("#pageIndicator"),
  modal: document.querySelector("#modalBackdrop"),
  modalClose: document.querySelector("#modalClose"),
};

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderOverview() {
  const domains = [...new Set(concepts.map((item) => item.domaine_principal))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  const central = concepts.filter((item) => item.pertinence === "Central").length;
  const interdisciplinary = concepts.length - central;
  const centralShare = concepts.length ? (central / concepts.length) * 100 : 0;
  document.querySelector("#totalConcepts").textContent = concepts.length.toLocaleString("fr-FR");
  document.querySelector("#heroTotal").textContent = concepts.length.toLocaleString("fr-FR");
  document.querySelector("#chartTotal").textContent = `n = ${concepts.length.toLocaleString("fr-FR")}`;
  document.querySelector("#totalDomains").textContent = domains.length.toLocaleString("fr-FR");
  document.querySelector("#centralLegend").textContent = central.toLocaleString("fr-FR");
  document.querySelector("#interLegend").textContent = interdisciplinary.toLocaleString("fr-FR");
  const donut = document.querySelector("#relevanceDonut");
  donut.style.background =
    `conic-gradient(#dbc6a5 0 ${centralShare}%, var(--burgundy) ${centralShare}% 100%)`;
  donut.setAttribute("aria-label", `${central} centraux, ${interdisciplinary} interdisciplinaires`);

  domains.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    elements.domain.append(option);
  });
  [...new Set(concepts.map((item) => item.type_notice))].sort((a, b) => a.localeCompare(b, "fr"))
    .forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      elements.type.append(option);
    });

  const counts = domains
    .map((name, index) => ({
      name,
      count: concepts.filter((item) => item.domaine_principal === name).length,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.count - a.count);
  const max = counts[0]?.count || 1;
  document.querySelector("#bars").innerHTML = counts
    .map(
      (item) => `
        <div class="bar-row">
          <div class="bar-label"><span>${escapeHtml(item.name)}</span><strong>${item.count}</strong></div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${(item.count / max) * 100}%;background:${item.color}"></div>
          </div>
        </div>`,
    )
    .join("");

  renderTrend();
}

function renderTrend() {
  const min = 3500;
  const max = 6300;
  const points = editionSeries.map(([year, value], index) => ({
    year,
    value,
    x: 42 + (index / (editionSeries.length - 1)) * 676,
    y: 188 - ((value - min) / (max - min)) * 142,
  }));
  const grid = [4000, 5000, 6000]
    .map((value) => {
      const y = 188 - ((value - min) / (max - min)) * 142;
      return `
        <line x1="42" x2="718" y1="${y}" y2="${y}" class="trend-gridline"></line>
        <text x="34" y="${y + 4}" text-anchor="end" class="trend-y-label">${value.toLocaleString("fr-FR")}</text>`;
    })
    .join("");
  const dots = points
    .map(
      (item) => `
        <circle cx="${item.x}" cy="${item.y}" r="${item.year === 2026 ? 6 : 3.5}"
          class="trend-point${item.year === 2026 ? " latest" : ""}"></circle>
        <text x="${item.x}" y="216" text-anchor="middle" class="trend-year">${String(item.year).slice(2)}</text>`,
    )
    .join("");
  const first = points[0];
  const latest = points[points.length - 1];
  document.querySelector("#trendChart").innerHTML = `
    ${grid}
    <polyline points="${points.map((item) => `${item.x},${item.y}`).join(" ")}" class="trend-line"></polyline>
    ${dots}
    <text x="${first.x + 8}" y="${first.y - 12}" class="trend-value">3 741</text>
    <text x="${latest.x - 8}" y="${latest.y - 14}" text-anchor="end" class="trend-value latest">6 116</text>`;
}

function applyFilters() {
  const needle = normalize(elements.search.value.trim());
  filtered = concepts.filter((item) => {
    const haystack = normalize(
      `${item.concept} ${item.entree_complete} ${item.definition} ${item.domaine_principal} ${item.domaines_associes} ${item.type_notice} ${item.echelles_explicites?.join(" ")} ${item.milieux_explicites?.join(" ")}`,
    );
    return (
      (!needle || haystack.includes(needle)) &&
      (!elements.domain.value || item.domaine_principal === elements.domain.value) &&
      (!elements.type.value || item.type_notice === elements.type.value) &&
      (!elements.relevance.value || item.pertinence === elements.relevance.value)
    );
  });
  currentPage = 1;
  renderDirectory();
}

function renderDirectory() {
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  elements.count.textContent = filtered.length.toLocaleString("fr-FR");
  elements.reset.hidden = !(
    elements.search.value || elements.domain.value || elements.type.value || elements.relevance.value
  );
  elements.grid.hidden = visible.length === 0;
  elements.empty.hidden = visible.length !== 0;
  elements.pagination.hidden = filtered.length <= PAGE_SIZE;
  elements.previous.disabled = currentPage === 1;
  elements.next.disabled = currentPage === pageCount;
  elements.page.textContent = `Page ${currentPage.toLocaleString("fr-FR")} / ${pageCount.toLocaleString("fr-FR")}`;

  elements.grid.innerHTML = visible
    .map((item, index) => {
      const number = String((currentPage - 1) * PAGE_SIZE + index + 1).padStart(3, "0");
      const central = item.pertinence === "Central";
      return `
        <article class="concept-card" tabindex="0" data-index="${concepts.indexOf(item)}">
          <div class="concept-meta">
            <span>${escapeHtml(item.domaine_principal)}</span>
            <em class="${central ? "central" : ""}">${central ? "Concepts centraux" : "Interdisciplinaires"}</em>
          </div>
          <h3>${escapeHtml(item.concept)}</h3>
          <p>${escapeHtml(item.definition)}</p>
          <footer>
            <span>Page du PDF ${item.page_pdf}</span>
            <button type="button" aria-label="Lire la notice : ${escapeHtml(item.concept)}">Lire la notice ↗</button>
          </footer>
          <div class="card-number">${number}</div>
        </article>`;
    })
    .join("");
}

function openModal(item) {
  document.querySelector("#modalDomain").textContent = item.domaine_principal;
  document.querySelector("#modalTitle").textContent = item.concept;
  document.querySelector("#modalRelevance").textContent =
    item.pertinence === "Central" ? "Concepts centraux" : "Interdisciplinaires";
  document.querySelector("#modalPage").textContent = `Page du PDF ${item.page_pdf}`;
  document.querySelector("#modalDefinition").textContent = item.definition;
  document.querySelector("#modalRelated").textContent = item.domaines_associes.split("; ").join(" · ");
  document.querySelector("#modalSource").textContent = item.source;
  elements.modal.hidden = false;
  document.body.style.overflow = "hidden";
  elements.modalClose.focus();
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.style.overflow = "";
}

function resetFilters() {
  elements.search.value = "";
  elements.domain.value = "";
  elements.type.value = "";
  elements.relevance.value = "";
  applyFilters();
}

elements.search.addEventListener("input", applyFilters);
elements.domain.addEventListener("change", applyFilters);
elements.type.addEventListener("change", applyFilters);
elements.relevance.addEventListener("change", applyFilters);
elements.reset.addEventListener("click", resetFilters);
elements.emptyReset.addEventListener("click", resetFilters);
elements.previous.addEventListener("click", () => {
  currentPage = Math.max(1, currentPage - 1);
  renderDirectory();
  document.querySelector("#directory").scrollIntoView();
});
elements.next.addEventListener("click", () => {
  currentPage += 1;
  renderDirectory();
  document.querySelector("#directory").scrollIntoView();
});
elements.grid.addEventListener("click", (event) => {
  const card = event.target.closest(".concept-card");
  if (card) openModal(concepts[Number(card.dataset.index)]);
});
elements.grid.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".concept-card")) {
    event.preventDefault();
    openModal(concepts[Number(event.target.dataset.index)]);
  }
});
elements.modalClose.addEventListener("click", closeModal);
elements.modal.addEventListener("mousedown", (event) => {
  if (event.target === elements.modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.hidden) closeModal();
});

fetch("./data/concepts.json")
  .then((response) => {
    if (!response.ok) throw new Error("Impossible de charger les concepts.");
    return response.json();
  })
  .then((data) => {
    concepts = data;
    filtered = data;
    renderOverview();
    renderDirectory();
  })
  .catch(() => {
    elements.count.textContent = "0";
    elements.grid.innerHTML =
      '<div class="empty-state"><h3>Les données ne peuvent pas être chargées.</h3></div>';
  });
