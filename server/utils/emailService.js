const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to,
    subject,
    html,
    text
  });
  if (error) {
    console.error('[EMAIL] Resend error:', error);
    throw new Error(error.message);
  }
  console.log('[EMAIL] Sent via Resend, id:', data?.id);
  return data;
};

const sendPasswordResetEmail = async ({ to, resetUrl, userName }) => {
  const subject = 'Réinitialisation de votre mot de passe — AFALOU Tours';
  const displayName = userName || 'cher voyageur';
  const text = `Bonjour ${displayName},\n\nLien de réinitialisation (valide 1 heure) :\n\n${resetUrl}\n\n— AFALOU Tours`;
  const html = `<p>Bonjour <strong>${displayName}</strong>,</p><p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p><p>Ce lien expire dans 1 heure.</p>`;
  return sendEmail({ to, subject, html, text });
};

module.exports = { sendEmail, sendPasswordResetEmail };