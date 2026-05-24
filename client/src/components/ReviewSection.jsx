import React, { useState, useEffect } from 'react';
import { Star, User, Trash2, Edit2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ReviewSection = ({ targetType, targetId, openAuthModal }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [targetType, targetId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews/${targetType}/${targetId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverageRating(parseFloat(data.averageRating) || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (newRating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    if (!comment.trim()) {
      alert('Veuillez écrire un commentaire');
      return;
    }

    setSubmitting(true);
    try {
      // ✅ CORRECTION LIGNE 58 : backticks au lieu de guillemets simples
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: newRating,
          comment,
          targetType,
          targetId: parseInt(targetId)
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setComment('');
        setNewRating(0);
        fetchReviews();
      } else {
        alert(data.message || 'Erreur lors de la création du commentaire');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Erreur lors de la création du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReview = async (reviewId) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setEditingReviewId(null);
        fetchReviews();
      } else {
        alert(data.message || 'Erreur lors de la modification du commentaire');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Erreur lors de la modification du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        fetchReviews();
      } else {
        alert(data.message || 'Erreur lors de la suppression du commentaire');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Erreur lors de la suppression du commentaire');
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditComment('');
    setEditRating(0);
  };

  const StarRating = ({ rating, onRate, hoverRating, onHover, interactive = false, size = "w-5 h-5" }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && onHover(star)}
          onMouseLeave={() => interactive && onHover(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <Star
            className={`${size} ${
              star <= (hoverRating || rating)
                ? 'text-[#D4AF37] fill-current'
                : 'text-zinc-600'
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-400">Chargement des commentaires...</p>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-serif italic mb-8">
          Avis des voyageurs {totalReviews > 0 && `(${totalReviews})`}
        </h2>

        {/* Average Rating Summary */}
        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 mb-8">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#D4AF37] mb-2">{averageRating}</div>
              <StarRating rating={Math.round(averageRating)} size="w-6 h-6" />
              <p className="text-zinc-400 text-sm mt-2">{totalReviews} avis</p>
            </div>
          </div>
        </div>

        {/* Write a Review Form */}
        {(!isAuthenticated || !reviews.some(r => r.userId === user?.id)) && (
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 mb-8">
            <h3 className="text-xl font-serif font-bold mb-4">
              {isAuthenticated ? 'Laisser un avis' : 'Connectez-vous pour laisser un avis'}
            </h3>

            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-zinc-400 mb-2">Votre note</label>
                <StarRating
                  rating={newRating}
                  onRate={setNewRating}
                  hoverRating={hoverRating}
                  onHover={setHoverRating}
                  interactive
                  size="w-8 h-8"
                />
              </div>

              <div className="mb-4">
                <label className="block text-zinc-400 mb-2">Votre commentaire</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  rows={4}
                  className="w-full bg-[#0A0A0A] border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  maxLength={1000}
                />
                <p className="text-zinc-500 text-sm mt-1">{comment.length}/1000 caractères</p>
              </div>

              {isAuthenticated ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D4AF37] text-black px-6 py-3 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Envoi en cours...' : 'Publier mon avis'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="bg-[#D4AF37] text-black px-6 py-3 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-yellow-500 transition"
                >
                  Se connecter pour commenter
                </button>
              )}
            </form>
          </div>
        )}

        {/* Info message if already reviewed */}
        {isAuthenticated && reviews.some(r => r.userId === user?.id) && (
          <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800/50 mb-8 text-center">
            <p className="text-[#D4AF37] font-serif italic">Vous avez déjà publié un avis pour cet établissement. Vous pouvez le modifier ou le supprimer ci-dessous.</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">
              Aucun avis pour le moment. Soyez le premier à partager votre expérience !
            </p>
          ) : (
            reviews.map((review) => {
              const isAuthor = isAuthenticated && user?.id === review.userId;
              const isEditing = editingReviewId === review.id;

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-black font-bold">
                        {review.user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-bold">{review.user?.username || 'Utilisateur'}</div>
                        <StarRating rating={review.rating} size="w-4 h-4" />
                      </div>
                    </div>
                    
                    {isAuthor && (
                      <div className="flex gap-2">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => startEditReview(review)}
                              className="text-zinc-400 hover:text-[#D4AF37] transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-zinc-400 hover:text-red-500 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={cancelEdit}
                            className="text-zinc-400 hover:text-white transition text-sm"
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div>
                      <div className="mb-4">
                        <StarRating
                          rating={editRating}
                          onRate={setEditRating}
                          interactive
                          size="w-6 h-6"
                        />
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                        className="w-full bg-[#0A0A0A] border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateReview(review.id)}
                          disabled={submitting}
                          className="bg-[#D4AF37] text-black px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-yellow-500 transition disabled:opacity-50"
                        >
                          {submitting ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="border border-zinc-700 text-zinc-400 px-4 py-2 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-300">{review.comment}</p>
                  )}

                  <div className="text-zinc-500 text-sm mt-3">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewSection;