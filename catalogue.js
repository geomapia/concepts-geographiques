const PAGE_SIZE = 18;
const sourcePdf =
  "https://www.ffem.fr/sites/ffem/files/2026-03/dictionnaire_triplet_2026.pdf";

const pageType = document.body.dataset.noticeType || "";
let concepts = [];
let allNotices = [];
let filtered = [];
let currentPage = 1;
let currentLetter = "";
let englishTranslations = {};
let arabicTranslations = {};

const $ = (selector) => document.querySelector(selector);
const elements = {
  search: $("#search"),
  theme: $("#themeFilter"),
  scale: $("#scaleFilter"),
  milieu: $("#milieuFilter"),
  level: $("#levelFilter"),
  relevance: $("#relevanceFilter"),
  sort: $("#sortFilter"),
  grid: $("#noticeGrid"),
  count: $("#resultCount"),
  pagination: $("#pagination"),
  previous: $("#previousPage"),
  next: $("#nextPage"),
  page: $("#pageIndicator"),
  pageInput: $("#pageInput"),
  pageTotal: $("#pageTotal"),
  alphabet: $("#conceptAlphabet"),
  reset: $("#resetFilters"),
  export: $("#exportCsv"),
  modal: $("#modalBackdrop"),
  close: $("#modalClose"),
};

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'(){}\[\],.;:!?/\\_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function simplifiedToken(value) {
  if (value.length <= 4) return value;
  if (value.endsWith("aux")) return `${value.slice(0, -3)}al`;
  if (value.endsWith("es")) return value.slice(0, -2);
  if (value.endsWith("s") || value.endsWith("x")) return value.slice(0, -1);
  return value;
}

function differsByAtMostOne(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let left = 0;
  let right = 0;
  let differences = 0;
  while (left < a.length && right < b.length) {
    if (a[left] === b[right]) {
      left += 1;
      right += 1;
      continue;
    }
    differences += 1;
    if (differences > 1) return false;
    if (a.length > b.length) left += 1;
    else if (b.length > a.length) right += 1;
    else {
      left += 1;
      right += 1;
    }
  }
  return true;
}

function matchesSearch(corpus, query) {
  const normalizedCorpus = normalize(corpus);
  const normalizedQuery = normalize(query);
  if (!normalizedQuery || normalizedCorpus.includes(normalizedQuery)) return true;

  const corpusTokens = normalizedCorpus.split(" ").filter(Boolean);
  return normalizedQuery
    .split(" ")
    .filter(Boolean)
    .every((queryToken) => {
      const simpleQuery = simplifiedToken(queryToken);
      return corpusTokens.some((corpusToken) => {
        const simpleCorpus = simplifiedToken(corpusToken);
        return (
          corpusToken.startsWith(queryToken) ||
          simpleCorpus === simpleQuery ||
          (queryToken.length >= 5 && differsByAtMostOne(queryToken, corpusToken))
        );
      });
    });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlightSearch(value) {
  const text = String(value ?? "");
  const query = String(elements.search?.value || "").trim();
  if (!query) return escapeHtml(text);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try {
    return escapeHtml(text).replace(new RegExp(`(${escapedQuery})`, "gi"), "<mark>$1</mark>");
  } catch {
    return escapeHtml(text);
  }
}

function renderAlphabet() {
  if (!elements.alphabet) return;
  const letters = [...new Set(concepts.map((item) => normalize(item.concept).charAt(0).toUpperCase()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "fr"));
  elements.alphabet.innerHTML = [
    `<button type="button" data-letter="" class="${currentLetter ? "" : "active"}">Tous</button>`,
    ...letters.map((letter) => `<button type="button" data-letter="${escapeHtml(letter)}" class="${currentLetter === letter ? "active" : ""}">${escapeHtml(letter)}</button>`),
  ].join("");
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
  fillSelect(elements.level, unique(concepts.map((item) => item.niveau_conceptuel)));
}

function applyFilters() {
  const needle = normalize(elements.search?.value.trim());
  filtered = concepts.filter((item) => {
    const corpus =
      `${item.concept} ${item.entree_complete || ""} ${item.definition} ` +
      `${item.domaines_thematiques?.join(" ")} ${item.concepts_associes?.join(" ")} ` +
      `${item.fiche_specialisee?.sigles?.join(" ")} ${translationsFor(item).english} ${translationsFor(item).arabic}`;
    const initial = normalize(item.concept).charAt(0).toUpperCase();
    return (
      (!currentLetter || initial === currentLetter) &&
      (!needle || matchesSearch(corpus, needle)) &&
      (!elements.theme?.value || item.domaines_thematiques?.includes(elements.theme.value)) &&
      (!elements.scale?.value || item.echelles_explicites?.includes(elements.scale.value)) &&
      (!elements.milieu?.value || item.milieux_explicites?.includes(elements.milieu.value)) &&
      (!elements.level?.value || item.niveau_conceptuel === elements.level.value) &&
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
  if (needle && filtered.length === 0) {
    document.dispatchEvent(
      new CustomEvent("repertoire:search-no-result", {
        detail: { query: elements.search?.value.trim() || "" },
      }),
    );
  }
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
    item.niveau_conceptuel === "Fondamental" ? "Concept fondamental" : "",
    item.domaines_thematiques?.[0] || item.domaine_principal,
    item.echelles_explicites?.[0] || "",
    item.milieux_explicites?.[0] || "",
  ].filter(Boolean);
}

function officialLink(item) {
  const link = item.fiche_specialisee?.liens_officiels_mentions?.[0];
  if (!link) return null;
  if (typeof link === "string") return { label: "Site officiel", url: link };
  return link.url ? link : null;
}

function translationsFor(item) {
  const stored = item.traductions || {};
  const isConcept = item.type_notice === "Concept géographique";
  return {
    english: String(stored.en?.terme || englishTranslations[normalize(item.concept)] || "").trim(),
    arabic: isConcept
      ? String(stored.ar?.terme || arabicTranslations[normalize(item.concept)] || "").trim()
      : "",
    arabicDefinition: isConcept ? String(stored.ar?.definition || "").trim() : "",
  };
}


function citationFor(item) {
  const page = item.page_dictionnaire ?? Math.max(1, Number(item.page_pdf) - 1);
  return String(
    item.citation ||
      `Triplet, Patrick (2026). Dictionnaire encyclopédique de la diversité biologique et de la conservation de la nature, p. ${page}. Sélection et classification géographiques réalisées par Brahim Jaziri.`
  ).trim();
}

function shortenedDefinition(item, limit = 120) {
  const text = String(item.definition || "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= limit) {
    return { html: highlightSearch(text), truncated: false, url: "" };
  }
  const sourcePage = Math.max(1, Number(item.page_pdf));
  return {
    html: highlightSearch(words.slice(0, limit).join(" ")),
    truncated: true,
    url: `${sourcePdf}#page=${sourcePage}`,
  };
}

function arabicSuggestionUrl(item) {
  const url = new URL("./contact.html", window.location.href);
  url.searchParams.set("translation", "ar");
  url.searchParams.set("notice", item.concept);
  url.searchParams.set("page", item.page_pdf || "");
  return url.toString();
}

function render() {
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  elements.count.textContent = filtered.length.toLocaleString("fr-FR");
  elements.pagination.hidden = filtered.length <= PAGE_SIZE;
  elements.previous.disabled = currentPage === 1;
  elements.next.disabled = currentPage === pageCount;
  if (elements.page) elements.page.textContent = `Page ${currentPage} / ${pageCount}`;
  if (elements.pageInput) {
    elements.pageInput.value = currentPage;
    elements.pageInput.max = pageCount;
  }
  if (elements.pageTotal) elements.pageTotal.textContent = `/ ${pageCount}`;

  elements.grid.innerHTML = visible
    .map((item) => {
      const tags = metadata(item)
        .map((value) => `<span>${escapeHtml(value)}</span>`)
        .join("");
      const official = officialLink(item);
      const translations = translationsFor(item);
      const definitionPreview = shortenedDefinition(item);
      const hasArabicTranslation = Boolean(translations.arabic || translations.arabicDefinition);
      return `
        <article class="special-notice${item.niveau_conceptuel === "Fondamental" ? " fundamental-notice" : ""}" id="${slug(item.concept)}">
          <div class="notice-topline">
            <span>${escapeHtml(item.type_notice)}</span>
            <em>Dictionnaire p. ${item.page_dictionnaire ?? Math.max(1, Number(item.page_pdf) - 1)}</em>
          </div>
          <h2>${highlightSearch(item.concept)}</h2>
          ${translations.english ? `<p class="notice-translation"><strong>English:</strong> ${escapeHtml(translations.english)}</p>` : ""}
          ${translations.arabic ? `<p class="notice-translation notice-translation-ar" lang="ar" dir="rtl"><strong>العربية:</strong> ${escapeHtml(translations.arabic)}</p>` : ""}
          <div class="notice-tags">${tags}</div>
          <p>${definitionPreview.html}${definitionPreview.truncated ? `… <a class="definition-continuation" href="${escapeHtml(definitionPreview.url)}" target="_blank" rel="noreferrer">(suite dans le dictionnaire) ↗</a>` : ""}</p>
          <div class="notice-actions">
            <button type="button" data-action="open" data-concept="${escapeHtml(item.concept)}">Consulter la fiche</button>
            <button type="button" data-action="copy" data-concept="${escapeHtml(item.concept)}" aria-label="Copier la notice ${escapeHtml(item.concept)}">Copier</button>
            ${item.type_notice === "Concept géographique" && !hasArabicTranslation ? `<a href="${escapeHtml(arabicSuggestionUrl(item))}">Proposer une traduction arabe</a>` : ""}
            ${official ? `<a class="official-source-link" href="${escapeHtml(official.url)}" target="_blank" rel="noreferrer">${escapeHtml(official.label || "Site officiel")} ↗</a>` : ""}
          </div>
        </article>`;
    })
    .join("");
}

function detailRows(item) {
  const base = [
    ["Type de notice", item.type_notice],
    ["Page du dictionnaire", item.page_dictionnaire ?? Math.max(1, Number(item.page_pdf) - 1)],
    ["Domaines thématiques", item.domaines_thematiques?.join(" · ") || "Non précisé"],
    ["Échelles explicitement mentionnées", item.echelles_explicites?.join(" · ")],
    ["Milieux explicitement mentionnés", item.milieux_explicites?.join(" · ")],
    ["Pertinence géographique", item.pertinence],
    ["Niveau conceptuel", item.niveau_conceptuel || "Non précisé"],
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

function renderTranslations(item) {
  let panel = $("#modalTranslations");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "modalTranslations";
    panel.className = "modal-translations";
    $("#modalDefinition")?.insertAdjacentElement("afterend", panel);
  }
  const translations = translationsFor(item);
  const rows = [];
  if (translations.english) rows.push(["English term", translations.english, ""]);
  if (translations.arabic) rows.push(["المصطلح العربي", translations.arabic, 'lang="ar" dir="rtl"']);
  if (translations.arabicDefinition) rows.push(["تعريف عربي", translations.arabicDefinition, 'lang="ar" dir="rtl"']);
  panel.hidden = rows.length === 0;
  panel.innerHTML = rows.length
    ? `<h3>Traductions validées</h3><dl>${rows
        .map(([label, value, attributes]) => `<div><dt>${escapeHtml(label)}</dt><dd ${attributes}>${escapeHtml(value)}</dd></div>`)
        .join("")}</dl>`
    : "";
}

function openModal(item, updateUrl = true) {
  $("#modalType").textContent = item.type_notice;
  $("#modalTitle").textContent = item.concept;
  $("#modalDefinition").textContent = item.definition;
  renderTranslations(item);
  $("#modalDetails").innerHTML = detailRows(item)
    .map(
      ([label, value]) => `
        <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "Non précisé")}</dd></div>`,
    )
    .join("");
  renderRelatedConcepts(item);
  $("#modalCitation").textContent = citationFor(item);
  const sourcePage = Math.max(1, Number(item.page_pdf));
  // Le numéro technique du PDF est supérieur d’une unité au numéro imprimé.
  // page_pdf désigne déjà cette page technique et ouvre donc directement la notice.
  $("#modalPdf").href = `${sourcePdf}#page=${sourcePage}`;
  $("#modalPdf").textContent = `Voir le PDF (p. ${sourcePage}) ↗`;
  const official = officialLink(item);
  const modalOfficial = $("#modalOfficial");
  if (modalOfficial) {
    modalOfficial.hidden = !official;
    if (official) {
      modalOfficial.href = official.url;
      modalOfficial.textContent = `${official.label || "Site officiel"} ↗`;
    }
  }
  const correctionUrl = new URL("./contact.html", window.location.href);
  correctionUrl.searchParams.set("notice", item.concept);
  correctionUrl.searchParams.set("page", item.page_pdf);
  $("#modalReport").href = correctionUrl.toString();
  let translationLink = $("#modalArabicSuggestion");
  if (!translationLink) {
    translationLink = document.createElement("a");
    translationLink.id = "modalArabicSuggestion";
    translationLink.textContent = "Proposer une traduction arabe";
    $("#modalReport")?.insertAdjacentElement("afterend", translationLink);
  }
  const translations = translationsFor(item);
  translationLink.hidden = Boolean(translations.arabic || translations.arabicDefinition);
  translationLink.href = arabicSuggestionUrl(item);
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

function noticeTarget(item) {
  if (item.type_notice === "Indice ou indicateur") return "./indices.html";
  if (item.type_notice === "Convention, traité ou accord") return "./conventions.html";
  return "./concepts.html";
}

function renderRelatedConcepts(item) {
  let panel = $("#modalRelatedConcepts");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "modalRelatedConcepts";
    panel.className = "modal-related-concepts";
    const reference = elements.modal.querySelector(".modal-reference");
    reference?.insertAdjacentElement("beforebegin", panel);
  }

  const explicitRelated = [...new Set(item.concepts_associes || [])].filter(Boolean);
  const sameDomain = allNotices
    .filter(
      (candidate) =>
        normalize(candidate.concept) !== normalize(item.concept) &&
        candidate.type_notice === item.type_notice &&
        (
          candidate.domaine_principal === item.domaine_principal ||
          candidate.domaines_thematiques?.some((domain) =>
            item.domaines_thematiques?.includes(domain),
          )
        ),
    )
    .sort(
      (a, b) =>
        Number(b.niveau_conceptuel === "Fondamental") -
          Number(a.niveau_conceptuel === "Fondamental") ||
        a.concept.localeCompare(b.concept, "fr"),
    )
    .slice(0, 6)
    .map((candidate) => candidate.concept);
  const related = explicitRelated.length ? explicitRelated : sameDomain;
  panel.hidden = related.length === 0;
  if (!related.length) {
    panel.innerHTML = "";
    return;
  }

  panel.innerHTML = `
    <h3>${explicitRelated.length ? "Concepts associés" : "Notices du même domaine"}</h3>
    <div>
      ${related
        .map((name) => {
          const target = allNotices.find(
            (candidate) => normalize(candidate.concept) === normalize(name),
          );
          if (!target) return `<span>${escapeHtml(name)}</span>`;
          const url = new URL(noticeTarget(target), window.location.href);
          url.searchParams.set("notice", target.concept);
          return `<a href="${escapeHtml(url.toString())}">${escapeHtml(name)} ↗</a>`;
        })
        .join("")}
    </div>`;
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.style.overflow = "";
  const url = new URL(window.location.href);
  url.searchParams.delete("notice");
  history.replaceState({}, "", url);
}

async function copyText(value, button) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
  } else {
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  const previous = button.textContent;
  button.textContent = "Copié ✓";
  setTimeout(() => {
    button.textContent = previous;
  }, 1400);
}

function noticeText(item) {
  const translations = translationsFor(item);
  return [
    item.concept,
    translations.english ? `English: ${translations.english}` : "",
    translations.arabic ? `العربية: ${translations.arabic}` : "",
    item.definition,
    `Source : ${item.source}`,
    `Page du PDF : ${item.page_pdf}`,
  ].join("\n\n");
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
    citationFor(item),
  ]);
  const csv = `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(";")).join("\n")}`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `${document.body.dataset.exportName || "repertoire-geographique"}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

elements.grid.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-concept]");
  if (!button) return;
  const item = concepts.find((candidate) => candidate.concept === button.dataset.concept);
  if (!item) return;
  if (button.dataset.action === "copy") await copyText(noticeText(item), button);
  if (button.dataset.action === "open") openModal(item);
});

[elements.search, elements.theme, elements.scale, elements.milieu, elements.level, elements.relevance, elements.sort]
  .filter(Boolean)
  .forEach((element) => element.addEventListener(element.tagName === "INPUT" ? "input" : "change", applyFilters));

function goToRequestedPage(input) {
  if (!input) return;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requested = Math.max(1, Math.min(pageCount, Number.parseInt(input.value, 10) || 1));
  currentPage = requested;
  render();
  scrollTo({ top: 0, behavior: "smooth" });
}

if (elements.pageInput) {
  elements.pageInput.addEventListener("change", () => goToRequestedPage(elements.pageInput));
  elements.pageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") goToRequestedPage(elements.pageInput);
  });
}

if (elements.alphabet) {
  elements.alphabet.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-letter]");
    if (!button) return;
    currentLetter = button.dataset.letter || "";
    renderAlphabet();
    applyFilters();
  });
}

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
  [elements.search, elements.theme, elements.scale, elements.milieu, elements.level, elements.relevance]
    .filter(Boolean)
    .forEach((element) => {
      element.value = "";
    });
  if (elements.sort) elements.sort.value = "alpha";
  currentLetter = "";
  renderAlphabet();
  applyFilters();
});
elements.export.addEventListener("click", exportCsv);
elements.close.addEventListener("click", closeModal);
elements.modal.addEventListener("mousedown", (event) => {
  if (event.target === elements.modal) closeModal();
});
$("#modalCopyCitation").addEventListener("click", (event) => {
  const item = concepts.find((candidate) => candidate.concept === event.currentTarget.dataset.concept);
  if (item) copyText(String(item.definition || "").trim(), event.currentTarget);
});
$("#modalCopyLink").addEventListener("click", (event) => {
  const item = concepts.find((candidate) => candidate.concept === event.currentTarget.dataset.concept);
  if (item) copyText(permalink(item), event.currentTarget);
});
$("#printPage").addEventListener("click", () => window.print());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.hidden) closeModal();
});

Promise.all([
  fetch("./data/concepts.json?v=20260801-1", { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error("Données indisponibles.");
    return response.json();
  }),
  fetch("./data/traductions-en.json?v=20260730-1", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : {}))
    .catch(() => ({})),
  fetch("./data/traductions-ar.json?v=20260730-1", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : {}))
    .catch(() => ({})),
])
  .then(([data, translations, translationsAr]) => {
    englishTranslations = translations.english || {};
    arabicTranslations = translationsAr.arabic || {};
    allNotices = data;
    concepts = data.filter((item) => !pageType || item.type_notice === pageType);
    filtered = [...concepts];
    $("#catalogueTotal").textContent = concepts.length.toLocaleString("fr-FR");
    initializeFilters();
    renderAlphabet();
    applyFilters();

    const requested = new URLSearchParams(location.search).get("notice");
    const item = concepts.find((candidate) => candidate.concept === requested);
    if (item) openModal(item, false);
  })
  .catch((error) => {
    elements.grid.innerHTML = `<p class="load-error">${escapeHtml(error.message)}</p>`;
  });
