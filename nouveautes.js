(function () {
  "use strict";

  const list = document.querySelector("#newsList");
  const count = document.querySelector("#newsCount");
  const total = document.querySelector("#newsTotal");
  const typeFilter = document.querySelector("#newsType");
  let notices = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function noticeDate(item) {
    return (
      item.validation_editoriale?.date_validation ||
      item.date_validation ||
      item.date_publication ||
      ""
    );
  }

  function targetPage(item) {
    if (item.type_notice === "Indice ou indicateur") return "./indices.html";
    if (item.type_notice === "Convention, traité ou accord") return "./conventions.html";
    return "./concepts.html";
  }

  function formatDate(value) {
    if (!value) return "Date non renseignée";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function render() {
    const selected = typeFilter.value;
    const filtered = notices.filter(
      (item) => !selected || item.type_notice === selected,
    );
    count.textContent = filtered.length.toLocaleString("fr-FR");

    if (!filtered.length) {
      list.innerHTML = `
        <div class="news-empty">
          <strong>Aucune nouveauté dans cette rubrique</strong>
          <p>Les prochaines notices validées apparaîtront automatiquement ici.</p>
        </div>`;
      return;
    }

    list.innerHTML = filtered
      .map((item) => {
        const url = new URL(targetPage(item), window.location.href);
        url.searchParams.set("notice", item.concept);
        return `
          <article class="news-card">
            <div class="news-date">
              <span>Publication</span>
              <strong>${escapeHtml(formatDate(noticeDate(item)))}</strong>
            </div>
            <div class="news-main">
              <p>${escapeHtml(item.type_notice || "Notice")}</p>
              <h2>${escapeHtml(item.concept)}</h2>
              <span>${escapeHtml(item.domaine_principal || item.domaines_thematiques?.[0] || "Domaine non précisé")}</span>
              <p class="news-definition">${escapeHtml(item.definition)}</p>
            </div>
            <a href="${escapeHtml(url.toString())}">Consulter la fiche ↗</a>
          </article>`;
      })
      .join("");
  }

  typeFilter.addEventListener("change", render);

  fetch("./data/concepts.json?v=20260730-4", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Les nouveautés sont indisponibles.");
      return response.json();
    })
    .then((data) => {
      notices = data
        .filter((item) => noticeDate(item))
        .sort(
          (a, b) =>
            String(noticeDate(b)).localeCompare(String(noticeDate(a))) ||
            String(a.concept).localeCompare(String(b.concept), "fr"),
        );
      total.textContent = notices.length.toLocaleString("fr-FR");
      render();
    })
    .catch((error) => {
      total.textContent = "0";
      count.textContent = "0";
      list.innerHTML = `<p class="load-error">${escapeHtml(error.message)}</p>`;
    });
})();
