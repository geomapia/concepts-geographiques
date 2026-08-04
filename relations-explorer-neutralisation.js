(() => {
  "use strict";

  const BLEU_NUIT = { r: 23, g: 50, b: 74 };
  let correctionEnCours = false;

  function trouverControleModeCouleur() {
    return Array.from(
      document.querySelectorAll('input[type="checkbox"]')
    ).find(input => {
      const id = input.id || "";
      const label = id
        ? document.querySelector(`label[for="${CSS.escape(id)}"]`)
        : null;

      const texte = [
        input.getAttribute("aria-label") || "",
        label ? label.textContent : "",
        input.parentElement ? input.parentElement.textContent : ""
      ]
        .join(" ")
        .toLowerCase();

      return texte.includes("mode couleur");
    }) || null;
  }

  function modeCouleurActif() {
    const controle = trouverControleModeCouleur();
    return Boolean(controle && controle.checked);
  }

  function estPixelVert(r, g, b, a) {
    if (a < 45) return false;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max - min;

    return (
      g >= 45 &&
      g > r + 8 &&
      g > b + 6 &&
      saturation >= 18
    );
  }

  function neutraliserCanvas(canvas) {
    if (!canvas.width || !canvas.height) return;

    const contexte = canvas.getContext("2d", {
      willReadFrequently: true
    });

    if (!contexte) return;

    try {
      const image = contexte.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const pixels = image.data;
      let modifie = false;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (!estPixelVert(r, g, b, a)) continue;

        pixels[i] = BLEU_NUIT.r;
        pixels[i + 1] = BLEU_NUIT.g;
        pixels[i + 2] = BLEU_NUIT.b;
        modifie = true;
      }

      if (modifie) {
        contexte.putImageData(image, 0, 0);
      }
    } catch (erreur) {
      console.warn(
        "Correction chromatique du graphe impossible :",
        erreur
      );
    }
  }

  function corrigerGraphe() {
    if (correctionEnCours || modeCouleurActif()) return;

    correctionEnCours = true;

    try {
      document
        .querySelectorAll("canvas")
        .forEach(neutraliserCanvas);
    } finally {
      correctionEnCours = false;
    }
  }

  function lancerRafPendant(dureeMs) {
    const debut = performance.now();

    function boucle(maintenant) {
      corrigerGraphe();

      if (maintenant - debut < dureeMs) {
        requestAnimationFrame(boucle);
      }
    }

    requestAnimationFrame(boucle);
  }

  function relancerCorrection() {
    window.setTimeout(() => lancerRafPendant(1800), 40);
  }

  document.addEventListener("click", relancerCorrection);
  document.addEventListener("change", relancerCorrection);

  document.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      relancerCorrection();
    }
  });

  window.addEventListener("resize", relancerCorrection);

  const observateur = new MutationObserver(relancerCorrection);

  observateur.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
  });

  window.setInterval(corrigerGraphe, 350);

  lancerRafPendant(2500);
})();