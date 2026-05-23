# Serveur Backend pour le Chatbot Voyageo

Ce serveur backend permet de connecter votre application frontend React avec l'IA Voyageo via l'API Lovable.

## Configuration requise

- [Deno](https://deno.com/) installé sur votre système
- Une clé API Lovable valide

## Installation

1. Créez un fichier `.env` à la racine de votre projet avec votre clé API :
```
LOVABLE_API_KEY=votre_cle_api_ici
```

2. Pour exécuter le serveur, utilisez la commande suivante :
```bash
deno run --allow-env --allow-net chatbot_server.js
```

## Configuration du frontend

Assurez-vous que votre composant Chatbot dans `src/components/Chatbot.jsx` pointe vers l'URL correcte de votre serveur backend (par défaut `http://localhost:8000/`).

## Variables d'environnement

- `LOVABLE_API_KEY` : Votre clé API pour accéder au service Lovable AI

## Fonctionnement

Le serveur reçoit les messages du frontend, les transmet à l'IA Voyageo avec le prompt système approprié, puis renvoie la réponse à votre application frontend.

## Dépannage

Si vous rencontrez des erreurs :
- Vérifiez que votre clé API est correctement configurée
- Assurez-vous que le serveur est en cours d'exécution sur le port 8000
- Vérifiez que votre frontend envoie les données dans le bon format