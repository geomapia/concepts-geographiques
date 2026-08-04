(() => {
  "use strict";

  const COULEUR_VALIDEE = "#2f8f4e";
  const COULEUR_NOEUD = "#17324a";
  const ID_OVERLAY = "rg-validated-graph-overlay";

  const normaliser = value =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const echapperXml = value =>
    String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  let relationsPubliques = [];
  let dernierConcept = "";
  let temporisateur = null;

  function trouverChampConcept() {
    const champs = Array.from(document.querySelectorAll('input[type="search"], input[type="text"], input:not([type])'));
    return champs.find(champ => {
      const texte = [
        champ.placeholder,
        champ.getAttribute("aria-label"),
        champ.id,
        champ.name
      ].join(" ").toLowerCase();
      return texte.includes("recher") || texte.includes("concept") || texte.includes("terme");
    }) || champs[0] || null;
  }

  function conceptActuel() {
    const parametre = new URLSearchParams(window.location.search).get("concept");
    const champ = trouverChampConcept();
    const valeurChamp = champ ? String(champ.value || "").trim() : "";
    return valeurChamp || String(parametre || "").trim();
  }

  function relationsDuConcept(concept) {
    const cle = normaliser(concept);
    return relationsPubliques.filter(relation =>
      normaliser(relation.source) === cle ||
      normaliser(relation.target || relation.cible) === cle
    );
  }

  function termeOppose(relation, concept) {
    return normaliser(relation.source) === normaliser(concept)
      ? String(relation.target || relation.cible || "").trim()
      : String(relation.source || "").trim();
  }

  function estRelationSortante(relation, concept) {
    return normaliser(relation.source) === normaliser(concept);
  }

  function decouperLibelle(libelle, limite) {
    const mots = String(libelle || "").trim().split(/\s+/);
    const lignes = [];
    let ligne = "";

    mots.forEach(mot => {
      const candidate = ligne ? ligne + " " + mot : mot;
      if (candidate.length > limite && ligne) {
        lignes.push(ligne);
        ligne = mot;
      } else {
        ligne = candidate;
      }
    });

    if (ligne) lignes.push(ligne);
    return lignes.slice(0, 3);
  }

  function supprimerOverlay() {
    const precedent = document.getElementById(ID_OVERLAY);
    if (precedent) precedent.remove();
  }

  function dessinerRelationsValidees() {
    supprimerOverlay();

    const concept = conceptActuel();
    if (!concept) return;

    const relations = relationsDuConcept(concept);
    if (!relations.length) return;

    const canvas = document.querySelector("canvas");
    if (!canvas || !canvas.parentElement) return;

    const parent = canvas.parentElement;
    const styleParent = getComputedStyle(parent);
    if (styleParent.position === "static") parent.style.position = "relative";

    const largeur = canvas.clientWidth || canvas.width;
    const hauteur = canvas.clientHeight || canvas.height;
    if (!largeur || !hauteur) return;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = ID_OVERLAY;
    svg.setAttribute("viewBox", `0 0 ${largeur} ${hauteur}`);
    svg.setAttribute("width", String(largeur));
    svg.setAttribute("height", String(hauteur));
    svg.setAttribute("aria-label", "Relations scientifiquement validées");
    Object.assign(svg.style, {
      position: "absolute",
      left: canvas.offsetLeft + "px",
      top: canvas.offsetTop + "px",
      width: largeur + "px",
      height: hauteur + "px",
      pointerEvents: "none",
      zIndex: "4",
      overflow: "visible"
    });

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <marker id="rg-arrow-end" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L8,4 L0,8 z" fill="${COULEUR_VALIDEE}"></path>
      </marker>
      <marker id="rg-arrow-start" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto" markerUnits="strokeWidth">
        <path d="M8,0 L0,4 L8,8 z" fill="${COULEUR_VALIDEE}"></path>
      </marker>`;
    svg.appendChild(defs);

    const centreX = largeur / 2;
    const centreY = hauteur / 2;
    const rayon = Math.max(120, Math.min(largeur, hauteur) * 0.40);
    const total = relations.length;
    const angleDepart = -Math.PI / 2;

    relations.forEach((relation, index) => {
      const angle = angleDepart + (2 * Math.PI * index) / Math.max(total, 1);
      const x = centreX + Math.cos(angle) * rayon;
      const y = centreY + Math.sin(angle) * rayon;
      const reciproque = normaliser(relation.direction) === "reciproque";
      const sortante = estRelationSortante(relation, concept);

      const groupe = document.createElementNS("http://www.w3.org/2000/svg", "g");
      groupe.setAttribute("data-validated-relation", relation.id || "");

      const ligne = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ligne.setAttribute("x1", String(centreX));
      ligne.setAttribute("y1", String(centreY));
      ligne.setAttribute("x2", String(x));
      ligne.setAttribute("y2", String(y));
      ligne.setAttribute("stroke", COULEUR_VALIDEE);
      ligne.setAttribute("stroke-width", "3");
      ligne.setAttribute("stroke-linecap", "round");

      if (reciproque) {
        ligne.setAttribute("marker-start", "url(#rg-arrow-start)");
        ligne.setAttribute("marker-end", "url(#rg-arrow-end)");
      } else if (sortante) {
        ligne.setAttribute("marker-end", "url(#rg-arrow-end)");
      } else {
        ligne.setAttribute("marker-start", "url(#rg-arrow-start)");
      }

      groupe.appendChild(ligne);

      const cercle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      cercle.setAttribute("cx", String(x));
      cercle.setAttribute("cy", String(y));
      cercle.setAttribute("r", "9");
      cercle.setAttribute("fill", COULEUR_NOEUD);
      cercle.setAttribute("stroke", COULEUR_VALIDEE);
      cercle.setAttribute("stroke-width", "3");
      groupe.appendChild(cercle);

      const libelle = termeOppose(relation, concept);
      const lignesLibelle = decouperLibelle(libelle, 24);
      const texte = document.createElementNS("http://www.w3.org/2000/svg", "text");
      texte.setAttribute("x", String(x));
      texte.setAttribute("y", String(y - 17 - (lignesLibelle.length - 1) * 7));
      texte.setAttribute("text-anchor", "middle");
      texte.setAttribute("font-family", "Arial, sans-serif");
      texte.setAttribute("font-size", "12");
      texte.setAttribute("font-weight", "700");
      texte.setAttribute("fill", COULEUR_VALIDEE);
      texte.setAttribute("paint-order", "stroke");
      texte.setAttribute("stroke", "#ffffff");
      texte.setAttribute("stroke-width", "4");
      texte.setAttribute("stroke-linejoin", "round");

      lignesLibelle.forEach((ligneTexte, ligneIndex) => {
        const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("x", String(x));
        tspan.setAttribute("dy", ligneIndex === 0 ? "0" : "14");
        tspan.textContent = ligneTexte;
        texte.appendChild(tspan);
      });
      groupe.appendChild(texte);

      const type = document.createElementNS("http://www.w3.org/2000/svg", "text");
      type.setAttribute("x", String((centreX + x) / 2));
      type.setAttribute("y", String((centreY + y) / 2 - 6));
      type.setAttribute("text-anchor", "middle");
      type.setAttribute("font-family", "Arial, sans-serif");
      type.setAttribute("font-size", "10");
      type.setAttribute("fill", COULEUR_VALIDEE);
      type.setAttribute("paint-order", "stroke");
      type.setAttribute("stroke", "#ffffff");
      type.setAttribute("stroke-width", "3");
      type.textContent = relation.type || "Relation validée";
      groupe.appendChild(type);

      svg.appendChild(groupe);
    });

    parent.appendChild(svg);
    dernierConcept = concept;
  }

  function programmerDessin(delai = 120) {
    window.clearTimeout(temporisateur);
    temporisateur = window.setTimeout(dessinerRelationsValidees, delai);
  }

  function observerInterface() {
    document.addEventListener("click", () => programmerDessin(180));
    document.addEventListener("keydown", event => {
      if (event.key === "Enter") programmerDessin(180);
    });

    const champ = trouverChampConcept();
    if (champ) {
      champ.addEventListener("change", () => programmerDessin(180));
      champ.addEventListener("input", () => programmerDessin(450));
    }

    const canvas = document.querySelector("canvas");
    if (canvas && typeof ResizeObserver !== "undefined") {
      new ResizeObserver(() => programmerDessin(80)).observe(canvas);
    }

    window.addEventListener("resize", () => programmerDessin(100));

    window.setInterval(() => {
      const courant = conceptActuel();
      if (normaliser(courant) !== normaliser(dernierConcept)) {
        programmerDessin(80);
      }
    }, 700);
  }

  async function initialiser() {
    try {
      const reponse = await fetch(`./data/relations.json?v=${Date.now()}`, {
        cache: "no-store"
      });
      if (!reponse.ok) return;

      const documentRelations = await reponse.json();
      relationsPubliques = Array.isArray(documentRelations)
        ? documentRelations
        : Array.isArray(documentRelations.relations)
          ? documentRelations.relations
          : [];

      if (!relationsPubliques.length) return;

      observerInterface();
      programmerDessin(250);
    } catch (error) {
      console.warn("Affichage des relations validées impossible :", error);
    }
  }

  initialiser();
})();
