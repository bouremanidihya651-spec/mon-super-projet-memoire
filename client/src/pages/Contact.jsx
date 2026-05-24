import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // 'loading' | 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // ✅ CORRECTION LIGNE 27 : backticks au lieu de guillemets simples
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text pt-32">
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif italic mb-4">{t('contactPage.title')}</h1>
          <p className="text-[#2d7a5a] dark:text-surface max-w-2xl mx-auto">
            {t('contactPage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-serif italic mb-8">{t('contactPage.infoTitle')}</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center shadow-sm border border-[#e0dcd4] dark:border-dark-border flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#2d7a5a]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a4a36] dark:text-dark-text">{t('contactPage.email')}</h3>
                  <p className="text-[#2d7a5a] dark:text-surface">contact@afalou.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center shadow-sm border border-[#e0dcd4] dark:border-dark-border flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#2d7a5a]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a4a36] dark:text-dark-text">{t('contactPage.phone')}</h3>
                  <p className="text-[#2d7a5a] dark:text-surface">+213 (0) 34 12 34 56</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center shadow-sm border border-[#e0dcd4] dark:border-dark-border flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#2d7a5a]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a4a36] dark:text-dark-text">{t('contactPage.address')}</h3>
                  <p className="text-[#2d7a5a] dark:text-surface">Rue Boumdaoui Nacer, EDIMCO, Béjaïa, Algérie</p>
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-2xl overflow-hidden h-56 border border-[#e0dcd4] dark:border-dark-border grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3202.46332158!2d5.05!3d36.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ1JzAwLjAiTiA1wrAwMycwMC4wIkU!5e0!3m2!1sfr!2sdz!4v1620000000000!5m2!1sfr!2sdz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Google Maps"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-dark-surface p-8 md:p-12 rounded-2xl shadow-sm border border-[#e0dcd4] dark:border-dark-border">
            <h2 className="text-2xl font-serif italic mb-8">{t('contactPage.formTitle')}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase font-bold tracking-widest text-[#6b8f7b] mb-2">{t('contactPage.nameLabel')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#f7f5f0] dark:bg-dark-bg border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2d7a5a] outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold tracking-widest text-[#6b8f7b] mb-2">{t('contactPage.emailLabel')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#f7f5f0] dark:bg-dark-bg border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2d7a5a] outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-widest text-[#6b8f7b] mb-2">{t('contactPage.subjectLabel')}</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#f7f5f0] dark:bg-dark-bg border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2d7a5a] outline-none transition-all"
                  placeholder={t('contactPage.subjectPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-widest text-[#6b8f7b] mb-2">{t('contactPage.messageLabel')}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full bg-[#f7f5f0] dark:bg-dark-bg border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2d7a5a] outline-none transition-all resize-none"
                  placeholder={t('contactPage.messagePlaceholder')}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#2d7a5a] text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1a4a36] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <span className="animate-pulse">{t('contactPage.sending')}</span>
                ) : status === 'success' ? (
                  <span>{t('contactPage.sent')}</span>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t('contactPage.sendButton')}
                  </>
                )}
              </button>

              {status === 'success' && (
                <p className="text-[#2d7a5a] text-center font-medium animate-fade-in">
                  {t('contactPage.successMessage')}
                </p>
              )}

              {status === 'error' && (
                <p className="text-red-600 text-center font-medium animate-fade-in">
                  {errorMessage || t('contactPage.errorMessage') || 'Une erreur est survenue. Veuillez réessayer.'}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;