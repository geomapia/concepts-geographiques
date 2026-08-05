(function () {
  "use strict";

  const VERSION = "2026-08-05.1";

  function svgIcon(name) {
    const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const paths = {
      chevron: '<path d="m6 9 6 6 6-6"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      close: '<path d="M6 6l12 12M18 6 6 18"/>',
      layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
      concepts: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 7.2 11 16M16 7.2 13 16M8 6h8"/>',
      map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
      academy: '<path d="m2 10 10-5 10 5-10 5L2 10Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
      download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
      route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
      login: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/>',
      userplus: '<path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M19 8v6M16 11h6"/>'
    };
    return '<svg ' + common + '>' + (paths[name] || '') + '</svg>';
  }

  function item(href, icon, title, description, extra, current) {
    return '<a href="' + href + '"' + (current ? ' aria-current="page"' : '') + '>' +
      '<span class="gpc-parentbar__item-icon">' + svgIcon(icon) + '</span>' +
      '<span><strong>' + title + '</strong><small>' + description + '</small></span>' +
      (extra || '') + '</a>';
  }

  function parentBarHtml() {
    return '<header class="gpc-parentbar" data-gpc-parentbar data-version="' + VERSION + '">' +
      '<div class="gpc-parentbar__inner">' +
        '<a class="gpc-parentbar__brand" href="https://geomapia.tn/" aria-label="Accueil Geomapia">' +
          '<img class="gpc-parentbar__logo" src="./assets/logo-geomapia.png" alt="Logo Geomapia">' +
          '<span class="gpc-parentbar__identity"><strong>Geomapia</strong><small>Cartographier intelligemment</small></span>' +
        '</a>' +
        '<button class="gpc-parentbar__toggle" type="button" data-gpc-toggle aria-label="Ouvrir le menu Geomapia" aria-expanded="false">' + svgIcon('menu') + '</button>' +
        '<div class="gpc-parentbar__content" data-gpc-content>' +
          '<nav class="gpc-parentbar__menus" aria-label="Navigation de la plateforme Geomapia">' +
            '<div class="gpc-parentbar__group" data-gpc-group>' +
              '<button class="gpc-parentbar__menu-button" type="button" data-gpc-menu aria-expanded="false">Explorer ' + svgIcon('chevron') + '</button>' +
              '<div class="gpc-parentbar__dropdown" data-gpc-dropdown hidden>' +
                '<div class="gpc-parentbar__dropdown-title">Explorer Geomapia</div>' +
                item('https://geomapia.tn/applications.html','layers','Applications','Créer, analyser et cartographier','',false) +
                item('./index.html','concepts','Concepts','Comprendre les notions géographiques','',true) +
                item('https://geomapia.tn/Atlas/','map','Atlas','Explorer la Tunisie par les cartes','<em class="gpc-parentbar__soon">Bientôt</em>',false) +
              '</div>' +
            '</div>' +
            '<div class="gpc-parentbar__group" data-gpc-group>' +
              '<button class="gpc-parentbar__menu-button" type="button" data-gpc-menu aria-expanded="false">Apprendre ' + svgIcon('chevron') + '</button>' +
              '<div class="gpc-parentbar__dropdown" data-gpc-dropdown hidden>' +
                '<div class="gpc-parentbar__dropdown-title">Se former et progresser</div>' +
                item('https://geomapia.tn/Academy/','academy','Academy','Suivre des parcours progressifs','<em class="gpc-parentbar__soon">Bientôt</em>',false) +
                item('https://geomapia.tn/ressources.html','download','Ressources','Télécharger données et documents','',false) +
                item('https://geomapia.tn/membres/membres.html','route','Programme','Progresser et contribuer','',false) +
              '</div>' +
            '</div>' +
            '<div class="gpc-parentbar__group" data-gpc-group>' +
              '<button class="gpc-parentbar__menu-button" type="button" data-gpc-menu aria-expanded="false">Geomapia ' + svgIcon('chevron') + '</button>' +
              '<div class="gpc-parentbar__dropdown gpc-parentbar__dropdown--right" data-gpc-dropdown hidden>' +
                '<div class="gpc-parentbar__dropdown-title">La plateforme</div>' +
                item('https://geomapia.tn/about.html','info','À propos','Découvrir le projet Geomapia','',false) +
                item('https://geomapia.tn/contact.html','mail','Contact','contact@geomapia.tn','',false) +
              '</div>' +
            '</div>' +
          '</nav>' +
          '<div class="gpc-parentbar__actions">' +
            '<a class="gpc-parentbar__action" href="https://geomapia.tn/membres/">' + svgIcon('login') + '<span>Connexion</span></a>' +
            '<a class="gpc-parentbar__action gpc-parentbar__action--accent" href="https://geomapia.tn/membres/membres.html#adhesion">' + svgIcon('userplus') + '<span>Adhérer</span></a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</header>';
  }

  function platformFooterHtml() {
    return '<div class="gpc-platform-footer" data-gpc-platform-footer>' +
      '<div class="gpc-platform-footer__inner">' +
        '<div class="gpc-platform-footer__brand">' +
          '<img src="./assets/logo-geomapia.png" alt="">' +
          '<span><strong>Geomapia</strong><small>Cartographier intelligemment</small></span>' +
        '</div>' +
        '<nav class="gpc-platform-footer__links" aria-label="Les univers Geomapia">' +
          '<a href="https://geomapia.tn/applications.html">Applications</a>' +
          '<a href="./index.html" aria-current="page">Concepts</a>' +
          '<a href="https://geomapia.tn/Atlas/">Atlas</a>' +
          '<a href="https://geomapia.tn/ressources.html">Ressources</a>' +
          '<a href="https://geomapia.tn/Academy/">Academy</a>' +
        '</nav>' +
        '<div class="gpc-platform-footer__meta">' +
          '<span>© 2026 Geomapia — Plateforme géographique numérique.</span>' +
          '<span><a href="https://geomapia.tn/">geomapia.tn</a> · <a href="mailto:contact@geomapia.tn">contact@geomapia.tn</a></span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function closeDropdowns(root, except) {
    root.querySelectorAll('[data-gpc-group]').forEach(function (group) {
      if (group === except) return;
      const button = group.querySelector('[data-gpc-menu]');
      const dropdown = group.querySelector('[data-gpc-dropdown]');
      if (button) button.setAttribute('aria-expanded', 'false');
      if (dropdown) dropdown.hidden = true;
    });
  }

  function initialize() {
    if (document.querySelector('[data-gpc-parentbar]')) return;

    document.body.insertAdjacentHTML('afterbegin', parentBarHtml());
    const existingFooter = document.querySelector('.site-footer');
    if (existingFooter) existingFooter.insertAdjacentHTML('afterend', platformFooterHtml());
    else document.body.insertAdjacentHTML('beforeend', platformFooterHtml());

    document.documentElement.classList.add('gpc-shell-ready');

    const root = document.querySelector('[data-gpc-parentbar]');
    const toggle = root.querySelector('[data-gpc-toggle]');

    toggle.addEventListener('click', function () {
      const open = !root.classList.contains('is-open');
      root.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu Geomapia' : 'Ouvrir le menu Geomapia');
      toggle.innerHTML = svgIcon(open ? 'close' : 'menu');
      if (!open) closeDropdowns(root);
    });

    root.querySelectorAll('[data-gpc-menu]').forEach(function (button) {
      const group = button.closest('[data-gpc-group]');
      const dropdown = group.querySelector('[data-gpc-dropdown]');
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        const open = dropdown.hidden;
        closeDropdowns(root, group);
        dropdown.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
      });
    });

    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) closeDropdowns(root);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeDropdowns(root);
      root.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu Geomapia');
      toggle.innerHTML = svgIcon('menu');
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1050) {
        root.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = svgIcon('menu');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
