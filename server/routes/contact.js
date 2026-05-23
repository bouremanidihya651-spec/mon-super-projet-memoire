const express = require('express');
const { Resend } = require('resend');
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    await resend.emails.send({
      from: `${name} <onboarding@resend.dev>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `✉️ [Afalou Contact] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Georgia', serif;
              background-color: #f7f5f0;
              margin: 0;
              padding: 0;
            }
            .wrapper {
              max-width: 620px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            }
            .header {
              background-color: #1a4a36;
              padding: 36px 40px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              font-size: 28px;
              margin: 0;
              font-style: italic;
              letter-spacing: 1px;
            }
            .header p {
              color: #a8d5be;
              margin: 8px 0 0;
              font-size: 14px;
            }
            .badge {
              background-color: #2d7a5a;
              color: white;
              display: inline-block;
              padding: 4px 14px;
              border-radius: 20px;
              font-size: 12px;
              margin-top: 12px;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .body {
              padding: 36px 40px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            .info-box {
              background-color: #f7f5f0;
              border-radius: 10px;
              padding: 16px 20px;
              border-left: 4px solid #2d7a5a;
            }
            .info-box .label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #6b8f7b;
              margin-bottom: 6px;
            }
            .info-box .value {
              font-size: 15px;
              color: #1a4a36;
              font-weight: bold;
              word-break: break-all;
            }
            .subject-box {
              background-color: #f7f5f0;
              border-radius: 10px;
              padding: 16px 20px;
              border-left: 4px solid #2d7a5a;
              margin-bottom: 24px;
            }
            .subject-box .label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #6b8f7b;
              margin-bottom: 6px;
            }
            .subject-box .value {
              font-size: 15px;
              color: #1a4a36;
              font-weight: bold;
            }
            .message-box {
              background-color: #f0f7f4;
              border-radius: 10px;
              padding: 24px;
              border: 1px solid #c8e6d8;
            }
            .message-box .label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #6b8f7b;
              margin-bottom: 12px;
            }
            .message-box p {
              color: #1a4a36;
              font-size: 15px;
              line-height: 1.8;
              margin: 0;
            }
            .reply-btn {
              display: block;
              text-align: center;
              margin: 28px 0 0;
              text-decoration: none;
            }
            .reply-btn span {
              background-color: #2d7a5a;
              color: white;
              padding: 14px 36px;
              border-radius: 8px;
              font-size: 15px;
              font-weight: bold;
              display: inline-block;
            }
            .footer {
              background-color: #1a4a36;
              text-align: center;
              padding: 20px;
              color: #a8d5be;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>Afalou</h1>
              <p>Nouveau message depuis le formulaire de contact</p>
              <span class="badge">📩 Message reçu</span>
            </div>

            <div class="body">
              <div class="info-grid">
                <div class="info-box">
                  <div class="label">👤 Nom complet</div>
                  <div class="value">${name}</div>
                </div>
                <div class="info-box">
                  <div class="label">📧 Adresse email</div>
                  <div class="value">${email}</div>
                </div>
              </div>

              <div class="subject-box">
                <div class="label">📌 Sujet</div>
                <div class="value">${subject}</div>
              </div>

              <div class="message-box">
                <div class="label">💬 Message</div>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>

              <a href="mailto:${email}" class="reply-btn">
                <span>↩️ Répondre à ${name}</span>
              </a>
            </div>

            <div class="footer">
              © ${new Date().getFullYear()} Afalou · Tous droits réservés<br>
              Béjaïa, Algérie
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi" });
  }
});

module.exports = router;