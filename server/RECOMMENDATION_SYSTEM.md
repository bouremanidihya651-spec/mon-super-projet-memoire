# Système de Recommandation Hybride - Voyageo

Ce document explique le fonctionnement du nouveau système de recommandation hybride implémenté dans l'application Voyageo.

## 🎯 Vue d'ensemble

Le système combine **3 approches** pour fournir des recommandations personnalisées :

1. **Content-Based Filtering** (Similarité Cosinus)
2. **Collaborative Filtering** (Utilisateurs similaires)
3. **K-means Clustering** (Pour le cold start)

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RECOMMANDATION HYBRIDE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐ │
│  │ Content-Based    │  │ Collaborative    │  │ K-means   │ │
│  │ (Cosine)         │  │ Filtering        │  │ Clustering│ │
│  │                  │  │                  │  │           │ │
│  │ - Similarité     │  │ - Utilisateurs   │  │ - Cold    │ │
│  │   cosinus        │  │   similaires     │  │   start   │ │
│  │ - Tags Jaccard   │  │ - Matrix         │  │ - Profils │ │
│  │ - Features       │  │   factorization  │  │   groupes │ │
│  └────────┬─────────┘  └────────┬─────────┘  └─────┬─────┘ │
│           │                     │                   │       │
│           └─────────────────────┼───────────────────┘       │
│                                 │                           │
│                    ┌────────────▼────────────┐              │
│                    │    ORCHESTRATEUR        │              │
│                    │    (Fusion & Tri)       │              │
│                    └────────────┬────────────┘              │
│                                 │                           │
│                    ┌────────────▼────────────┐              │
│                    │  RECOMMANDATIONS FINALES│              │
│                    └─────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Composants

### 1. Content-Based Filtering

**Fichier:** `server/utils/hybridRecommendationEngine.js`

**Algorithme:**
- **Similarité Cosinus** entre le vecteur de préférences utilisateur et le vecteur de features de la destination
- **Similarité Jaccard** pour les tags communs

**Features utilisées:**
```javascript
[
  luxury_score,
  nature_score,
  adventure_score,
  culture_score,
  beach_score,
  food_score
]
```

**Formule:**
```
Score = 0.7 × CosineSimilarity(userVector, destVector) 
      + 0.3 × JaccardSimilarity(userTags, destTags)
```

---

### 2. Collaborative Filtering

**Fichier:** `server/utils/hybridRecommendationEngine.js`

**Algorithme:**
1. Construit la matrice Utilisateur × Destination avec les ratings
2. Trouve les k utilisateurs les plus similaires (cosine similarity)
3. Prédit le rating pour chaque destination non-visitée
4. Recommande les destinations avec les plus hauts ratings prédits

**Formule:**
```
Rating_prédit(u, i) = Σ(sim(u, v) × rating(v, i)) / Σ(sim(u, v))
                      v ∈ utilisateurs_similaires
```

---

### 3. K-means Clustering (Cold Start)

**Fichier:** `server/utils/hybridRecommendationEngine.js`

**Algorithme:**
1. Regroupe les utilisateurs en k clusters basés sur leurs préférences
2. Pour chaque cluster, identifie les destinations populaires
3. Pour un nouvel utilisateur, l'assigne à un cluster et recommande les destinations populaires de ce cluster

**Features pour le clustering:**
```javascript
[
  luxury_score,
  nature_score,
  adventure_score,
  culture_score,
  beach_score,
  food_score,
  travelerType (encodé)
]
```

---

## 📁 Structure des fichiers

```
server/
├── models/
│   ├── User.js              # Modèle utilisateur (ajout: travelerType)
│   ├── UserPreference.js    # NOUVEAU: Préférences utilisateur
│   ├── Destination.js       # Modèle destination
│   └── Review.js            # Modèle review (ratings)
├── controllers/
│   ├── authController.js    # Inscription avec préférences
│   └── recommendationController.js  # NOUVEAU: Contrôleur de recommandation
├── routes/
│   ├── auth.js              # Routes d'inscription modifiées
│   └── recommendations.js   # NOUVEAU: Routes de recommandation
├── utils/
│   └── hybridRecommendationEngine.js  # NOUVEAU: Moteur de recommandation
├── migrate.js               # Script de migration DB
└── seed.js                  # Script de seed avec données de test
```

---

## 🚀 API Endpoints

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription avec préférences |
| POST | `/api/auth/login` | Connexion |

### Recommandations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/recommendations/hybrid` | **Recommandations hybrides** (principal) |
| GET | `/api/recommendations/content-based` | Content-based uniquement |
| GET | `/api/recommendations/collaborative` | Collaborative filtering uniquement |
| GET | `/api/recommendations/cold-start` | Cold start (nouveaux utilisateurs) |
| GET | `/api/recommendations/popular` | Destinations populaires |
| POST | `/api/recommendations/rate` | Ajouter un rating |
| GET | `/api/recommendations/explain/:id` | Expliquer une recommandation |
| POST | `/api/recommendations/clustering/run` | Exécuter K-means (admin) |

---

## 📝 Exemples d'utilisation

### 1. Inscription avec préférences

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "age": 30,
  "travelerType": "couple",
  "luxury_score": 0.8,
  "nature_score": 0.6,
  "adventure_score": 0.3,
  "culture_score": 0.7,
  "beach_score": 0.9,
  "food_score": 0.8,
  "minBudget": 1000,
  "maxBudget": 5000,
  "preferredTags": ["plage", "luxe", "gastronomie"]
}
```

### 2. Obtenir les recommandations hybrides

```bash
GET /api/recommendations/hybrid?limit=10&contentWeight=0.5&collabWeight=0.3&coldStartWeight=0.2
Authorization: Bearer <TOKEN>
```

**Réponse:**
```json
{
  "success": true,
  "count": 10,
  "recommendations": [
    {
      "id": 2,
      "name": "Maldives - Resort Privé",
      "description": "Bungalows sur pilotis dans un lagon cristallin",
      "price": 1200,
      "rating": 4.9,
      "contentScore": 0.85,
      "collaborativeScore": 4.5,
      "finalScore": 0.78,
      "explanation": "Recommandé pour: luxe, plage, gastronomie"
    },
    ...
  ]
}
```

### 3. Ajouter un rating

```bash
POST /api/recommendations/rate
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "destinationId": 2,
  "rating": 5,
  "comment": "Séjour incroyable!"
}
```

---

## 🧪 Données de test

Le script `seed.js` crée :

- **4 utilisateurs** avec des profils différents :
  - `solo.adventurer@example.com` (nature, aventure)
  - `luxury.couple@example.com` (luxe, plage)
  - `family@example.com` (culture, famille)
  - `business@example.com` (luxe, gastronomie)

- **8 destinations** variées :
  - Chamonix Mont-Blanc (montagne, aventure)
  - Maldives (plage, luxe)
  - Rome (culture, histoire)
  - Costa Rica (nature, aventure)
  - Paris (gastronomie, culture)
  - Bali (famille, plage)
  - New York (ville, culture)
  - Safari Tanzanie (nature, safari)

- **14 reviews** pour le collaborative filtering

### Utilisation

```bash
# 1. Lancer la migration
npm run migrate

# 2. Seeder la base de données
npm run seed

# 3. Démarrer le serveur
npm run dev

# 4. Tester avec un utilisateur
# Login: solo.adventurer@example.com / user123
```

---

## 🎯 Stratégie de recommandation

L'orchestrateur choisit automatiquement la meilleure stratégie :

| Cas | Stratégie |
|-----|-----------|
| Nouvel utilisateur (pas de préférences, pas d'historique) | **Cold Start** (K-means) |
| Utilisateur avec historique (reviews) | **Hybride** (Content + Collaborative) |
| Utilisateur avec préférences seulement | **Content-Based** uniquement |

---

## 📈 Améliorations futures

1. **Deep Learning** : Utiliser un autoencoder pour le collaborative filtering
2. **NLP** : Analyser les descriptions textuelles avec TF-IDF
3. **Real-time** : Mettre à jour les recommandations en temps réel
4. **A/B Testing** : Tester différents poids pour l'orchestrateur
5. **Expliabilité** : Ajouter des explications plus détaillées

---

## 📚 Références

- **Cosine Similarity**: https://en.wikipedia.org/wiki/Cosine_similarity
- **K-means**: https://en.wikipedia.org/wiki/K-means_clustering
- **Collaborative Filtering**: https://en.wikipedia.org/wiki/Collaborative_filtering
- **ml-distance**: https://www.npmjs.com/package/ml-distance
- **ml-kmeans**: https://www.npmjs.com/package/ml-kmeans
