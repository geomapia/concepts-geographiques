const recipient = "jaziribrahim@gmail.com";
const params = new URLSearchParams(window.location.search);
const notice = params.get("notice")?.trim() || "";
const suggestion = params.get("suggestion")?.trim() || "";
const page = params.get("page")?.trim() || "";

const form = document.querySelector("#contactForm");
const subject = document.querySelector("#subject");
const message = document.querySelector("#message");
const formTitle = document.querySelector("#formTitle");
const copyEmail = document.querySelector("#copyEmail");
const noticeField = document.querySelector("#noticeField");
const citedPageField = document.querySelector("#citedPageField");
const pdfPageField = document.querySelector("#pdfPageField");
const submitContact = document.querySelector("#submitContact");
const formStatus = document.querySelector("#formStatus");

if (suggestion) {
  const pdfPage = page ? Math.max(1, Number(page)) : "";
  formTitle.textContent = "Suggérer l’ajout d’un terme";
  subject.value = `Suggestion d’ajout au Répertoire — ${suggestion}`;
  noticeField.value = suggestion;
  citedPageField.value = page ? Math.max(1, Number(page) - 1) : "";
  pdfPageField.value = pdfPage;
  message.value = [
    `Terme proposé : ${suggestion}`,
    page ? `Page technique du PDF : ${pdfPage}` : "",
    page ? `Page imprimée du dictionnaire : ${Math.max(1, Number(page) - 1)}` : "",
    "",
    "Justification ou intérêt géographique du terme :",
    "",
  ]
    .filter((line, index) => line || index >= 3)
    .join("\n");
} else if (notice) {
  const pdfPage = page ? Math.max(1, Number(page)) : "";
  const dictionaryPage = page ? Math.max(1, Number(page) - 1) : "";
  formTitle.textContent = "Signaler une correction";
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
  subject.value = "Contact — Répertoire géographique";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitContact.disabled = true;
  submitContact.textContent = "Envoi en cours…";
  formStatus.className = "form-status";
  formStatus.textContent = "";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      const details = result.errors?.map((error) => error.message).join(" ") || "";
      throw new Error(details || "Le service n’a pas accepté le message.");
    }

    formStatus.classList.add("success");
    formStatus.textContent = "Votre message a bien été envoyé. Merci pour votre contribution.";
    form.reset();
    subject.value = suggestion
      ? `Suggestion d’ajout au Répertoire — ${suggestion}`
      : notice
        ? `Correction du Répertoire — ${notice}`
        : "Contact — Répertoire géographique";
    noticeField.value = suggestion || notice;
    citedPageField.value = page ? Math.max(1, Number(page) - 1) : "";
    pdfPageField.value = page ? Math.max(1, Number(page)) : "";
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
