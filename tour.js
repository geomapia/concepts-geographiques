(function () {
  "use strict";

  const STORAGE_KEY = "repertoire-visite-guidee-2026-v1";
  const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const commonIntro = [
    {
      selector: ".brand",
      title: "Bienvenue dans le Répertoire",
      text: "Cette ressource scientifique organise les concepts géographiques liés à la diversité biologique et à la conservation.",
    },
    {
      selector: ".source-banner",
      title: "Une source clairement identifiée",
      text: "Les définitions proviennent du dictionnaire encyclopédique de Patrick Triplet, édition 2026. Les liens permettent d’accéder à la présentation et au PDF officiel.",
    },
  ];

  const tours = {
    "index.html": [
      ...commonIntro,
      {
        selector: ".portal-heading",
        title: "Quatre espaces documentaires",
        text: "Le corpus est réparti entre concepts géographiques, index intégral du dictionnaire, indices et indicateurs, conventions et traités.",
      },
      {
        selector: '.portal-grid a[href="./concepts.html"]',
        title: "Concepts géographiques",
        text: "Explorez les définitions sélectionnées, classées par domaine, milieu, échelle et pertinence scientifique.",
      },
      {
        selector: '.portal-grid a[href="./dictionnaire.html"]',
        title: "Index intégral",
        text: "Retrouvez tous les intitulés imprimés en vert dans le dictionnaire et ouvrez directement la page correspondante du PDF.",
      },
      {
        selector: '.portal-grid a[href="./indices.html"]',
        title: "Indices et indicateurs",
        text: "Consultez les sigles, unités, formules mentionnées et éléments d’interprétation disponibles dans les notices.",
      },
      {
        selector: '.portal-grid a[href="./conventions.html"]',
        title: "Conventions et traités",
        text: "Découvrez les instruments internationaux, leurs dates, organismes et liens vers les sites institutionnels officiels.",
      },
      {
        selector: "#overview",
        title: "Vue d’ensemble du corpus",
        text: "Les chiffres et graphiques présentent la composition du Répertoire et sa répartition entre les principaux domaines géographiques.",
      },
      {
        selector: ".authors-section",
        title: "Responsabilités scientifiques",
        text: "Cette section distingue l’auteur du dictionnaire source et le concepteur de la sélection, de la classification et de l’interface numérique.",
      },
      {
        selector: '.masthead nav a[href="./contact.html"]',
        fallbackSelector: ".site-footer",
        title: "Contribuer ou signaler une correction",
        text: "La page « Nous contacter » permet d’envoyer une remarque, de signaler une correction ou de suggérer un terme à ajouter au Répertoire.",
      },
    ],
    "concepts.html": [
      ...commonIntro,
      {
        selector: ".catalogue-hero",
        title: "Le répertoire des concepts",
        text: "Cette page rassemble les concepts géographiques documentés et sélectionnés dans le dictionnaire.",
      },
      {
        selector: ".fundamental-shortcuts",
        title: "Concepts fondamentaux",
        text: "Ces raccourcis donnent un accès immédiat aux notions majeures, comme Climax, Biotope, Géosystème ou Territoire.",
      },
      {
        selector: ".advanced-filters",
        title: "Recherche multicritère",
        text: "Recherchez un mot ou une définition, puis combinez les domaines, échelles, milieux, niveaux conceptuels et critères de pertinence.",
      },
      {
        selector: ".tool-row",
        title: "Résultats et export",
        text: "Le nombre de résultats s’actualise automatiquement. Vous pouvez réinitialiser les filtres, exporter les données ou préparer une impression.",
      },
      {
        selector: "#noticeGrid",
        title: "Fiches conceptuelles",
        text: "Cliquez sur une fiche pour afficher sa définition complète, ses métadonnées, sa citation et le renvoi vers la page du PDF.",
      },
    ],
    "dictionnaire.html": [
      ...commonIntro,
      {
        selector: ".dictionary-hero",
        title: "Index terminologique intégral",
        text: "Cette page réunit tous les intitulés verts repérés dans l’édition 2026 du dictionnaire.",
      },
      {
        selector: ".dictionary-search-panel",
        title: "Rechercher un intitulé",
        text: "Saisissez un terme ou sa traduction, puis choisissez un classement alphabétique ou selon l’ordre des pages du dictionnaire.",
      },
      {
        selector: "#alphabetFilter",
        title: "Navigation alphabétique",
        text: "Sélectionnez une lettre pour limiter rapidement la liste des entrées.",
      },
      {
        selector: "#dictionaryList",
        title: "Liens entre l’index et le Répertoire",
        text: "Les termes déjà documentés renvoient vers leur fiche. Les autres ouvrent leur page dans le PDF et peuvent être suggérés pour intégration.",
      },
    ],
    "indices.html": [
      ...commonIntro,
      {
        selector: ".indicator-hero",
        title: "Indices et indicateurs",
        text: "Les notices spécialisées rassemblent les mesures, coefficients, climatogrammes et indicateurs présents dans le dictionnaire.",
      },
      {
        selector: ".advanced-filters",
        title: "Filtrer les indicateurs",
        text: "Recherchez par nom, sigle, formule ou définition, puis affinez par domaine, échelle, milieu ou pertinence.",
      },
      {
        selector: "#noticeGrid",
        title: "Consulter une fiche",
        text: "Ouvrez une notice pour retrouver sa définition, ses unités, sa formule lorsqu’elle est mentionnée, sa citation et sa page source.",
      },
    ],
    "conventions.html": [
      ...commonIntro,
      {
        selector: ".convention-hero",
        title: "Conventions, traités et accords",
        text: "Cette rubrique présente les principaux instruments internationaux liés à l’environnement, aux territoires et à la conservation.",
      },
      {
        selector: ".advanced-filters",
        title: "Recherche institutionnelle",
        text: "Filtrez les instruments par thème, échelle, milieu, pertinence ou ordre chronologique.",
      },
      {
        selector: "#noticeGrid",
        title: "Fiches et sources officielles",
        text: "Chaque fiche réunit la définition du dictionnaire, les repères disponibles et, lorsque cela est possible, un lien vers le site officiel de la convention.",
      },
    ],
    "apropos.html": [
      ...commonIntro,
      {
        selector: ".about-hero",
        title: "Transparence scientifique",
        text: "Cette page expose les objectifs, la méthode de sélection, la structure documentaire et la forme de citation recommandée.",
      },
      {
        selector: ".about-content",
        title: "Méthode et périmètre",
        text: "Les notices sont classées uniquement à partir d’indices explicitement présents dans le texte et restent reliées à leur page source.",
      },
      {
        selector: ".about-profiles",
        title: "Auteur et conception",
        text: "Les responsabilités de Patrick Triplet et de Brahim Jaziri sont présentées séparément.",
      },
      {
        selector: ".rights-panel",
        title: "Droits et corrections",
        text: "Les définitions restent attribuées à leur auteur. Cette section indique également comment signaler une erreur.",
      },
    ],
    "contact.html": [
      {
        selector: ".brand",
        title: "Nous contacter",
        text: "Cette page centralise les échanges scientifiques, les corrections et les propositions terminologiques.",
      },
      {
        selector: ".contact-card",
        title: "Responsable du Répertoire",
        text: "Vous pouvez copier l’adresse électronique de Brahim Jaziri ou utiliser directement le formulaire sécurisé.",
      },
      {
        selector: "#newsletterForm",
        title: "Recevoir les nouveautés",
        text: "Inscrivez volontairement votre adresse électronique pour être informé lors de la publication d’une nouvelle notice ou d’une traduction arabe validée.",
      },
      {
        selector: "#contactForm",
        title: "Envoyer un message",
        text: "Renseignez votre identité, votre adresse, l’objet et le contenu de votre demande avant l’envoi.",
      },
      {
        selector: "#suggestionFields",
        fallbackSelector: "#contactForm",
        title: "Suggérer un nouveau terme",
        text: "Depuis l’index du dictionnaire, le bouton de suggestion ouvre ce formulaire avec le terme et la page déjà renseignés. La proposition sera examinée avant toute publication.",
      },
    ],
  };

  let steps = tours[page] || commonIntro;
  let currentIndex = 0;
  let previousFocus = null;
  let overlay;
  let spotlight;
  let tooltip;

  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity) !== 0 &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function resolveTarget(step) {
    const primary = document.querySelector(step.selector);
    if (isVisible(primary)) return primary;
    if (step.fallbackSelector) {
      const fallback = document.querySelector(step.fallbackSelector);
      if (isVisible(fallback)) return fallback;
    }
    return null;
  }

  function availableSteps() {
    return steps.filter((step) => resolveTarget(step));
  }

  function createInterface() {
    overlay = document.createElement("div");
    overlay.className = "tour-overlay";
    overlay.setAttribute("aria-hidden", "true");

    spotlight = document.createElement("div");
    spotlight.className = "tour-spotlight";
    spotlight.setAttribute("aria-hidden", "true");

    tooltip = document.createElement("section");
    tooltip.className = "tour-tooltip";
    tooltip.setAttribute("role", "dialog");
    tooltip.setAttribute("aria-modal", "true");
    tooltip.setAttribute("aria-labelledby", "tourTitle");
    tooltip.innerHTML = `
      <div class="tour-tooltip-top">
        <span class="tour-kicker">Visite guidée</span>
        <button class="tour-close" type="button" aria-label="Fermer la visite">×</button>
      </div>
      <p class="tour-progress" aria-live="polite"></p>
      <h2 id="tourTitle"></h2>
      <p class="tour-description"></p>
      <div class="tour-actions">
        <button class="tour-skip" type="button">Passer la visite</button>
        <div>
          <button class="tour-previous" type="button">Précédent</button>
          <button class="tour-next" type="button">Suivant</button>
        </div>
      </div>
    `;

    document.body.append(overlay, spotlight, tooltip);
    overlay.addEventListener("click", () => endTour(true));
    tooltip.querySelector(".tour-close").addEventListener("click", () => endTour(true));
    tooltip.querySelector(".tour-skip").addEventListener("click", () => endTour(true));
    tooltip.querySelector(".tour-previous").addEventListener("click", previousStep);
    tooltip.querySelector(".tour-next").addEventListener("click", nextStep);
  }

  function addLauncher() {
    if (document.querySelector(".tour-launcher")) return;
    const nav = document.querySelector(".masthead .nav");
    if (!nav) return;

    const button = document.createElement("button");
    button.className = "tour-launcher";
    button.type = "button";
    button.innerHTML = '<span aria-hidden="true">?</span><span>Visite guidée</span>';
    button.setAttribute("aria-label", "Démarrer la visite guidée de cette page");
    button.addEventListener("click", startTour);
    nav.append(button);
  }

  function startTour() {
    steps = availableSteps();
    if (!steps.length) return;
    previousFocus = document.activeElement;
    currentIndex = 0;
    document.body.classList.add("tour-open");
    createInterface();
    showStep();
  }

  function showStep() {
    const step = steps[currentIndex];
    const target = resolveTarget(step);
    if (!target) {
      nextStep();
      return;
    }

    const title = tooltip.querySelector("#tourTitle");
    const description = tooltip.querySelector(".tour-description");
    const progress = tooltip.querySelector(".tour-progress");
    const previous = tooltip.querySelector(".tour-previous");
    const next = tooltip.querySelector(".tour-next");

    title.textContent = step.title;
    description.textContent = step.text;
    progress.textContent = `Étape ${currentIndex + 1} sur ${steps.length}`;
    previous.disabled = currentIndex === 0;
    next.textContent = currentIndex === steps.length - 1 ? "Terminer" : "Suivant";

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center",
      inline: "nearest",
    });

    window.setTimeout(() => {
      positionInterface(target);
      next.focus({ preventScroll: true });
    }, prefersReducedMotion ? 0 : 320);
  }

  function positionInterface(target) {
    const rect = target.getBoundingClientRect();
    const padding = 8;
    const left = Math.max(8, rect.left - padding);
    const top = Math.max(8, rect.top - padding);
    const width = Math.min(window.innerWidth - left - 8, rect.width + padding * 2);
    const height = Math.min(window.innerHeight - top - 8, rect.height + padding * 2);

    spotlight.style.left = `${left}px`;
    spotlight.style.top = `${top}px`;
    spotlight.style.width = `${Math.max(24, width)}px`;
    spotlight.style.height = `${Math.max(24, height)}px`;

    tooltip.style.visibility = "hidden";
    tooltip.style.display = "block";
    const tooltipRect = tooltip.getBoundingClientRect();
    const gap = 18;
    const margin = 14;
    let tooltipTop = rect.bottom + gap;
    let tooltipLeft = rect.left + Math.min(24, rect.width / 4);

    if (tooltipTop + tooltipRect.height > window.innerHeight - margin) {
      tooltipTop = rect.top - tooltipRect.height - gap;
    }
    if (tooltipTop < margin) {
      tooltipTop = Math.max(margin, (window.innerHeight - tooltipRect.height) / 2);
    }

    tooltipLeft = Math.max(
      margin,
      Math.min(tooltipLeft, window.innerWidth - tooltipRect.width - margin),
    );
    tooltip.style.left = `${tooltipLeft}px`;
    tooltip.style.top = `${tooltipTop}px`;
    tooltip.style.visibility = "visible";
  }

  function nextStep() {
    if (currentIndex >= steps.length - 1) {
      endTour(true);
      return;
    }
    currentIndex += 1;
    showStep();
  }

  function previousStep() {
    if (currentIndex === 0) return;
    currentIndex -= 1;
    showStep();
  }

  function endTour(remember) {
    if (remember) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "completed");
      } catch (error) {
        // La visite reste utilisable même si le stockage local est indisponible.
      }
    }
    document.body.classList.remove("tour-open");
    overlay?.remove();
    spotlight?.remove();
    tooltip?.remove();
    overlay = null;
    spotlight = null;
    tooltip = null;
    previousFocus?.focus?.();
  }

  function handleKeydown(event) {
    if (!tooltip) return;
    if (event.key === "Escape") endTour(true);
    if (event.key === "ArrowRight") nextStep();
    if (event.key === "ArrowLeft") previousStep();
  }

  function handleViewportChange() {
    if (!tooltip || !steps[currentIndex]) return;
    const target = resolveTarget(steps[currentIndex]);
    if (target) positionInterface(target);
  }

  function shouldStartAutomatically() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) !== "completed";
    } catch (error) {
      return false;
    }
  }

  function initialize() {
    addLauncher();
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, { passive: true });

    if (shouldStartAutomatically()) {
      window.setTimeout(startTour, 900);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
