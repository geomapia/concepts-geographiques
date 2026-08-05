const colors = [
  "#8b2e3f", "#2f6f6d", "#496a8a", "#a6672b", "#52623b",
  "#5d4b76", "#8b6f47", "#3d7187", "#75685b", "#9a4d45",
  "#4f7656", "#76506f",
];

let concepts = [];
let allNotices = [];
let totalNotices = 0;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderOverview() {
  const indicators = allNotices.filter(
    (item) => item.type_notice === "Indice ou indicateur",
  ).length;
  const conventions = allNotices.filter(
    (item) => item.type_notice === "Convention, traité ou accord",
  ).length;

  [
    ["#heroConceptCountText", concepts.length],
    ["#portalConceptCount", concepts.length],
    ["#portalIndicatorCount", indicators],
    ["#portalConventionCount", conventions],
  ].forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = Number(value).toLocaleString("fr-FR");
  });

  const counts = [...new Set(concepts.map((item) => item.domaine_principal))]
    .map((name, index) => ({
      name,
      count: concepts.filter((item) => item.domaine_principal === name).length,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.count - a.count);

  renderRadialDomainChart(counts);
}

function renderRadialDomainChart(counts) {
  const chart = document.querySelector("#domainRadialChart");
  const tooltip = document.querySelector("#domainChartTooltip");
  if (!chart) return;

  const width = 560;
  const height = 560;
  const cx = width / 2;
  const cy = height / 2;
  const inner = 88;
  const maxOuter = 238;
  const max = counts[0]?.count || 1;
  const gap = 0.018;
  const step = (Math.PI * 2) / Math.max(counts.length, 1);

  const polar = (radius, angle) => [
    cx + Math.cos(angle) * radius,
    cy + Math.sin(angle) * radius,
  ];

  const wedge = (r0, r1, a0, a1) => {
    const [x1, y1] = polar(r1, a0);
    const [x2, y2] = polar(r1, a1);
    const [x3, y3] = polar(r0, a1);
    const [x4, y4] = polar(r0, a0);
    const large = a1 - a0 > Math.PI ? 1 : 0;

    return [
      `M ${x1} ${y1}`,
      `A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${r0} ${r0} 0 ${large} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");
  };

  const paths = counts.map((item, index) => {
    const a0 = -Math.PI / 2 + index * step + gap;
    const a1 = -Math.PI / 2 + (index + 1) * step - gap;
    const outer = inner + 45 + (item.count / max) * (maxOuter - inner - 45);

    return `
      <path
        class="radial-domain-bar"
        d="${wedge(inner, outer, a0, a1)}"
        fill="${item.color}"
        tabindex="0"
        data-domain="${escapeHtml(item.name)}"
        data-count="${item.count}"
        aria-label="${escapeHtml(item.name)} : ${item.count.toLocaleString("fr-FR")} concepts">
      </path>`;
  }).join("");

  chart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}"
         role="img"
         aria-label="Répartition circulaire des concepts par domaine">
      <circle cx="${cx}" cy="${cy}" r="${maxOuter}" class="radial-guide"/>
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="${inner}" class="radial-center"/>
      <text x="${cx}" y="${cy - 8}" class="radial-total">
        ${concepts.length.toLocaleString("fr-FR")}
      </text>
      <text x="${cx}" y="${cy + 18}" class="radial-caption">concepts</text>
    </svg>`;

  const showTooltip = (event, path) => {
    if (!tooltip) return;

    const domain = path.dataset.domain || "";
    const count = Number(path.dataset.count || 0);

    tooltip.innerHTML = `
      <strong>${escapeHtml(domain)}</strong>
      <span>${count.toLocaleString("fr-FR")} concepts</span>`;

    tooltip.hidden = false;

    const stage = chart.closest(".domain-chart-stage");
    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    const sourceRect = path.getBoundingClientRect();

    let left = sourceRect.left + sourceRect.width / 2 - stageRect.left;
    let top = sourceRect.top - stageRect.top - 12;

    if (event?.clientX) {
      left = event.clientX - stageRect.left;
      top = event.clientY - stageRect.top - 16;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  const hideTooltip = () => {
    if (tooltip) tooltip.hidden = true;
  };

  chart.querySelectorAll(".radial-domain-bar").forEach((path) => {
    path.addEventListener("pointerenter", (event) => showTooltip(event, path));
    path.addEventListener("pointermove", (event) => showTooltip(event, path));
    path.addEventListener("pointerleave", hideTooltip);
    path.addEventListener("focus", (event) => showTooltip(event, path));
    path.addEventListener("blur", hideTooltip);
  });
}

fetch("./data/concepts.json?v=20260730-3", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error("Impossible de charger les concepts.");
    return response.json();
  })
  .then((data) => {
    allNotices = data;
    totalNotices = data.length;
    concepts = data.filter((item) => item.type_notice === "Concept géographique");
    renderOverview();
  })
  .catch(() => {
    const chart = document.querySelector("#domainRadialChart");
    if (chart) chart.innerHTML = '<p class="load-error">Les données ne peuvent pas être chargées.</p>';
  });
