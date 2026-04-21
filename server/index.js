const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
const Destination = require('./models/Destination');
const Review = require('./models/Review');
const HotelBackup = require('./models/HotelBackup');
const multer = require('multer');
const path = require('path');
const { authenticateToken, authorizeAdmin } = require('./middleware/auth');
const app = express();

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Rendre le dossier uploads accessible via URL (chemin absolu)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Routes ---

/**
 * Route Chat avec Gemini (Optimisée)
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Aucun message fourni." });
    }

    const userText = messages[messages.length - 1].content;
    const apiKey = process.env.LOVABLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Clé API manquante dans le fichier .env" });
    }

    // 1. Détection automatique du modèle (Flash en priorité)
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (!listData.models) {
      console.error("❌ Erreur API Google:", listData);
      return res.status(403).json({ error: "Impossible d'accéder aux modèles Gemini." });
    }

    let bestModel = listData.models.find(m => 
      m.name.includes('flash') && m.supportedGenerationMethods.includes('generateContent')
    );
    
    if (!bestModel) {
      bestModel = listData.models.find(m => m.supportedGenerationMethods.includes('generateContent'));
    }

    console.log(`🤖 Modèle auto-détecté : ${bestModel.name}`);

    // 2. Appel à l'IA
    const generateUrl = `https://generativelanguage.googleapis.com/v1/${bestModel.name}:generateContent?key=${apiKey}`;
    
    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userText }] }]
      })
    });

    const data = await response.json();
    const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je ne peux pas répondre pour le moment.";

    res.json({ choices: [{ message: { content: botText } }] });

  } catch (error) {
    console.error("🔥 Erreur Chat:", error.message);
    res.status(500).json({ error: "Erreur serveur lors de la discussion." });
  }
});


 
// Récupérer toutes les destinations (cette route est maintenant gérée par routes/destinations.js)
// app.get('/api/destinations', async (req, res) => {
//   try {
//     const destinations = await Destination.findAll();
//     res.json(destinations);
//   } catch (error) {
//     res.status(500).json({ error: "Erreur lors de la récupération." });
//   }
// });

// Modifier une destination existante
app.put('/api/destinations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Destination.update(req.body, { where: { id } });
    const updated = await Destination.findByPk(id);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Erreur lors de la mise à jour." });
  }
});

app.delete('/api/destinations/:id', async (req, res) => {
  try {
    await Destination.destroy({ where: { id: req.params.id } });
    res.json({ message: "Supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

/**
 * Importation des routes d'authentification
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/transports', require('./routes/transport'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/invoices', require('./routes/invoices'));

// --- Démarrage du Serveur et Synchro DB ---

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Vérifier la connexion à la DB
    await sequelize.authenticate();
    console.log('✅ Connexion SQLite établie avec succès.');

    // 2. Synchroniser les modèles
    await sequelize.sync();
    console.log('📂 Modèles synchronisés.');

    // 3. Lancer l'écoute
    app.listen(PORT, () => {
      console.log(`🚀 Voyageo en ligne sur : http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur critique lors du démarrage:', error);
    process.exit(1);
  }
};

startServer();