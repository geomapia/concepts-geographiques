(function () {
  "use strict";

  function initializeNavigation() {
    const header = document.querySelector(".masthead");
    const navShell = header?.querySelector(".nav");
    const navigation = navShell?.querySelector("nav");
    if (!header || !navShell || !navigation) return;

    const currentPage =
      (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    navigation.querySelectorAll("a").forEach((link) => {
      const target = new URL(link.href, window.location.href)
        .pathname.split("/")
        .pop()
        .toLowerCase();
      if (target === currentPage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });

    const button = document.createElement("button");
    button.className = "mobile-menu-toggle";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "mobilePrimaryNavigation");
    button.setAttribute("aria-label", "Ouvrir le menu principal");
    button.innerHTML =
      '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
    navigation.id = "mobilePrimaryNavigation";
    navShell.append(button);

    function closeMenu() {
      header.classList.remove("mobile-menu-open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Ouvrir le menu principal");
    }

    function toggleMenu() {
      const isOpen = header.classList.toggle("mobile-menu-open");
      button.setAttribute("aria-expanded", String(isOpen));
      button.setAttribute(
        "aria-label",
        isOpen ? "Fermer le menu principal" : "Ouvrir le menu principal",
      );
    }

    button.addEventListener("click", toggleMenu);
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (
        header.classList.contains("mobile-menu-open") &&
        !header.contains(event.target)
      ) {
        closeMenu();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) closeMenu();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavigation);
  } else {
    initializeNavigation();
  }
})();
