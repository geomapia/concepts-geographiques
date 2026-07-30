# Répertoire géographique de la diversité biologique et de la conservation

Site académique interactif conçu par **Brahim Jaziri**.

Le site présente 1 561 notices spécialisées actualisées à partir de
l’édition 2026 du dictionnaire encyclopédique de Patrick Triplet, avec :

- quatre espaces documentaires : concepts, index intégral, indices et conventions ;
- un index intégral de 6 122 intitulés verts extraits du PDF 2026 ;
- des liens croisés entre cet index et les fiches déjà présentes dans les
  concepts, indices et conventions ;
- un formulaire permettant de suggérer l’ajout d’un terme absent ;
- un registre Google Sheets de validation scientifique, alimenté
  automatiquement par le formulaire grâce à l’application Web Apps Script ;
- une publication automatique vers GitHub lorsque la notice complète reçoit
  le statut « Validé » ;
- une visite guidée interactive, contextuelle à chaque page, affichée lors de
  la première consultation et relançable depuis l’en-tête ;
- un menu mobile complet ;
- une inscription volontaire aux nouveautés par courriel, avec diffusion
  automatique lors d’une publication ;
- des traductions arabes validées réservées aux concepts géographiques, avec
  proposition participative et validation éditoriale ;
- une recherche tolérante aux accents, parenthèses, pluriels et petites fautes
  de saisie ;
- des liens vers les concepts explicitement associés ou, à défaut, vers les
  notices du même domaine ;
- des courriels automatiques adressés au contributeur lors de la réception de
  sa suggestion puis après la décision éditoriale ;
- des statistiques agrégées sans identifiant personnel, avec suivi des
  recherches sans résultat ;
- une sauvegarde hebdomadaire du corpus et une alerte avant l’expiration du
  jeton GitHub ;
- un contrôle préalable des champs obligatoires, avec retour automatique au
  statut « À compléter » lorsqu’une information manque ;
- 1 500 concepts géographiques, 43 indices et 18 instruments internationaux ;
- la Convention de Ramsar et des liens institutionnels vérifiés pour les
  conventions, traités, chartes et déclarations ;
- définitions et synthèses fidèlement rattachées aux pages du dictionnaire ;
- recherche plein texte ;
- filtres par domaine, type, pertinence, échelle et milieu ;
- domaines spécialisés « Indices et indicateurs » et
  « Conventions, traités et accords internationaux » ;
- graphique de répartition par domaine ;
- notices et citations copiables, liens permanents, impression et export CSV ;
- référence et ouverture directe de la page PDF contenant le terme.

## Auteurs

- Source documentaire : Patrick Triplet, biologiste et docteur en écologie,
  auteur du dictionnaire encyclopédique.
- Conception du Répertoire : [Brahim Jaziri](https://brahimjaziri.jimdofree.com/),
  docteur en géographie.

**Sélection et classification géographiques réalisées par Brahim Jaziri.**

## Pages

- `index.html` : accueil et vue d’ensemble ;
- `concepts.html` : concepts géographiques ;
- `dictionnaire.html` : index intégral des intitulés verts du dictionnaire ;
- `indices.html` : indices et indicateurs ;
- `conventions.html` : conventions, traités et accords ;
- `apropos.html` : objectifs, auteurs, méthode, citation et droits.
- `contact.html` : contact direct et signalement des corrections via Gmail.
- `data/traductions-en.json` : traductions anglaises extraites des intitulés
  bilingues du dictionnaire source ;
- `data/traductions-ar.json` : premier corpus de traductions arabes validées
  pour les concepts fondamentaux ;
- `navigation.js` : navigation principale et menu mobile ;
- `analytics.js` : statistiques agrégées respectueuses de la vie privée ;
- `tour.js` : visite guidée interactive et mémorisation de la première
  consultation dans le navigateur ;
- `suggestions-config.js` : URL de l’application Web Apps Script chargée
  d’enregistrer les suggestions ;
- `automation-google-sheets/` : script de collecte, manifeste et instructions
  d’installation du registre et de la publication GitHub.

Source principale : Patrick Triplet, *Dictionnaire encyclopédique de la
diversité biologique et de la conservation de la nature*, édition 2026
(6 122 intitulés verts uniques indexés, 1 506 pages).

Page du dictionnaire : https://laccreteil.fr/spip.php?article551

## Publication

Le déploiement sur GitHub Pages est automatique à chaque modification de la
branche `main` grâce au workflow GitHub Actions.
