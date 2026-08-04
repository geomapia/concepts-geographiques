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

  const clePaire = (a, b) => {
    const x = Number(a);
    const y = Number(b);
    return x < y ? `${x}|${y}` : `${y}|${x}`;
  };

  async function chargerRelationsValidees() {
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

    const relations = Array.isArray(documentRelations)
      ? documentRelations
      : Array.isArray(documentRelations.relations)
        ? documentRelations.relations
        : [];

    if (!relations.length) return;

    const relationsValidees = new Map();

    relations.forEach(relation => {
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

      relationsValidees.set(clePaire(source, cible), {
        type: relation.type || "relation validée",
        direction: relation.direction || "Orientée",
        justification: relation.justification || ""
      });
    });

    if (!relationsValidees.size) return;

    const calculOriginal = relationScore;

    relationScore = function(source, target) {
      const resultat = calculOriginal(source, target);
      const validee = relationsValidees.get(clePaire(source, target));

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

    const termeActuel = String(search && search.value || "").trim();
    const indexActuel = termeActuel ? findTerm(termeActuel) : null;

    if (indexActuel !== null) {
      buildGraph(indexActuel);
    }

    document.documentElement.dataset.validatedRelations = String(
      relationsValidees.size
    );
  }

  chargerRelationsValidees();
})();
