const recipient = "jaziribrahim@gmail.com";
const params = new URLSearchParams(window.location.search);
const notice = params.get("notice")?.trim() || "";
const page = params.get("page")?.trim() || "";

const form = document.querySelector("#contactForm");
const subject = document.querySelector("#subject");
const message = document.querySelector("#message");
const formTitle = document.querySelector("#formTitle");
const copyEmail = document.querySelector("#copyEmail");

if (notice) {
  formTitle.textContent = "Signaler une correction";
  subject.value = `Correction du Répertoire — ${notice}`;
  message.value = [
    `Notice : ${notice}`,
    page ? `Page citée dans le dictionnaire : ${page}` : "",
    page ? `Page technique ouverte dans le PDF : ${Math.max(1, Number(page) - 1)}` : "",
    "",
    "Correction proposée :",
    "",
  ]
    .filter((line, index) => line || index >= 3)
    .join("\n");
} else {
  subject.value = "Contact — Répertoire géographique";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const senderName = document.querySelector("#senderName").value.trim();
  const senderEmail = document.querySelector("#senderEmail").value.trim();
  const signature = [
    "",
    senderName ? `Nom : ${senderName}` : "",
    senderEmail ? `Adresse électronique : ${senderEmail}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const gmailUrl = new URL("https://mail.google.com/mail/");
  gmailUrl.searchParams.set("view", "cm");
  gmailUrl.searchParams.set("fs", "1");
  gmailUrl.searchParams.set("to", recipient);
  gmailUrl.searchParams.set("su", subject.value.trim());
  gmailUrl.searchParams.set("body", `${message.value.trim()}${signature}`);
  window.open(gmailUrl.toString(), "_blank", "noopener,noreferrer");
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
