# Pétrocores – Les 4 Armées

Escape game en plein air dans les villages du Périgord Noir (1 village / semaine, hiver).
Saison 1 : « Le Secret des Templiers », pilote à Saint-Geniès, finale à Domme.
Plan complet : https://claude.ai/code/artifact/6af65ad3-aa05-4444-9541-ff22e567f696

## Qui fait quoi
- Claude (chat claude.ai) : scénario, énigmes, textes FR/EN/ES, recherches → écrit dans `scenario/`
- Claude Code (PC) : l'application dans `app/`, git, GitHub Pages, paquet Android (Google Play)
- On ne modifie pas les fichiers de l'autre. On se passe le relais par `ETAT.md`.

## GitHub
- Organisation `Dordrone` (propriétaire : compte xlloollx), dépôt `Petrocores` (public), Pages : https://dordrone.github.io/Petrocores/
- Ne jamais toucher aux autres dépôts de xlloollx.

## Règles
- Gonzalo n'est pas développeur : réponses simples, en français.
- Méthode Sentia : PWA vanilla HTML/CSS/JS, pas de framework ni de build ; trilingue {fr,en,es} obligatoire pour tout texte affiché ou lu.
- Le code ne contient AUCUN texte de scénario : il lit `scenario/<village>/episode.json`.
- Photos optimisées (max 1600 px, JPEG 80), noms sans accents ni espaces.
- Clé de signature Android : jamais dans le dépôt git, sauvegarde séparée.
- Travailler en local, montrer à Gonzalo, publier après son accord.
