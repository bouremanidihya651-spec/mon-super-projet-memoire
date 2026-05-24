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

const contactRoutes = require('./routes/contact');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

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

    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (!listData.models) {
      return res.status(403).json({ error: "Impossible d'accéder aux modèles Gemini." });
    }

    let bestModel = listData.models.find(m =>
      m.name.includes('flash') && m.supportedGenerationMethods.includes('generateContent')
    );

    if (!bestModel) {
      bestModel = listData.models.find(m => m.supportedGenerationMethods.includes('generateContent'));
    }

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
    console.error("Erreur Chat:", error.message);
    res.status(500).json({ error: "Erreur serveur lors de la discussion." });
  }
});

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
app.use('/api/contact', contactRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion DB etablie.');

    await sequelize.sync();
        console.log('Modeles synchronises.');

    // Seed automatique si DB vide
        const count = await Destination.count();
    if (count === 0) {
      try {
        await require('./seed.js');
        console.log('Seed execute avec succes.');
      } catch (e) {
        console.log('Seed ignore:', e.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`Serveur en ligne sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur critique:', error);
    process.exit(1);
  }
};

startServer();