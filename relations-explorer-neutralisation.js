(() => {
  "use strict";

  const NAVY = { r: 23, g: 50, b: 74 };
  const GREEN_MIN = { r: 25, g: 95, b: 35 };
  const GREEN_MAX = { r: 95, g: 205, b: 120 };

  function modeCouleurActif() {
    const controles = Array.from(
      document.querySelectorAll('input[type="checkbox"]')
    );

    const controle = controles.find(input => {
      const id = input.id || "";
      const label = id
        ? document.querySelector(`label[for="${CSS.escape(id)}"]`)
        : null;

      const texte = [
        input.getAttribute("aria-label"),
        label ? label.textContent : "",
        input.parentElement ? input.parentElement.textContent : ""
      ]
        .join(" ")
        .toLowerCase();

      return texte.includes("mode couleur");
    });

    return Boolean(controle && controle.checked);
  }

  function estVertValidation(r, g, b, a) {
    if (a < 80) return false;

    return (
      r >= GREEN_MIN.r &&
      r <= GREEN_MAX.r &&
      g >= GREEN_MIN.g &&
      g <= GREEN_MAX.g &&
      b >= GREEN_MIN.b &&
      b <= GREEN_MAX.b &&
      g > r * 1.25 &&
      g > b * 1.25
    );
  }

  function neutraliserVertValidation() {
    if (modeCouleurActif()) return;

    document.querySelectorAll("canvas").forEach(canvas => {
      const contexte = canvas.getContext("2d", {
        willReadFrequently: true
      });

      if (!contexte || !canvas.width || !canvas.height) return;

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

          if (!estVertValidation(r, g, b, a)) continue;

          pixels[i] = NAVY.r;
          pixels[i + 1] = NAVY.g;
          pixels[i + 2] = NAVY.b;
          modifie = true;
        }

        if (modifie) {
          contexte.putImageData(image, 0, 0);
        }
      } catch (erreur) {
        console.warn(
          "Neutralisation de la couleur de validation impossible :",
          erreur
        );
      }
    });
  }

  let temporisateur = null;

  function programmerCorrection(delai = 120) {
    window.clearTimeout(temporisateur);
    temporisateur = window.setTimeout(
      neutraliserVertValidation,
      delai
    );
  }

  document.addEventListener("click", () => {
    programmerCorrection(80);
    programmerCorrection(250);
  });

  document.addEventListener("change", () => {
    programmerCorrection(80);
    programmerCorrection(250);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      programmerCorrection(100);
      programmerCorrection(300);
    }
  });

  window.addEventListener("resize", () => {
    programmerCorrection(150);
  });

  const observateur = new MutationObserver(() => {
    programmerCorrection(100);
  });

  observateur.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
  });

  window.setInterval(neutraliserVertValidation, 900);

  programmerCorrection(200);
  programmerCorrection(700);
})();