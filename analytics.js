(function () {
  "use strict";

  const endpoint = window.REPERTOIRE_CONFIG?.suggestionsEndpoint || "";
  if (!endpoint) return;

  const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const sentSearches = new Set();
  let searchTimer = null;

  function send(payload) {
    const body = new URLSearchParams({
      action: "statistique",
      page,
      ...payload,
    });
    fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      body,
      keepalive: true,
    }).catch(() => {
      // Les statistiques ne doivent jamais perturber la consultation du site.
    });
  }

  try {
    const sessionKey = `repertoire-page-vue:${page}`;
    if (!window.sessionStorage.getItem(sessionKey)) {
      window.sessionStorage.setItem(sessionKey, "1");
      send({ event_type: "page_view" });
    }
  } catch (error) {
    send({ event_type: "page_view" });
  }

  document.addEventListener("repertoire:search-no-result", (event) => {
    const query = String(event.detail?.query || "")
      .trim()
      .slice(0, 120);
    if (query.length < 3) return;
    const key = `${page}|${query.toLocaleLowerCase("fr")}`;
    if (sentSearches.has(key)) return;
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      sentSearches.add(key);
      send({
        event_type: "search_no_result",
        query,
      });
    }, 1200);
  });
})();
