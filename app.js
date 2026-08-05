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
  const legend = document.querySelector("#domainLegend");
  if (!chart || !legend) return;

  const width = 520;
  const height = 520;
  const cx = width / 2;
  const cy = height / 2;
  const inner = 78;
  const maxOuter = 215;
  const max = counts[0]?.count || 1;
  const gap = 0.025;
  const step = (Math.PI * 2) / Math.max(counts.length, 1);

  const polar = (radius, angle) => [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  const wedge = (r0, r1, a0, a1) => {
    const [x1,y1] = polar(r1,a0), [x2,y2] = polar(r1,a1), [x3,y3] = polar(r0,a1), [x4,y4] = polar(r0,a0);
    const large = a1-a0 > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 ${large} 0 ${x4} ${y4} Z`;
  };

  const paths = counts.map((item,index) => {
    const a0 = -Math.PI/2 + index*step + gap;
    const a1 = -Math.PI/2 + (index+1)*step - gap;
    const outer = inner + 42 + (item.count/max)*(maxOuter-inner-42);
    return `<path class="radial-domain-bar" d="${wedge(inner,outer,a0,a1)}" fill="${item.color}" tabindex="0"><title>${escapeHtml(item.name)} : ${item.count}</title></path>`;
  }).join("");

  chart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Répartition circulaire des concepts par domaine">
      <circle cx="${cx}" cy="${cy}" r="${maxOuter}" class="radial-guide"/>
      <circle cx="${cx}" cy="${cy}" r="${inner}" class="radial-center"/>
      ${paths}
      <text x="${cx}" y="${cy-8}" class="radial-total">${concepts.length.toLocaleString("fr-FR")}</text>
      <text x="${cx}" y="${cy+18}" class="radial-caption">concepts</text>
    </svg>`;

  legend.innerHTML = counts.map(item => `
    <div class="domain-legend-item">
      <i style="background:${item.color}"></i>
      <span>${escapeHtml(item.name)}</span>
      <strong>${item.count.toLocaleString("fr-FR")}</strong>
    </div>`).join("");
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
