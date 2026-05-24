import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Heart,
  Star,
  Info,
  Send,
  Calendar,
  Compass
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import ActivityReservationModal from './ActivityReservationModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ActivityDetailPage = ({ activity, onBack, openAuthModal }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchReviews();
    checkFavoriteStatus();
  }, [activity.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/reviews/activity/${activity.id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(
        `${API_URL}/api/favorites/check/activity/${activity.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) { openAuthModal('login'); return; }

    const token = localStorage.getItem('token');
    try {
      if (isFavorite) {
        const res = await fetch(`${API_URL}/api/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const favorite = data.favorites?.find(f => f.targetId === activity.id && f.targetType === 'activity');
        if (favorite) {
          await fetch(`${API_URL}/api/favorites/${favorite.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        setIsFavorite(false);
      } else {
        await fetch(`${API_URL}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ targetType: 'activity', targetId: activity.id })
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) { alert('Veuillez sélectionner une note'); return; }
    if (!comment.trim()) { alert('Veuillez entrer un commentaire'); return; }

    try {
      const token = localStorage.getItem('token');
      if (!token) { openAuthModal('login'); return; }

      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating, comment, targetType: 'activity', targetId: activity.id })
      });

      if (res.ok) {
        setComment('');
        setRating(0);
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'ajout du commentaire");
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert("Erreur lors de l'ajout du commentaire");
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : activity.rating || '0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#2d7a5a] hover:text-yellow-400 transition-colors mb-6 group"
      >
        <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Retour</span>
      </button>

      <div
        className="relative h-[320px] overflow-hidden rounded-[20px] mb-6"
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      >
        <img
          src={activity.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80'}
          alt={activity.name}
          loading="eager"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
            imageRendering: 'auto',
            transform: 'scale(1)',
            willChange: 'transform',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-[#e0dcd4] flex items-center justify-center hover:bg-[#2d7a5a] hover:border-[#2d7a5a] transition-all group"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#2d7a5a] text-[#2d7a5a]' : 'text-white group-hover:text-black'} transition-colors`} />
        </button>

        <div className="absolute bottom-4 left-4 right-20">
          <h1 className="text-[36px] md:text-4xl font-serif font-bold text-white drop-shadow-lg">
            {activity.name}
          </h1>
        </div>

        {activity.price && (
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-[#2d7a5a] rounded-full border border-[#e0dcd4] shadow-lg">
            <span className="text-white font-bold text-lg">{activity.price} DA</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 flex-wrap py-5 border-t border-b border-[#e0dcd4] mb-7">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[#2d7a5a] fill-current" />
          <span className="text-[#1a4a36] font-bold text-lg">{averageRating}</span>
          <span className="text-[#6b8f7b] text-sm">({reviews.length} avis)</span>
        </div>

        {activity.duration && (
          <div className="flex items-center gap-2 text-[#6b8f7b]">
            <Calendar className="w-5 h-5 text-[#2d7a5a]" />
            <span className="text-sm font-medium">{activity.duration}</span>
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={toggleFavorite}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 ${
            isFavorite
              ? 'bg-[#dc2626] text-white hover:bg-red-700'
              : 'bg-[#2d7a5a] text-white hover:bg-[#1a4a36]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          <span>{isFavorite ? 'Dans les favoris' : 'Ajouter aux favoris'}</span>
        </button>
      </div>

      <div className="mb-7">
        <button
          onClick={() => setShowReservationModal(true)}
          className="w-full bg-gradient-to-r from-[#2d7a5a] to-[#1a4a36] text-white font-bold py-4 rounded-full transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-lg shadow-[#2d7a5a]/20 hover:opacity-90"
        >
          <Compass className="w-6 h-6" />
          Réserver cette activité
        </button>
      </div>

      {activity.description && (
        <div className="mb-7">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[#1a4a36]">
            <span className="text-[#2d7a5a]"><Info size={16} /></span>
            À propos
          </h3>
          <p className="text-[#6b8f7b] leading-relaxed">{activity.description}</p>
        </div>
      )}

      <div className="h-px bg-[#e0dcd4] my-7" />

      <div className="mb-7">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#1a4a36]">
          <span className="text-[#2d7a5a]">💬</span>
          Avis & Commentaires
        </h3>

        <div className="bg-[#f7f5f0] p-6 rounded-3xl border border-[#e0dcd4] mb-6">
          <div className="flex items-center gap-4">
            <div className="text-[52px] font-serif font-bold text-[#2d7a5a]">{averageRating}</div>
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(parseFloat(averageRating))
                        ? 'text-[#2d7a5a] fill-current'
                        : 'text-[#6b8f7b]'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[#6b8f7b] text-sm">{reviews.length} avis</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {!reviews.some(r => r.userId === user?.id) ? (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-[#2d7a5a] text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-[#1a4a36] transition-all duration-200"
            >
              <span>✏️</span>
              {showForm ? 'Masquer le formulaire' : 'Laisser un avis'}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#2d7a5a]/10 text-[#1a4a36] px-5 py-3 rounded-full font-bold text-sm border border-[#2d7a5a]/20">
              <Star className="w-4 h-4 fill-current" />
              <span>Avis déjà publié</span>
            </div>
          )}
          {reviews.length > 0 && (
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 bg-[#f7f5f0] text-[#1a4a36] px-5 py-3 rounded-full font-bold text-sm hover:bg-[#edeae4] transition-all duration-200 border border-[#e0dcd4]"
            >
              <span>💬</span>
              {showComments ? 'Masquer les commentaires' : `Voir les avis (${reviews.length})`}
            </button>
          )}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showForm ? 'max-h-[600px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <form onSubmit={handleSubmitReview} className="bg-[#f7f5f0] p-6 rounded-3xl border border-[#e0dcd4]">
            <label className="text-sm font-bold text-[#6b8f7b] mb-3 block">Votre note</label>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 transition-transform duration-200"
                >
                  <Star
                    className={`w-8 h-8 transition-colors duration-200 ${
                      star <= (hoverRating || rating)
                        ? 'text-[#2d7a5a] fill-current'
                        : 'text-[#6b8f7b]'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="w-full bg-white border border-[#e0dcd4] rounded-2xl px-4 py-3 text-sm text-[#1a4a36] placeholder-[#6b8f7b] outline-none focus:border-[#2d7a5a] transition-all duration-200 min-h-[120px] resize-none"
            />
            <button
              type="submit"
              className="mt-4 flex items-center gap-2 bg-[#2d7a5a] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#1a4a36] transition-all duration-200"
            >
              <Send className="w-4 h-4" />
              PUBLIER
            </button>
          </form>
        </div>

        {reviews.length > 0 && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showComments ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2d7a5a] mx-auto" />
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="pb-4 border-b border-[#e0dcd4] last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2d7a5a] to-[#1a4a36] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {review.user?.firstName?.[0] || review.user?.email?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-[#1a4a36] font-medium text-sm">
                              {review.user?.firstName || 'Utilisateur'}
                            </span>
                            <span className="text-[#6b8f7b] text-xs ml-2">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.rating
                                    ? 'text-[#2d7a5a] fill-current'
                                    : 'text-[#6b8f7b]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[#6b8f7b] text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && reviews.length === 0 && !showForm && (
          <p className="text-[#6b8f7b] text-center py-6 text-sm">Aucun avis pour le moment</p>
        )}
      </div>

      <button
        onClick={onBack}
        className="mt-6 flex items-center gap-2 text-[#2d7a5a] hover:text-yellow-400 transition-colors group"
      >
        <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Retour aux recommandations</span>
      </button>

      <ActivityReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        activity={activity}
        user={{ email: localStorage.getItem('userEmail'), phone: localStorage.getItem('userPhone') }}
      />
    </motion.div>
  );
};

export default ActivityDetailPage;