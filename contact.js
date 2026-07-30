const recipient = "jaziribrahim@gmail.com";
const params = new URLSearchParams(window.location.search);
const notice = params.get("notice")?.trim() || "";
const suggestion = params.get("suggestion")?.trim() || "";
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
const suggestionCategory = document.querySelector("#suggestionCategory");
const suggestionJustification = document.querySelector("#suggestionJustification");
const requestTypeField = document.querySelector("#requestTypeField");
const noticeField = document.querySelector("#noticeField");
const citedPageField = document.querySelector("#citedPageField");
const pdfPageField = document.querySelector("#pdfPageField");
const sourceUrlField = document.querySelector("#sourceUrlField");
const submitContact = document.querySelector("#submitContact");
const formStatus = document.querySelector("#formStatus");
const formServiceNote = document.querySelector("#formServiceNote");

if (suggestion) {
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
  subject.value = "Contact — Répertoire géographique";
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

    if (suggestion && registryEndpoint) {
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
    formStatus.textContent = suggestion
      ? "Votre suggestion a bien été enregistrée. Elle sera examinée avant toute publication."
      : "Votre message a bien été envoyé. Merci pour votre contribution.";
    form.reset();
    subject.value = suggestion
      ? `Suggestion d’ajout au Répertoire — ${suggestion}`
      : notice
        ? `Correction du Répertoire — ${notice}`
        : "Contact — Répertoire géographique";
    requestTypeField.value = suggestion ? "suggestion" : notice ? "correction" : "contact";
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
      suggestionJustification.required = true;
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
