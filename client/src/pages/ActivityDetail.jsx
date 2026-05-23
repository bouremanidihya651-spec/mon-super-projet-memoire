import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Users, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ReviewSection from '../components/ReviewSection';

const ActivityDetail = ({ openAuthModal, isChatbotOpen, toggleChatbot }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/activities/${id}`);
        const data = await res.json();
        setActivity(data);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d7a5a]"></div>
          <p className="mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif italic mb-4">Activité non trouvée</h1>
          <Link to="/activities">
            <button className="text-[#2d7a5a] dark:text-surface font-bold text-sm uppercase tracking-widest flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Retour aux activités
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text">
      {/* --- HEADER WITH BACK BUTTON --- */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={activity.image_url || "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?auto=format&fit=crop&w=1920&q=80"}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#f7f5f0] dark:to-dark-bg" />

        <button
          onClick={() => navigate('/activities')}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-[#1a4a36] dark:text-dark-text hover:bg-[#c9a844] hover:text-white transition-all shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4 text-white">
                <MapPin className="w-5 h-5" />
                <span className="text-lg font-medium">{activity.location}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif italic mb-4 text-white">{activity.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#c9a844] fill-current" />
                  <span className="text-xl text-white font-bold">{activity.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-[#c9a844] font-bold">{activity.price}DA</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* --- DESCRIPTION --- */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-serif italic mb-6 text-[#1a4a36] dark:text-dark-text">À propos de cette activité</h2>
              <p className="text-[#2d7a5a] dark:text-surface text-lg leading-relaxed mb-8">{activity.description}</p>

              {/* Activity Details */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-[#e0dcd4] dark:border-dark-border shadow-sm">
                <h3 className="text-xl font-serif font-bold mb-4 text-[#1a4a36] dark:text-dark-text">Détails de l'activité</h3>
                <div className="grid grid-cols-2 gap-4">
                  {activity.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#2d7a5a] dark:text-surface" />
                      <span className="text-[#2d7a5a] dark:text-surface">Durée: {activity.duration}</span>
                    </div>
                  )}
                  {activity.participants && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#2d7a5a] dark:text-surface" />
                      <span className="text-[#2d7a5a] dark:text-surface">{activity.participants}</span>
                    </div>
                  )}
                  {activity.category && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#2d7a5a] dark:text-surface" />
                      <span className="text-[#2d7a5a] dark:text-surface capitalize">Catégorie: {activity.category}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- BOOKING CARD --- */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-[#e0dcd4] dark:border-dark-border shadow-sm sticky top-6"
            >
              <h3 className="text-2xl font-serif italic mb-6 text-[#1a4a36] dark:text-dark-text">Réserver cette expérience</h3>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#6b8f7b] dark:text-dark-text-muted">Prix par personne</span>
                  <span className="text-3xl font-bold text-[#1a4a36] dark:text-dark-text">{activity.price}DA</span>
                </div>
              </div>

              <button
                onClick={() => openAuthModal('login')}
                className="w-full bg-[#c9a844] text-white py-4 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all mb-4 flex items-center justify-center gap-2 group"
              >
                Réserver maintenant
                <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
              </button>

              <button className="w-full border-2 border-[#e0dcd4] dark:border-dark-border text-[#2d7a5a] dark:text-surface py-4 rounded-full font-bold text-sm hover:border-[#2d7a5a] hover:bg-white dark:hover:bg-dark-surface-2 transition-all flex items-center justify-center gap-2 group">
                Demander un devis personnalisé
                <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
              </button>

              <p className="text-[#6b8f7b] dark:text-dark-text-muted text-xs text-center mt-4">
                Notre équipe vous contactera sous 24h pour finaliser votre réservation
              </p>
            </motion.div>
          </div>
        </div>

        {/* --- SCORES SECTION --- */}
        {(activity.adventure_score || activity.nature_score || activity.culture_score ||
          activity.excitement_score || activity.relaxation_score) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-serif italic mb-8 text-center text-[#1a4a36] dark:text-dark-text">Scores de l'activité</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {activity.adventure_score && (
                <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-[#e0dcd4] dark:border-dark-border text-center shadow-sm">
                  <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold mb-2">{(activity.adventure_score * 10).toFixed(0)}/10</div>
                  <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Aventure</div>
                </div>
              )}
              {activity.nature_score && (
                <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-[#e0dcd4] dark:border-dark-border text-center shadow-sm">
                  <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold mb-2">{(activity.nature_score * 10).toFixed(0)}/10</div>
                  <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Nature</div>
                </div>
              )}
              {activity.culture_score && (
                <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-[#e0dcd4] dark:border-dark-border text-center shadow-sm">
                  <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold mb-2">{(activity.culture_score * 10).toFixed(0)}/10</div>
                  <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Culture</div>
                </div>
              )}
              {activity.excitement_score && (
                <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-[#e0dcd4] dark:border-dark-border text-center shadow-sm">
                  <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold mb-2">{(activity.excitement_score * 10).toFixed(0)}/10</div>
                  <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Excitation</div>
                </div>
              )}
              {activity.relaxation_score && (
                <div className="bg-white dark:bg-dark-surface rounded-xl p-4 border border-[#e0dcd4] dark:border-dark-border text-center shadow-sm">
                  <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold mb-2">{(activity.relaxation_score * 10).toFixed(0)}/10</div>
                  <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">Relaxation</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Reviews Section */}
        <ReviewSection targetType="activity" targetId={id} openAuthModal={openAuthModal} />
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#1a4a36] dark:bg-dark-bg text-white py-16 px-12 mt-16 border-t dark:border-dark-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="text-2xl font-serif font-bold text-[#c9a844] tracking-tight mb-4">TravelLux</div>
            <p className="text-white/70 text-sm">
              Votre partenaire de confiance pour des voyages de luxe exceptionnels depuis 2008.
            </p>
          </div>

          <div>
            <h4 className="text-[#c9a844] font-bold uppercase tracking-widest text-sm mb-4">Destinations</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Europe</a></li>
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Asie</a></li>
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Amérique</a></li>
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Afrique</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#c9a844] font-bold uppercase tracking-widest text-sm mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Hôtels de luxe</a></li>
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Excursions privées</a></li>
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Transferts VIP</a></li>
              <li><a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Conciergerie</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#c9a844] font-bold uppercase tracking-widest text-sm mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-white/70 text-sm">contact@travellux.com</li>
              <li className="text-white/70 text-sm">+33 1 23 45 67 89</li>
              <li className="text-white/70 text-sm">Paris, France</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/20 text-center text-white/50 text-sm">
          © 2026 TravelLux. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default ActivityDetail;
