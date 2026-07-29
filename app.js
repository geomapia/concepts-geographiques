const colors = [
  "#8b2e3f", "#2f6f6d", "#496a8a", "#a6672b", "#52623b",
  "#5d4b76", "#8b6f47", "#3d7187", "#75685b", "#9a4d45",
  "#4f7656", "#76506f",
];

let concepts = [];

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

}

fetch("./data/concepts.json?v=20260729-9", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error("Impossible de charger les concepts.");
    return response.json();
  })
  .then((data) => {
    concepts = data;
    renderOverview();
  })
  .catch(() => {
    document.querySelector("#bars").innerHTML =
      '<p class="load-error">Les données ne peuvent pas être chargées.</p>';
  });
