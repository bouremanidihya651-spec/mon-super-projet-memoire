const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[EMAIL] EMAIL_USER ou EMAIL_PASS manquant dans .env');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass }
  });
};

const fromAddress = process.env.EMAIL_FROM
  || `AFALOU Tours <${process.env.EMAIL_USER}>`;

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [DEV] Email non envoyé (config manquante)');
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Text:    ${text || '(see html)'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { mocked: true };
  }

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
    text
  });

  console.log('[EMAIL] Envoyé avec succès, id:', info.messageId);
  return info;
};

const sendPasswordResetEmail = async ({ to, resetUrl, userName }) => {
  const subject = 'Réinitialisation de votre mot de passe — AFALOU Tours';
  const displayName = userName || 'cher voyageur';

  const text =
    `Bonjour ${displayName},\n\n` +
    `Cliquez sur ce lien pour réinitialiser votre mot de passe (valide 1 heure) :\n\n` +
    `${resetUrl}\n\n` +
    `Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\n` +
    `— L'équipe AFALOU Tours`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#2d7a5a;padding:24px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-family:Georgia,serif;font-size:24px;font-style:italic;">AFALOU Tours</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;color:#1a4a36;">
            <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Bonjour <strong>${displayName}</strong>,</p>
            <p style="font-size:15px;line-height:1.6;margin:0 0 24px;color:#3a4a40;">
              Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
            </p>
            <table cellspacing="0" cellpadding="0" style="margin:24px 0;">
              <tr>
                <td style="border-radius:10px;background:#2d7a5a;">
                  <a href="${resetUrl}" target="_blank"
                     style="display:inline-block;padding:14px 28px;color:#fff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">
                    Réinitialiser mon mot de passe
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-size:13px;color:#6b8f7b;margin:24px 0 0;">
              Ce lien expire dans <strong>1 heure</strong>. Si le bouton ne fonctionne pas, copiez ce lien :
            </p>
            <p style="word-break:break-all;font-size:12px;background:#f7f5f0;padding:12px;border-radius:8px;color:#2d7a5a;margin:8px 0 0;">
              ${resetUrl}
            </p>
            <hr style="border:none;border-top:1px solid #e0dcd4;margin:32px 0;" />
            <p style="font-size:12px;color:#9db8aa;margin:0;">
              Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.
            </p>
          </td>
        </tr>
      </table>
      <p style="font-size:11px;color:#9db8aa;margin-top:16px;">© ${new Date().getFullYear()} AFALOU Tours</p>
    </td></tr>
  </table>
</body>
</html>`;

  return sendEmail({ to, subject, html, text });
};

module.exports = { sendEmail, sendPasswordResetEmail };