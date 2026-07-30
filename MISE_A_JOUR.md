# Mise à jour du Répertoire 2026.8

Cette version ajoute :

- un registre Google Sheets structuré pour examiner les propositions
  terminologiques ;
- une collecte automatique active des suggestions par Google Apps Script,
  grâce à l’URL de déploiement renseignée dans `suggestions-config.js` ;
- des champs scientifiques complémentaires dans le formulaire : rubrique,
  domaine, justification et définition proposée ;
- un contrôle des doublons et l’attribution automatique d’un identifiant à
  chaque proposition ;
- un courriel d’alerte envoyé à `jaziribrahim@gmail.com` lors de chaque nouvelle
  suggestion ;
- un statut initial « À examiner » garantissant qu’aucun terme n’est publié
  sans validation scientifique ;
- l’ouverture directe de la page PDF qui contient réellement le terme :
  page technique du fichier = page imprimée du dictionnaire + 1 ;
- dans l’index intégral, un lien automatique vers la fiche correspondante
  lorsqu’un terme appartient déjà aux concepts, indices ou conventions ;
- pour les termes absents des répertoires spécialisés, un bouton « Suggérer
  l’ajout au Répertoire » relié au formulaire Formspree et prérempli ;
- l’index intégral des 6 122 intitulés verts du dictionnaire 2026, avec
  recherche alphabétique, export CSV et lien direct vers chaque page du PDF ;
- la Convention de Ramsar comme dix-huitième instrument ;
- un lien institutionnel vérifié pour chacune des 18 conventions, chartes,
  déclarations, directives et cadres présentés ;
- un corpus porté à exactement 1 500 concepts géographiques ;
- la suppression du répertoire détaillé de la page d’accueil, désormais
  accessible uniquement depuis la page « Concepts » ;
- la mise à jour de tous les compteurs : 1 500 concepts, 43 indices,
  18 instruments et 1 561 notices spécialisées au total ;
- la vérification du bouton « Signaler une correction », adressé à
  `jaziribrahim@gmail.com` ;
- la correction de tous les renvois au PDF : le bouton ouvre la page
  technique correspondant à la page imprimée citée plus une, afin de tenir
  compte de la couverture du fichier PDF ;
- l’affichage de la page technique corrigée directement dans le libellé du
  bouton PDF ;
- une page « Nous contacter » avec l’adresse `jaziribrahim@gmail.com`, un
  formulaire envoyé par Formspree à l’endpoint `mlgqvlpw` et la reprise
  automatique de la notice concernée ;
- le remplacement du lien `mailto:` du bouton « Signaler une correction » par
  cette page de contact, afin d’éviter la dépendance à un logiciel de
  messagerie installé sur l’ordinateur ;
- une confirmation d’envoi affichée directement sur la page, avec un message
  d’erreur et l’adresse de contact en solution de repli ;
- un chargement sans cache du fichier de données afin que GitHub Pages affiche
  immédiatement la version mise à jour ;
- le titre « Répertoire géographique de la diversité biologique et de la
  conservation » dans toutes les pages et références, conformément au souhait
  exprimé par Patrick Triplet ;
- huit concepts fondamentaux supplémentaires issus du dictionnaire 2026 ;
- un bouton « Copier » sur chaque fiche, avec le concept, sa définition, sa
  source et la page correspondante ;
- une nouvelle conception visuelle de la section d’accès aux répertoires ;
- le titre complet « Concepts géographiques issus du Dictionnaire
  encyclopédique de la diversité biologique et de la conservation de la
  nature » ;
- 1 500 concepts géographiques, dont 42 concepts fondamentaux clairement
  identifiés ;
- des accès directs au climax, au biotope, à la biocénose, aux successions,
  à la dispersion et à la résilience ;
- cinq notices structurantes réintégrées : connectivité écologique,
  dispersion, migrations animale et humaine, résilience ;
- la suppression du bloc « Évolution du dictionnaire » ;
- trois pages spécialisées : concepts, indices et conventions ;
- une page « À propos » ;
- la simplification du bloc « Droits, corrections et version » ;
- des fiches documentaires enrichies ;
- des filtres par domaine, pertinence, échelle et milieu ;
- la copie des citations et des liens permanents ;
- l’export CSV et l’impression PDF ;
- la mention « Sélection et classification géographiques réalisées par
  Brahim Jaziri ».

## Publication sur GitHub

Décompresser l’archive, puis téléverser tous les fichiers et le dossier `data`
à la racine du nouveau dépôt GitHub du Répertoire.

Valider avec le message de commit :

`Préparer l’automatisation des suggestions — version 2026.8`

GitHub Pages republiera ensuite automatiquement la branche `main`.
