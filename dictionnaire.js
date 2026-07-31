const PAGE_SIZE = 60;

let entries = [];
let filteredEntries = [];
let repertoireEntries = [];
let repertoireByKey = new Map();
let repertoireByHeading = new Map();
let currentPage = 1;
let currentLetter = "";

const search = document.querySelector("#dictionarySearch");
const sort = document.querySelector("#dictionarySort");
const list = document.querySelector("#dictionaryList");
const count = document.querySelector("#dictionaryCount");
const pagination = document.querySelector("#dictionaryPagination");
const previous = document.querySelector("#dictionaryPrevious");
const next = document.querySelector("#dictionaryNext");
const pageIndicator = document.querySelector("#dictionaryPage");
const pageInput = document.querySelector("#dictionaryPageInput");
const pageTotal = document.querySelector("#dictionaryPageTotal");
const alphabet = document.querySelector("#alphabetFilter");

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

function repertoireTarget(item) {
  if (item.type_notice === "Indice ou indicateur") return "./indices.html";
  if (item.type_notice === "Convention, traité ou accord") return "./conventions.html";
  return "./concepts.html";
}

function repertoireLabel(item) {
  if (item.type_notice === "Indice ou indicateur") return "Voir dans les indices";
  if (item.type_notice === "Convention, traité ou accord") return "Voir dans les conventions";
  return "Voir dans les concepts";
}

function indexRepertoire() {
  repertoireByKey = new Map();
  repertoireByHeading = new Map();
  repertoireEntries.forEach((item) => {
    const key = normalize(item.concept);
    if (!repertoireByKey.has(key)) repertoireByKey.set(key, []);
    repertoireByKey.get(key).push(item);
    const heading = normalize(item.entree_complete);
    if (!repertoireByHeading.has(heading)) repertoireByHeading.set(heading, []);
    repertoireByHeading.get(heading).push(item);
  });
}

function relatedNotices(entry) {
  const exact = repertoireByKey.get(normalize(entry.concept)) || [];
  const sameHeading = repertoireByHeading.get(normalize(entry.entree_complete)) || [];
  return [...new Map([...exact, ...sameHeading].map((item) => [
    `${item.type_notice}|${item.concept}`,
    item,
  ])).values()];
}

function repertoireUrl(item) {
  const url = new URL(repertoireTarget(item), window.location.href);
  url.searchParams.set("notice", item.concept);
  return url.toString();
}

function suggestionUrl(entry) {
  const url = new URL("./contact.html", window.location.href);
  url.searchParams.set("suggestion", entry.concept);
  url.searchParams.set("page", entry.page_pdf);
  return url.toString();
}

function renderAlphabet() {
  const letters = [...new Set(entries.map((entry) => entry.initiale))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  alphabet.innerHTML = [
    '<button type="button" data-letter="" class="active">Tous</button>',
    ...letters.map(
      (letter) =>
        `<button type="button" data-letter="${escapeHtml(letter)}">${escapeHtml(letter)}</button>`,
    ),
  ].join("");
}

function applyFilters() {
  const needle = normalize(search.value.trim());
  filteredEntries = entries.filter(
    (entry) =>
      (!currentLetter || entry.initiale === currentLetter) &&
      (!needle ||
        matchesSearch(`${entry.concept} ${entry.entree_complete}`, needle)),
  );

  if (sort.value === "page") {
    filteredEntries.sort(
      (a, b) => a.page_pdf - b.page_pdf || a.id.localeCompare(b.id),
    );
  } else {
    filteredEntries.sort(
      (a, b) =>
        a.concept.localeCompare(b.concept, "fr") ||
        a.page_pdf - b.page_pdf,
    );
  }
  currentPage = 1;
  render();
  if (needle && filteredEntries.length === 0) {
    document.dispatchEvent(
      new CustomEvent("repertoire:search-no-result", {
        detail: { query: search.value.trim() },
      }),
    );
  }
}

function render() {
  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, pageCount);
  const visible = filteredEntries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  count.textContent = filteredEntries.length.toLocaleString("fr-FR");
  pagination.hidden = filteredEntries.length <= PAGE_SIZE;
  previous.disabled = currentPage === 1;
  next.disabled = currentPage === pageCount;
  if (pageIndicator) pageIndicator.textContent = `Page ${currentPage} / ${pageCount}`;
  if (pageInput) {
    pageInput.value = currentPage;
    pageInput.max = pageCount;
  }
  if (pageTotal) pageTotal.textContent = `/ ${pageCount}`;

  if (!visible.length) {
    list.innerHTML =
      '<div class="dictionary-empty"><strong>Aucun intitulé trouvé</strong><span>Modifiez la recherche ou choisissez une autre lettre.</span></div>';
    return;
  }

  list.innerHTML = visible
    .map((entry) => {
      const related = relatedNotices(entry);
      const repertoireActions = related.length
        ? `<div class="dictionary-related">
            ${related.map((item) => `
              <a href="${escapeHtml(repertoireUrl(item))}">
                ${escapeHtml(repertoireLabel(item))} ↗
              </a>`).join("")}
           </div>`
        : `<a class="dictionary-suggest" href="${escapeHtml(suggestionUrl(entry))}">
             Suggérer l’ajout au Répertoire ↗
           </a>`;
      return `
        <article class="dictionary-entry">
          <div class="dictionary-entry-number">${escapeHtml(entry.id.replace("notice-", ""))}</div>
          <div>
            <h2>${escapeHtml(entry.concept)}</h2>
            <p>${escapeHtml(entry.entree_complete)}</p>
          </div>
          <div class="dictionary-entry-page">
            <span>Page du dictionnaire ${entry.page_dictionnaire}</span>
            <a href="${escapeHtml(entry.lien_source_pdf)}" target="_blank" rel="noreferrer">
              Ouvrir la page contenant le terme · PDF p. ${entry.page_ouverte} ↗
            </a>
            <button type="button" data-copy="${escapeHtml(entry.lien_source_pdf)}">Copier le lien</button>
            ${repertoireActions}
          </div>
        </article>`;
    })
    .join("");
}

async function copyLink(value, button) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  const label = button.textContent;
  button.textContent = "Lien copié ✓";
  setTimeout(() => {
    button.textContent = label;
  }, 1400);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportCsv() {
  const rows = [
    ["Concept", "Entrée complète", "Page du dictionnaire", "Page PDF ouverte", "Lien PDF", "Présent dans le Répertoire"],
    ...filteredEntries.map((entry) => [
      entry.concept,
      entry.entree_complete,
      entry.page_dictionnaire,
      entry.page_ouverte,
      entry.lien_source_pdf,
      relatedNotices(entry).length ? "Oui" : "Non",
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  link.download = "index-integral-dictionnaire-triplet-2026.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

search.addEventListener("input", applyFilters);
sort.addEventListener("change", applyFilters);
alphabet.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-letter]");
  if (!button) return;
  currentLetter = button.dataset.letter;
  alphabet.querySelectorAll("button").forEach((candidate) => {
    candidate.classList.toggle("active", candidate === button);
  });
  applyFilters();
});
list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-copy]");
  if (button) copyLink(button.dataset.copy, button);
});
function goToRequestedPage() {
  if (!pageInput) return;
  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  currentPage = Math.max(1, Math.min(pageCount, Number.parseInt(pageInput.value, 10) || 1));
  render();
  scrollTo({ top: 0, behavior: "smooth" });
}

if (pageInput) {
  pageInput.addEventListener("change", goToRequestedPage);
  pageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") goToRequestedPage();
  });
}

previous.addEventListener("click", () => {
  currentPage -= 1;
  render();
  scrollTo({ top: 0, behavior: "smooth" });
});
next.addEventListener("click", () => {
  currentPage += 1;
  render();
  scrollTo({ top: 0, behavior: "smooth" });
});
document.querySelector("#dictionaryReset").addEventListener("click", () => {
  search.value = "";
  sort.value = "alpha";
  currentLetter = "";
  renderAlphabet();
  applyFilters();
});
document.querySelector("#dictionaryExport").addEventListener("click", exportCsv);

async function fetchJson(paths) {
  for (const path of paths) {
    const response = await fetch(path, { cache: "no-store" });
    if (response.ok) return response.json();
  }
  throw new Error("Index indisponible.");
}

Promise.all([
  fetchJson([
    "./data/dictionnaire.json?v=20260730-3",
    "./dictionnaire.json?v=20260730-3",
  ]),
  fetchJson(["./data/concepts.json?v=20260730-3"]),
])
  .then(([dictionaryData, repertoireData]) => {
    entries = dictionaryData;
    repertoireEntries = repertoireData;
    indexRepertoire();
    filteredEntries = [...entries];
    document.querySelector("#dictionaryTotal").textContent =
      entries.length.toLocaleString("fr-FR");
    renderAlphabet();
    const requestedSearch = new URLSearchParams(window.location.search).get("recherche");
    if (requestedSearch) search.value = requestedSearch;
    applyFilters();
  })
  .catch((error) => {
    list.innerHTML = `<p class="load-error">${escapeHtml(error.message)}</p>`;
  });
