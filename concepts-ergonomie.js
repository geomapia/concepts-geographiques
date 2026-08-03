(() => {
  "use strict";

  const style = document.createElement("style");
  style.id = "concepts-ergonomie-compacte";
  style.textContent = `
    /* La carte sert à parcourir ; la fiche détaillée sert à consulter et agir. */
    .special-notice .notice-classification .subdomain,
    .special-notice .notice-tags {
      display: none !important;
    }

    .special-notice .notice-actions > :not([data-action="open"]) {
      display: none !important;
    }

    .special-notice .notice-actions {
      margin-top: auto;
    }

    .special-notice .notice-classification {
      margin-bottom: 0.75rem;
    }
  `;
  document.head.appendChild(style);

  function harmoniserBoutonPdf() {
    const boutonPdf = document.querySelector("#modalPdf");
    if (!boutonPdf) return;

    boutonPdf.textContent = "Voir la page dans le PDF ↗";
    boutonPdf.setAttribute(
      "aria-label",
      "Ouvrir dans le PDF la page indiquée dans les métadonnées de la notice"
    );
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-action="open"]')) {
      window.setTimeout(harmoniserBoutonPdf, 0);
    }
  });

  const observer = new MutationObserver(harmoniserBoutonPdf);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["hidden", "href"],
  });

  harmoniserBoutonPdf();
})();
