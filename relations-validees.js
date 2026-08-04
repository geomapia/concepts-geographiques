(() => {
  "use strict";

  const normaliser = value =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const echapper = value =>
    String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const clePaire = (a, b) => {
    const x = Number(a);
    const y = Number(b);
    return x < y ? `${x}|${y}` : `${y}|${x}`;
  };

  let relationsPubliques = [];
  let relationsValideesParPaire = new Map();

  function ajouterStylesRelationsValidees() {
    if (document.getElementById("rg-relations-validees-style")) return;

    const style = document.createElement("style");
    style.id = "rg-relations-validees-style";
    style.textContent = `
      .rg-validated-legend {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-left: 18px;
        color: var(--foreground, #17324a);
        font-size: 12px;
      }

      .rg-validated-legend-line {
        display: inline-block;
        width: 28px;
        height: 0;
        border-top: 3px solid #2f8f4e;
      }

      .rg-validated-panel {
        margin-top: 12px;
        padding: 12px 14px;
        border: 1px solid var(--border, #d9d0bf);
        border-left: 4px solid #2f8f4e;
        background: var(--secondary, #fff);
        color: var(--foreground, #17324a);
        font-size: 13px;
      }

      .rg-validated-panel[hidden] {
        display: none !important;
      }

      .rg-validated-panel h3 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 700;
      }

      .rg-validated-panel-list {
        display: grid;
        gap: 8px;
      }

      .rg-validated-relation {
        padding: 8px 10px;
        border: 1px solid color-mix(in srgb, #2f8f4e 25%, transparent);
        background: color-mix(in srgb, #2f8f4e 7%, transparent);
      }

      .rg-validated-relation-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        font-weight: 700;
      }

      .rg-validated-badge {
        display: inline-block;
        padding: 2px 7px;
        border: 1px solid #2f8f4e;
        color: #236f3c;
        background: #f2faf4;
        font-size: 11px;
        font-weight: 700;
      }

      .rg-validated-type {
        margin-top: 3px;
        color: var(--muted-foreground, #596979);
        font-size: 12px;
      }

      .rg-validated-justification {
        margin-top: 5px;
        line-height: 1.45;
      }
    `;
    document.head.appendChild(style);
  }

  function ajouterLegendeValidee() {
    if (document.getElementById("rg-validated-legend")) return;

    const candidats = Array.from(document.querySelectorAll("body *"));
    const elementLegende = candidats.find(element =>
      element.children.length === 0 &&
      /relations du concept central/i.test(element.textContent || "")
    );

    const legende = document.createElement("span");
    legende.id = "rg-validated-legend";
    legende.className = "rg-validated-legend";
    legende.innerHTML =
      '<span class="rg-validated-legend-line" aria-hidden="true"></span>' +
      '<span>Relation scientifiquement validée</span>';

    if (elementLegende && elementLegende.parentElement) {
      elementLegende.parentElement.appendChild(legende);
      return;
    }

    const canvas = document.querySelector("canvas");
    const cible = canvas && canvas.parentElement
      ? canvas.parentElement
      : document.getElementById("widget") || document.body;
    cible.insertAdjacentElement("afterend", legende);
  }

  function obtenirPanneauValide() {
    let panneau = document.getElementById("rg-validated-panel");
    if (panneau) return panneau;

    panneau = document.createElement("section");
    panneau.id = "rg-validated-panel";
    panneau.className = "rg-validated-panel";
    panneau.hidden = true;

    const canvas = document.querySelector("canvas");
    const cible = canvas && canvas.parentElement
      ? canvas.parentElement
      : document.getElementById("widget") || document.body;

    cible.insertAdjacentElement("afterend", panneau);
    return panneau;
  }

  function relationConcerneConcept(relation, concept) {
    const cle = normaliser(concept);
    return normaliser(relation.source) === cle || normaliser(relation.target) === cle;
  }

  function symboleRelation(relation, concept) {
    const reciproque = normaliser(relation.direction) === "reciproque";
    if (reciproque) return "↔";
    return normaliser(relation.source) === normaliser(concept) ? "→" : "←";
  }

  function autreTerme(relation, concept) {
    return normaliser(relation.source) === normaliser(concept)
      ? relation.target
      : relation.source;
  }

  function actualiserPanneauRelationsValidees() {
    const panneau = obtenirPanneauValide();
    const concept = String(
      typeof search !== "undefined" && search ? search.value : ""
    ).trim();

    if (!concept) {
      panneau.hidden = true;
      panneau.innerHTML = "";
      return;
    }

    const concernees = relationsPubliques.filter(relation =>
      relationConcerneConcept(relation, concept)
    );

    if (!concernees.length) {
      panneau.hidden = true;
      panneau.innerHTML = "";
      return;
    }

    panneau.hidden = false;
    panneau.innerHTML =
      `<h3>Relations scientifiquement validées de « ${echapper(concept)} »</h3>` +
      '<div class="rg-validated-panel-list">' +
      concernees.map(relation => {
        const symbole = symboleRelation(relation, concept);
        const terme = autreTerme(relation, concept);
        return (
          '<article class="rg-validated-relation">' +
            '<div class="rg-validated-relation-head">' +
              '<span class="rg-validated-badge">Validée</span>' +
              `<span>${echapper(concept)} ${symbole} ${echapper(terme)}</span>` +
            '</div>' +
            `<div class="rg-validated-type">Type : ${echapper(relation.type || "Relation associée")}</div>` +
            (relation.justification
              ? `<div class="rg-validated-justification">${echapper(relation.justification)}</div>`
              : "") +
          '</article>'
        );
      }).join("") +
      '</div>';
  }

  function observerInteractions() {
    document.addEventListener("click", event => {
      if (
        event.target &&
        (
          /explorer/i.test(event.target.textContent || "") ||
          event.target.closest("button")
        )
      ) {
        window.setTimeout(actualiserPanneauRelationsValidees, 120);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        window.setTimeout(actualiserPanneauRelationsValidees, 120);
      }
    });

    window.addEventListener("popstate", () =>
      window.setTimeout(actualiserPanneauRelationsValidees, 120)
    );
  }

  async function chargerRelationsValidees() {
    ajouterStylesRelationsValidees();

    let documentRelations;

    try {
      const reponse = await fetch(`./data/relations.json?v=${Date.now()}`, {
        cache: "no-store"
      });

      if (!reponse.ok) return;
      documentRelations = await reponse.json();
    } catch (error) {
      console.warn("Relations validées indisponibles :", error);
      return;
    }

    relationsPubliques = Array.isArray(documentRelations)
      ? documentRelations
      : Array.isArray(documentRelations.relations)
        ? documentRelations.relations
        : [];

    if (!relationsPubliques.length) return;

    relationsPubliques.forEach(relation => {
      const sourceNom = String(relation.source || "").trim();
      const cibleNom = String(relation.target || relation.cible || "").trim();
      if (!sourceNom || !cibleNom) return;

      const source = ensureTerm(sourceNom, 0);
      const cible = ensureTerm(cibleNom, 0);
      if (source === null || cible === null || source === cible) return;

      registerManualRelation(
        source,
        cible,
        relation.type || "relation validée",
        relation.justification || ""
      );

      relationsValideesParPaire.set(clePaire(source, cible), {
        type: relation.type || "relation validée",
        direction: relation.direction || "Orientée",
        justification: relation.justification || ""
      });
    });

    if (!relationsValideesParPaire.size) return;

    const calculOriginal = relationScore;

    relationScore = function(source, target) {
      const resultat = calculOriginal(source, target);
      const validee = relationsValideesParPaire.get(clePaire(source, target));

      if (!validee) return resultat;

      return {
        score: Math.max(Number(resultat.score || 0), 320),
        labels: [
          `relation validée : ${validee.type}`,
          validee.direction,
          validee.justification
        ].filter(Boolean),
        kind: "manual"
      };
    };

    ajouterLegendeValidee();
    observerInteractions();

    const termeActuel = String(
      typeof search !== "undefined" && search ? search.value : ""
    ).trim();
    const indexActuel = termeActuel ? findTerm(termeActuel) : null;

    if (indexActuel !== null) {
      buildGraph(indexActuel);
    }

    actualiserPanneauRelationsValidees();

    document.documentElement.dataset.validatedRelations = String(
      relationsValideesParPaire.size
    );
  }

  chargerRelationsValidees();
})();
