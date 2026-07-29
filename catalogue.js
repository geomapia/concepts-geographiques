const PAGE_SIZE = 18;
const sourcePdf =
  "https://www.ffem.fr/sites/ffem/files/2026-03/dictionnaire_triplet_2026.pdf";

const pageType = document.body.dataset.noticeType || "";
let concepts = [];
let filtered = [];
let currentPage = 1;

const $ = (selector) => document.querySelector(selector);
const elements = {
  search: $("#search"),
  theme: $("#themeFilter"),
  scale: $("#scaleFilter"),
  milieu: $("#milieuFilter"),
  relevance: $("#relevanceFilter"),
  sort: $("#sortFilter"),
  grid: $("#noticeGrid"),
  count: $("#resultCount"),
  pagination: $("#pagination"),
  previous: $("#previousPage"),
  next: $("#nextPage"),
  page: $("#pageIndicator"),
  reset: $("#resetFilters"),
  export: $("#exportCsv"),
  modal: $("#modalBackdrop"),
  close: $("#modalClose"),
};

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slug(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
}

function fillSelect(select, values) {
  if (!select) return;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function initializeFilters() {
  fillSelect(elements.theme, unique(concepts.flatMap((item) => item.domaines_thematiques || [])));
  fillSelect(elements.scale, unique(concepts.flatMap((item) => item.echelles_explicites || [])));
  fillSelect(elements.milieu, unique(concepts.flatMap((item) => item.milieux_explicites || [])));
}

function applyFilters() {
  const needle = normalize(elements.search?.value.trim());
  filtered = concepts.filter((item) => {
    const corpus = normalize(
      `${item.concept} ${item.definition} ${item.domaines_thematiques?.join(" ")} ${item.fiche_specialisee?.sigles?.join(" ")}`,
    );
    return (
      (!needle || corpus.includes(needle)) &&
      (!elements.theme?.value || item.domaines_thematiques?.includes(elements.theme.value)) &&
      (!elements.scale?.value || item.echelles_explicites?.includes(elements.scale.value)) &&
      (!elements.milieu?.value || item.milieux_explicites?.includes(elements.milieu.value)) &&
      (!elements.relevance?.value || item.pertinence === elements.relevance.value)
    );
  });

  const order = elements.sort?.value || "alpha";
  filtered.sort((a, b) => {
    if (order === "page") return Number(a.page_pdf) - Number(b.page_pdf);
    if (order === "theme") {
      return String(a.domaines_thematiques?.[0] || "").localeCompare(
        String(b.domaines_thematiques?.[0] || ""),
        "fr",
      );
    }
    if (order === "year") {
      const yearA = Number(a.fiche_specialisee?.reperes_chronologiques?.[0] || 9999);
      const yearB = Number(b.fiche_specialisee?.reperes_chronologiques?.[0] || 9999);
      return yearA - yearB || a.concept.localeCompare(b.concept, "fr");
    }
    return a.concept.localeCompare(b.concept, "fr");
  });

  currentPage = 1;
  render();
}

function metadata(item) {
  if (pageType === "Indice ou indicateur") {
    const details = item.fiche_specialisee || {};
    return [
      details.sigles?.length ? `Sigle : ${details.sigles.join(", ")}` : "",
      details.formule_mentionnee ? "Calcul ou formule mentionné" : "Formule non explicitée",
      details.unites_mentionnees?.length ? `Unités : ${details.unites_mentionnees.join(", ")}` : "",
    ].filter(Boolean);
  }
  if (pageType === "Convention, traité ou accord") {
    const details = item.fiche_specialisee || {};
    return [
      details.type_instrument,
      details.reperes_chronologiques?.length
        ? `Repères : ${details.reperes_chronologiques.join(", ")}`
        : "Date non précisée",
      details.organismes_mentions?.[0] || "",
    ].filter(Boolean);
  }
  return [
    item.domaines_thematiques?.[0] || item.domaine_principal,
    item.echelles_explicites?.[0] || "",
    item.milieux_explicites?.[0] || "",
  ].filter(Boolean);
}

function render() {
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  elements.count.textContent = filtered.length.toLocaleString("fr-FR");
  elements.pagination.hidden = filtered.length <= PAGE_SIZE;
  elements.previous.disabled = currentPage === 1;
  elements.next.disabled = currentPage === pageCount;
  elements.page.textContent = `Page ${currentPage} / ${pageCount}`;

  elements.grid.innerHTML = visible
    .map((item) => {
      const tags = metadata(item)
        .map((value) => `<span>${escapeHtml(value)}</span>`)
        .join("");
      return `
        <article class="special-notice" id="${slug(item.concept)}">
          <div class="notice-topline">
            <span>${escapeHtml(item.type_notice)}</span>
            <em>PDF p. ${item.page_pdf}</em>
          </div>
          <h2>${escapeHtml(item.concept)}</h2>
          <div class="notice-tags">${tags}</div>
          <p>${escapeHtml(item.definition)}</p>
          <div class="notice-actions">
            <button type="button" data-action="open" data-concept="${escapeHtml(item.concept)}">Consulter la fiche</button>
            <button type="button" data-action="cite" data-concept="${escapeHtml(item.concept)}">Copier la citation</button>
          </div>
        </article>`;
    })
    .join("");
}

function detailRows(item) {
  const base = [
    ["Type de notice", item.type_notice],
    ["Domaines thématiques", item.domaines_thematiques?.join(" · ") || "Non précisé"],
    ["Échelles explicitement mentionnées", item.echelles_explicites?.join(" · ")],
    ["Milieux explicitement mentionnés", item.milieux_explicites?.join(" · ")],
    ["Pertinence géographique", item.pertinence],
  ];

  if (item.type_notice === "Indice ou indicateur") {
    const details = item.fiche_specialisee || {};
    base.push(
      ["Sigle(s)", details.sigles?.join(", ") || "Non précisé"],
      ["Calcul ou formule dans la notice", details.formule_mentionnee ? "Oui" : "Non explicitement détecté"],
      ["Unités mentionnées", details.unites_mentionnees?.join(", ") || "Non précisées"],
      ["Interprétation", details.interpretation],
    );
  }

  if (item.type_notice === "Convention, traité ou accord") {
    const details = item.fiche_specialisee || {};
    base.push(
      ["Type d’instrument", details.type_instrument],
      ["Repères chronologiques", details.reperes_chronologiques?.join(", ") || "Non précisés"],
      ["Organismes mentionnés", details.organismes_mentions?.join(" · ") || "Non précisés"],
    );
  }
  return base;
}

function openModal(item, updateUrl = true) {
  $("#modalType").textContent = item.type_notice;
  $("#modalTitle").textContent = item.concept;
  $("#modalDefinition").textContent = item.definition;
  $("#modalDetails").innerHTML = detailRows(item)
    .map(
      ([label, value]) => `
        <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "Non précisé")}</dd></div>`,
    )
    .join("");
  $("#modalCitation").textContent = item.citation;
  $("#modalPdf").href = item.lien_source_pdf || `${sourcePdf}#page=${item.page_pdf}`;
  $("#modalReport").href =
    `mailto:jaziribrahim@gmail.com?subject=${encodeURIComponent(`Correction Atlas — ${item.concept}`)}`;
  $("#modalCopyCitation").dataset.concept = item.concept;
  $("#modalCopyLink").dataset.concept = item.concept;
  elements.modal.hidden = false;
  document.body.style.overflow = "hidden";
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("notice", item.concept);
    history.replaceState({}, "", url);
  }
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.style.overflow = "";
  const url = new URL(window.location.href);
  url.searchParams.delete("notice");
  history.replaceState({}, "", url);
}

async function copyText(value, button) {
  await navigator.clipboard.writeText(value);
  const previous = button.textContent;
  button.textContent = "Copié ✓";
  setTimeout(() => {
    button.textContent = previous;
  }, 1400);
}

function permalink(item) {
  const url = new URL(window.location.href);
  url.searchParams.set("notice", item.concept);
  return url.toString();
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportCsv() {
  const header = [
    "Concept", "Type", "Définition", "Domaines", "Échelles", "Milieux",
    "Pertinence", "Page PDF", "Citation",
  ];
  const rows = filtered.map((item) => [
    item.concept,
    item.type_notice,
    item.definition,
    item.domaines_thematiques?.join("; "),
    item.echelles_explicites?.join("; "),
    item.milieux_explicites?.join("; "),
    item.pertinence,
    item.page_pdf,
    item.citation,
  ]);
  const csv = `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n")}`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `${document.body.dataset.exportName || "atlas-concepts"}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

elements.grid.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-concept]");
  if (!button) return;
  const item = concepts.find((candidate) => candidate.concept === button.dataset.concept);
  if (!item) return;
  if (button.dataset.action === "cite") await copyText(item.citation, button);
  if (button.dataset.action === "open") openModal(item);
});

[elements.search, elements.theme, elements.scale, elements.milieu, elements.relevance, elements.sort]
  .filter(Boolean)
  .forEach((element) => element.addEventListener(element.tagName === "INPUT" ? "input" : "change", applyFilters));

elements.previous.addEventListener("click", () => {
  currentPage -= 1;
  render();
  scrollTo({ top: 0, behavior: "smooth" });
});
elements.next.addEventListener("click", () => {
  currentPage += 1;
  render();
  scrollTo({ top: 0, behavior: "smooth" });
});
elements.reset.addEventListener("click", () => {
  [elements.search, elements.theme, elements.scale, elements.milieu, elements.relevance]
    .filter(Boolean)
    .forEach((element) => {
      element.value = "";
    });
  if (elements.sort) elements.sort.value = "alpha";
  applyFilters();
});
elements.export.addEventListener("click", exportCsv);
elements.close.addEventListener("click", closeModal);
elements.modal.addEventListener("mousedown", (event) => {
  if (event.target === elements.modal) closeModal();
});
$("#modalCopyCitation").addEventListener("click", (event) => {
  const item = concepts.find((candidate) => candidate.concept === event.currentTarget.dataset.concept);
  if (item) copyText(item.citation, event.currentTarget);
});
$("#modalCopyLink").addEventListener("click", (event) => {
  const item = concepts.find((candidate) => candidate.concept === event.currentTarget.dataset.concept);
  if (item) copyText(permalink(item), event.currentTarget);
});
$("#printPage").addEventListener("click", () => window.print());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.hidden) closeModal();
});

fetch("./data/concepts.json")
  .then((response) => {
    if (!response.ok) throw new Error("Données indisponibles.");
    return response.json();
  })
  .then((data) => {
    concepts = data.filter((item) => !pageType || item.type_notice === pageType);
    filtered = [...concepts];
    $("#catalogueTotal").textContent = concepts.length.toLocaleString("fr-FR");
    initializeFilters();
    applyFilters();

    const requested = new URLSearchParams(location.search).get("notice");
    const item = concepts.find((candidate) => candidate.concept === requested);
    if (item) openModal(item, false);
  })
  .catch((error) => {
    elements.grid.innerHTML = `<p class="load-error">${escapeHtml(error.message)}</p>`;
  });
