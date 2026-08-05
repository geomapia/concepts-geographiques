const recipient = "contact@geomapia.tn";
const params = new URLSearchParams(window.location.search);
const notice = params.get("notice")?.trim() || "";
const suggestion = params.get("suggestion")?.trim() || "";
const translationLanguage = params.get("translation")?.trim().toLowerCase() || "";
const page = params.get("page")?.trim() || "";
const registryEndpoint =
  String(window.REPERTOIRE_CONFIG?.suggestionsEndpoint || "").trim();

const form = document.querySelector("#contactForm");
const subject = document.querySelector("#subject");
const message = document.querySelector("#message");
const messageLabel = document.querySelector("#messageLabel");
const formTitle = document.querySelector("#formTitle");
const copyEmail = document.querySelector("#copyEmail");
const suggestionFields = document.querySelector("#suggestionFields");
const translationFields = document.querySelector("#translationFields");
const arabicTerm = document.querySelector("#arabicTerm");
const suggestionCategory = document.querySelector("#suggestionCategory");
const suggestionDomain = document.querySelector("#suggestionDomain");
const suggestionSubdomain = document.querySelector("#suggestionSubdomain");
const suggestionJustification = document.querySelector("#suggestionJustification");
const requestTypeField = document.querySelector("#requestTypeField");
const translationLanguageField = document.querySelector("#translationLanguageField");
const noticeField = document.querySelector("#noticeField");
const citedPageField = document.querySelector("#citedPageField");
const pdfPageField = document.querySelector("#pdfPageField");
const sourceUrlField = document.querySelector("#sourceUrlField");
const submitContact = document.querySelector("#submitContact");
const formStatus = document.querySelector("#formStatus");
const formServiceNote = document.querySelector("#formServiceNote");
const newsletterForm = document.querySelector("#newsletterForm");
const newsletterSubmit = document.querySelector("#newsletterSubmit");
const newsletterStatus = document.querySelector("#newsletterStatus");

const suggestionTaxonomy = {
  "Aménagement du territoire": [
    "Infrastructures et équipements",
    "Planification territoriale",
    "Politiques d’aménagement"
  ],
  "Aménagement, territoires et usages du sol": [],
  "Biogéographie": [
    "Biomes et écosystèmes",
    "Connectivité et fragmentation",
    "Répartition des espèces",
    "Écologie des paysages"
  ],
  "Cartographie, SIG et analyse spatiale": [],
  "Cartographie, SIG et télédétection": [
    "Cartographie générale"
  ],
  "Climatologie et bioclimatologie": [
    "Aridité, sécheresse et désertification",
    "Bioclimatologie",
    "Changements climatiques",
    "Climatologie générale",
    "Variabilité et extrêmes climatiques"
  ],
  "Climatologie et changements climatiques": [],
  "Conventions, traités et accords internationaux": [],
  "Développement territorial": [
    "Développement durable",
    "Développement local",
    "Patrimoine et développement"
  ],
  "Géographie de l'environnement": [
    "Biodiversité"
  ],
  "Géographie de l'environnement et conservation": [],
  "Géographie de la population": [
    "Dynamiques démographiques",
    "Migrations",
    "Peuplement",
    "Structures de population"
  ],
  "Géographie de l’environnement": [
    "Aires protégées",
    "Biodiversité",
    "Conflits socio-environnementaux",
    "Conservation de la nature",
    "Gestion environnementale",
    "Pollutions et nuisances",
    "Services écosystémiques"
  ],
  "Géographie des risques": [
    "Aléas naturels",
    "Résilience territoriale",
    "Vulnérabilité"
  ],
  "Géographie des sols": [
    "Classification des sols",
    "Propriétés et fertilité des sols",
    "Pédogenèse",
    "Érosion et dégradation des sols"
  ],
  "Géographie littorale et marine": [
    "Aménagement du littoral",
    "Dynamiques littorales",
    "Espaces insulaires",
    "Milieux marins et côtiers",
    "Océanographie géographique",
    "Usages et conflits littoraux",
    "Érosion et submersion côtières"
  ],
  "Géographie politique": [
    "Frontières et limites",
    "Gouvernance et acteurs"
  ],
  "Géographie rurale": [
    "Agriculture et territoires",
    "Espaces forestiers",
    "Systèmes agraires"
  ],
  "Géographie sociale et culturelle": [
    "Culture et patrimoine",
    "Genre et espace"
  ],
  "Géographie urbaine": [
    "Habitat et logement"
  ],
  "Géographie économique": [
    "Commerce et services",
    "Industrie et territoires",
    "Localisation des activités",
    "Marchés et réseaux économiques",
    "Tourisme",
    "Transport et logistique",
    "Économie de l’environnement"
  ],
  "Géomorphologie": [
    "Géomorphologie côtière",
    "Géomorphologie dynamique",
    "Géomorphologie structurale",
    "Modelés désertiques et éoliens",
    "Modelés fluviaux",
    "Modelés karstiques",
    "Processus d’érosion"
  ],
  "Hydrologie": [
    "Bassins versants",
    "Cours d’eau et réseaux hydrographiques",
    "Crues et inondations",
    "Cycle hydrologique",
    "Eaux souterraines"
  ],
  "Indices et indicateurs": [],
  "Méthodes et analyse spatiale": [
    "Indicateurs et indices"
  ],
  "Pédologie et géographie des sols": [],
  "Ressources et transitions territoriales": [
    "Gestion durable des ressources",
    "Ressources naturelles",
    "Énergie"
  ]
};

function populateSuggestionDomains() {
  if (!suggestionDomain || !suggestionSubdomain) return;

  suggestionDomain.innerHTML = '<option value="">Choisir un domaine</option>';

  Object.keys(suggestionTaxonomy).forEach((domain) => {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;
    suggestionDomain.append(option);
  });

  updateSuggestionSubdomains();
}

function updateSuggestionSubdomains() {
  if (!suggestionDomain || !suggestionSubdomain) return;

  const domain = suggestionDomain.value;
  const values = suggestionTaxonomy[domain] || [];

  suggestionSubdomain.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = domain
    ? values.length
      ? "Choisir un sous-domaine"
      : "Sous-domaine à préciser lors de la validation"
    : "Choisir d’abord un domaine";

  suggestionSubdomain.append(placeholder);
  suggestionSubdomain.disabled = !domain || values.length === 0;

  values.forEach((subdomain) => {
    const option = document.createElement("option");
    option.value = subdomain;
    option.textContent = subdomain;
    suggestionSubdomain.append(option);
  });
}

suggestionDomain?.addEventListener("change", updateSuggestionSubdomains);
populateSuggestionDomains();


if (translationLanguage === "ar" && notice) {
  const pdfPage = page ? Math.max(1, Number(page)) : "";
  formTitle.textContent = "Proposer une traduction arabe";
  subject.value = `Proposition de traduction arabe — ${notice}`;
  requestTypeField.value = "traduction";
  translationLanguageField.value = "ar";
  noticeField.value = notice;
  citedPageField.value = page ? Math.max(1, Number(page) - 1) : "";
  pdfPageField.value = pdfPage;
  sourceUrlField.value = page
    ? `https://www.ffem.fr/sites/ffem/files/2026-03/dictionnaire_triplet_2026.pdf#page=${pdfPage}`
    : window.location.href;
  translationFields.hidden = false;
  arabicTerm.required = true;
  messageLabel.textContent = "Remarque complémentaire (facultatif)";
  message.required = false;
  message.rows = 4;
  message.value = "";
  formServiceNote.textContent = registryEndpoint
    ? "La proposition sera enregistrée dans le registre scientifique des traductions."
    : "La proposition sera transmise par Formspree jusqu’à l’activation du registre automatique.";
} else if (suggestion) {
  const pdfPage = page ? Math.max(1, Number(page)) : "";
  formTitle.textContent = "Suggérer l’ajout d’un terme";
  subject.value = `Suggestion d’ajout au Répertoire — ${suggestion}`;
  requestTypeField.value = "suggestion";
  noticeField.value = suggestion;
  citedPageField.value = page ? Math.max(1, Number(page) - 1) : "";
  pdfPageField.value = pdfPage;
  sourceUrlField.value = page
    ? `https://www.ffem.fr/sites/ffem/files/2026-03/dictionnaire_triplet_2026.pdf#page=${pdfPage}`
    : window.location.href;
  suggestionFields.hidden = false;
  suggestionCategory.required = true;
  suggestionDomain.required = true;
  suggestionJustification.required = true;
  messageLabel.textContent = "Remarque complémentaire (facultatif)";
  message.required = false;
  message.rows = 4;
  message.value = "";
  formServiceNote.textContent = registryEndpoint
    ? "La proposition sera enregistrée dans le registre scientifique de validation."
    : "La proposition sera transmise par Formspree jusqu’à l’activation du registre automatique.";
} else if (notice) {
  const pdfPage = page ? Math.max(1, Number(page)) : "";
  const dictionaryPage = page ? Math.max(1, Number(page) - 1) : "";
  formTitle.textContent = "Signaler une correction";
  requestTypeField.value = "correction";
  subject.value = `Correction du Répertoire — ${notice}`;
  noticeField.value = notice;
  citedPageField.value = dictionaryPage;
  pdfPageField.value = pdfPage;
  message.value = [
    `Notice : ${notice}`,
    dictionaryPage ? `Page imprimée du dictionnaire : ${dictionaryPage}` : "",
    pdfPage ? `Page technique ouverte dans le PDF : ${pdfPage}` : "",
    "",
    "Correction proposée :",
    "",
  ]
    .filter((line, index) => line || index >= 3)
    .join("\n");
} else {
  requestTypeField.value = "contact";
  subject.value = "Contact — Geomapia Conceptss";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitContact.disabled = true;
  submitContact.textContent = "Envoi en cours…";
  formStatus.className = "form-status";
  formStatus.textContent = "";

  try {
    const formData = new FormData(form);
    if (suggestion) formData.set("terme", suggestion);
    if (translationLanguage === "ar" && notice) formData.set("terme", notice);

    if ((suggestion || translationLanguage === "ar") && registryEndpoint) {
      await fetch(registryEndpoint, {
        method: "POST",
        body: formData,
        mode: "no-cors",
        redirect: "follow",
      });
    } else {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const details = result.errors?.map((error) => error.message).join(" ") || "";
        throw new Error(details || "Le service n’a pas accepté le message.");
      }
    }

    formStatus.classList.add("success");
    formStatus.textContent = translationLanguage === "ar"
      ? "Votre proposition de traduction arabe a bien été enregistrée. Elle sera examinée avant publication."
      : suggestion
      ? "Votre suggestion a bien été enregistrée. Elle sera examinée avant toute publication."
      : "Votre message a bien été envoyé. Merci pour votre contribution.";
    form.reset();
    subject.value = translationLanguage === "ar"
      ? `Proposition de traduction arabe — ${notice}`
      : suggestion
      ? `Suggestion d’ajout au Répertoire — ${suggestion}`
      : notice
        ? `Correction du Répertoire — ${notice}`
        : "Contact — Geomapia Conceptss";
    requestTypeField.value = translationLanguage === "ar" ? "traduction" : suggestion ? "suggestion" : notice ? "correction" : "contact";
    translationLanguageField.value = translationLanguage === "ar" ? "ar" : "";
    noticeField.value = suggestion || notice;
    citedPageField.value = page ? Math.max(1, Number(page) - 1) : "";
    pdfPageField.value = page ? Math.max(1, Number(page)) : "";
    sourceUrlField.value =
      suggestion && page
        ? `https://www.ffem.fr/sites/ffem/files/2026-03/dictionnaire_triplet_2026.pdf#page=${Math.max(1, Number(page))}`
        : "";
    if (suggestion) {
      suggestionFields.hidden = false;
      suggestionCategory.required = true;
      suggestionDomain.required = true;
      suggestionJustification.required = true;
    }
    if (translationLanguage === "ar") {
      translationFields.hidden = false;
      arabicTerm.required = true;
    }
  } catch (error) {
    formStatus.classList.add("error");
    formStatus.textContent =
      `L’envoi a échoué. Réessayez ou écrivez à ${recipient}. ${error.message}`;
  } finally {
    submitContact.disabled = false;
    submitContact.textContent = "Envoyer le message";
  }
});

copyEmail.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(recipient);
  } catch {
    const field = document.createElement("textarea");
    field.value = recipient;
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  copyEmail.textContent = "Adresse copiée ✓";
  setTimeout(() => {
    copyEmail.textContent = "Copier l’adresse";
  }, 1600);
});

newsletterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = newsletterForm.querySelector("#newsletterEmail")?.value.trim();
  if (!registryEndpoint) {
    newsletterStatus.className = "form-status error";
    newsletterStatus.textContent = `L’inscription est momentanément indisponible. Écrivez à ${recipient}.`;
    return;
  }
  newsletterSubmit.disabled = true;
  newsletterSubmit.textContent = "Inscription…";
  newsletterStatus.className = "form-status";
  try {
    const data = new FormData(newsletterForm);
    data.set("action", "abonnement");
    await fetch(registryEndpoint, { method: "POST", body: data, mode: "no-cors", redirect: "follow" });
    newsletterStatus.className = "form-status success";
    newsletterStatus.textContent = `Votre adresse ${email} est enregistrée. Vous recevrez les prochaines nouveautés.`;
    newsletterForm.reset();
  } catch (error) {
    newsletterStatus.className = "form-status error";
    newsletterStatus.textContent = `L’inscription a échoué. Réessayez ou écrivez à ${recipient}.`;
  } finally {
    newsletterSubmit.disabled = false;
    newsletterSubmit.textContent = "S’inscrire aux nouveautés";
  }
});
