const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const publicationRoutes = require('./routes/publications');
const recommendationRoutes = require('./routes/recommendations');
const destinationRoutes = require('./routes/destinations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/destinations', destinationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Travel Recommendation API Server is running!' });
});

// Chatbot route
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es Voyageo, un assistant voyage expert et passionné. Tu aides les utilisateurs à découvrir leurs prochaines destinations de voyage.

Ton rôle :
- Suggérer des destinations personnalisées selon les préférences (budget, climat, type de voyage, durée)
- Fournir des informations pratiques : meilleure saison, budget estimé, activités incontournables
- Donner des conseils de voyage utiles (visa, santé, culture locale)
- Être enthousiaste et inspirant tout en restant précis et utile

Style de réponse :
- Réponds en français
- Sois concis mais informatif
- Utilise des emojis avec modération pour rendre les réponses agréables
- Structure tes réponses avec des titres et listes quand approprié
- Propose 2-3 destinations maximum par réponse pour ne pas submerger l'utilisateur

Quand tu suggères une destination, mentionne :
- Le nom et le pays
- Pourquoi c'est adapté à la demande
- La meilleure période pour y aller
- Une estimation du budget
- 2-3 activités phares`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false, // Pour simplifier la gestion côté serveur Express
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: "Rate limits exceeded, please try again later." });
      }
      if (response.status === 402) {
        return res.status(402).json({ error: "Payment required, please add funds to your workspace." });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return res.status(500).json({ error: "AI gateway error" });
    }

    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error("chat error:", e);
    res.status(500).json({ error: e instanceof Error ? e.message : "Unknown error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Sync database and start server
const startServer = async () => {
  try {
    // Sync database tables
    await sequelize.sync({ force: false }); // Set to true only for initial setup, otherwise false to preserve data
    console.log('Database connected and synced successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT} to access the API`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();

module.exports = app;