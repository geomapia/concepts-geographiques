(() => {
  "use strict";

  const style = document.createElement("style");
  style.id = "catalogue-ergonomie-specialisee";
  style.textContent = `
    .special-notice .notice-tags {
      display: none !important;
    }

    .special-notice .notice-actions > :not([data-action="open"]):not(.official-source-link) {
      display: none !important;
    }

    .special-notice .notice-actions {
      margin-top: auto;
    }
  `;
  document.head.appendChild(style);

  function harmoniserBoutonPdf() {
    const bouton = document.querySelector("#modalPdf");
    if (!bouton) return;
    bouton.textContent = "Voir la page dans le PDF ↗";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", harmoniserBoutonPdf, {
      once: true
    });
  } else {
    harmoniserBoutonPdf();
  }

  document.addEventListener("click", event => {
    if (event.target.closest('[data-action="open"]')) {
      window.setTimeout(harmoniserBoutonPdf, 0);
    }
  });
})();
