import React from 'react';
import { Link } from 'react-router-dom';
import { Award, MapPin, Globe, Star, Phone, Clock, Compass, Shield, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Footer from '../components/Footer';

const About = ({ openAuthModal, isChatbotOpen, toggleChatbot }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text">

      {/* --- HERO SECTION --- */}
      <section className="relative h-25 flex flex-col items-center justify-center text-center overflow-hidden">
       

       
      </section>

      {/* --- STATS BANNER --- */}
      <section className="bg-white dark:bg-dark-surface py-16 px-6 shadow-sm border-b border-[#e0dcd4] dark:border-dark-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-[#2d7a5a] dark:text-surface" />
            </div>
            <h3 className="text-4xl font-serif font-bold mb-1 text-[#1a4a36] dark:text-dark-text">15+</h3>
            <p className="text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase font-bold tracking-widest">
              {t('aboutPage.yearsExperience', "Années d'expérience")}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-[#2d7a5a] dark:text-surface" />
            </div>
            <h3 className="text-4xl font-serif font-bold mb-1 text-[#1a4a36] dark:text-dark-text">48</h3>
            <p className="text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase font-bold tracking-widest">
              {t('aboutPage.wilayasCovered', 'Wilayas couvertes')}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
              <Globe className="w-8 h-8 text-[#2d7a5a] dark:text-surface" />
            </div>
            <h3 className="text-4xl font-serif font-bold mb-1 text-[#1a4a36] dark:text-dark-text">20+</h3>
            <p className="text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase font-bold tracking-widest">
              {t('aboutPage.internationalDest', 'Destinations internationales')}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-[#2d7a5a] dark:text-surface" />
            </div>
            <h3 className="text-4xl font-serif font-bold mb-1 text-[#1a4a36] dark:text-dark-text">4.8/5</h3>
            <p className="text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase font-bold tracking-widest">
              {t('aboutPage.averageRating', 'Note moyenne')}
            </p>
          </div>
        </div>
      </section>

      {/* --- MISSION SECTION --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif italic mb-6 text-[#1a4a36] dark:text-dark-text">
                {t('aboutPage.missionTitle', 'Notre Mission')}
              </h2>
              <p className="text-[#2d7a5a] dark:text-surface mb-6 text-lg leading-relaxed">
                {t('aboutPage.missionP1', 'Chez Afalou Tours, nous croyons que chaque voyage est une opportunité de créer des souvenirs inoubliables. Notre mission est de transformer vos rêves de voyage en expériences réelles exceptionnelles.')}
              </p>
              <p className="text-[#2d7a5a] dark:text-surface mb-6 text-lg leading-relaxed">
                {t('aboutPage.missionP2', 'Nous sélectionnons méticuleusement les destinations, hôtels et expériences les plus prestigieux pour vous offrir un service irréprochable et des moments d\'exception.')}
              </p>
              <p className="text-[#2d7a5a] dark:text-surface text-lg leading-relaxed">
                {t('aboutPage.missionP3', 'Notre équipe d\'experts, passionnés par les voyages et le service, est dédiée à créer des itinéraires sur mesure qui répondent à vos attentes les plus élevées.')}
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1548786811-dd6e453ccca7?auto=format&fit=crop&w=800&q=80"
                alt={t('aboutPage.algeriaTourismAlt', 'Tourisme en Algérie')}
                className="rounded-2xl shadow-md border border-[#e0dcd4] dark:border-dark-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUES SECTION --- */}
      <section className="py-24 px-6 bg-[#f7f5f0] dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif italic mb-4 text-[#1a4a36] dark:text-dark-text">
              {t('aboutPage.engagementsTitle', 'Nos engagements')}
            </h2>
            <p className="text-[#2d7a5a] dark:text-surface max-w-2xl mx-auto">
              {t('aboutPage.engagementsSubtitle', 'Chaque recommandation, chaque voyage organisé reflète nos valeurs fondamentales.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-[#e0dcd4] dark:border-dark-border shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
                <Compass className="w-8 h-8 text-[#2d7a5a] dark:text-surface" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4 text-[#1a4a36] dark:text-dark-text text-center">
                {t('aboutPage.value1Title', 'Recommandations personnalisées')}
              </h3>
              <p className="text-[#2d7a5a] dark:text-surface text-center">
                {t('aboutPage.value1Desc', 'Notre système analyse vos préférences pour vous suggérer les destinations algériennes qui vous correspondent le mieux, qu\'il s\'agisse de sites naturels, culturels ou balnéaires.')}
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-[#e0dcd4] dark:border-dark-border shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#2d7a5a] dark:text-surface" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4 text-[#1a4a36] dark:text-dark-text text-center">
                {t('aboutPage.value2Title', 'Service complet clé en main')}
              </h3>
              <p className="text-[#2d7a5a] dark:text-surface text-center">
                {t('aboutPage.value2Desc', 'De la réservation de billets d\'avion au traitement de visas, en passant par les transferts VIP et l\'hébergement, nous gérons chaque détail de votre voyage.')}
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-[#e0dcd4] dark:border-dark-border shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-[#2d7a5a] dark:text-surface" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4 text-[#1a4a36] dark:text-dark-text text-center">
                {t('aboutPage.value3Title', 'Expertise locale et nationale')}
              </h3>
              <p className="text-[#2d7a5a] dark:text-surface text-center">
                {t('aboutPage.value3Desc', 'Basés à Béjaïa, nous connaissons intimement le terrain algérien — de Tikjda à Biskra, du Lac L\'antenne aux Hammam Debagh de Guelma — pour vous offrir des excursions authentiques.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT INFO SECTION --- */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif italic mb-4 text-[#1a4a36] dark:text-dark-text">
              {t('aboutPage.contactTitle', 'Nous contacter')}
            </h2>
            <p className="text-[#2d7a5a] dark:text-surface max-w-2xl mx-auto">
              {t('aboutPage.contactSubtitle', 'Notre équipe est disponible du dimanche au jeudi pour répondre à toutes vos questions.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-[#e0dcd4] dark:border-dark-border shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#c9a844]" />
              </div>
              <h3 className="text-lg font-serif font-bold mb-2 text-[#1a4a36] dark:text-dark-text">
                {t('aboutPage.addressTitle', 'Adresse')}
              </h3>
              <p className="text-[#2d7a5a] dark:text-surface text-sm">
                {t('aboutPage.addressDetail', 'Rue Boumdaoui Nacer, Béjaïa, Algérie')}
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-[#e0dcd4] dark:border-dark-border shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-[#c9a844]" />
              </div>
              <h3 className="text-lg font-serif font-bold mb-2 text-[#1a4a36] dark:text-dark-text">
                {t('aboutPage.phoneTitle', 'Téléphone')}
              </h3>
              <p className="text-[#2d7a5a] dark:text-surface text-sm">
                +213 (0) 34 12 04 84<br />
                +213 (0) 550 56 30 90<br />
                +213 (0) 552 68 16 11
              </p>
            </div>

            <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-[#e0dcd4] dark:border-dark-border shadow-sm text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#c9a844]" />
              </div>
              <h3 className="text-lg font-serif font-bold mb-2 text-[#1a4a36] dark:text-dark-text">
                {t('aboutPage.hoursTitle', 'Horaires')}
              </h3>
              <p className="text-[#2d7a5a] dark:text-surface text-sm">
                {t('aboutPage.sundayThursday', 'Dimanche – Jeudi')}<br />
                {t('aboutPage.openingHours', '08h30 – 18h30')}<br />
                <span className="text-[#c9a844] font-semibold">{t('aboutPage.closedFriSat', 'Fermé Ven. & Sam.')}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-6 bg-white dark:bg-dark-surface border-t border-[#e0dcd4] dark:border-dark-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif italic mb-4 text-[#1a4a36] dark:text-dark-text">
            {t('aboutPage.ctaTitle', 'Prêt à découvrir l\'Algérie ?')}
          </h2>
          <p className="text-[#2d7a5a] dark:text-surface mb-8 max-w-2xl mx-auto">
            {t('aboutPage.ctaDescription', 'Laissez notre système vous recommander la destination idéale selon vos envies, ou contactez-nous directement pour organiser votre prochain voyage.')}
          </p>
          <button className="bg-[#c9a844] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all flex items-center gap-2 mx-auto group">
            {t('aboutPage.ctaButton', 'Découvrir les destinations')}
            <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
};

export default About;

