import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Compass,
  Sparkles,
  Plane,
  Bus,
  Car
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

const DestinationDetail = ({ openAuthModal }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [destination, setDestination] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [activities, setActivities] = useState([]);
  const [transports, setTransports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toggle states for reviews section
  const [showComments, setShowComments] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDestinationData();
  }, [id]);

  const fetchDestinationData = async () => {
    try {
      setLoading(true);
      const destRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/destinations/${id}`);
      const destData = await destRes.json();
      setDestination(destData);

      const hotelsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/hotels/destination/${id}`);
      const hotelsData = await hotelsRes.json();
      setHotels(hotelsData.hotels || []);

      const activitiesRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/activities/destination/${id}`);
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData.activities || []);

      const transportsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/transports/destination/${id}`);
      const transportsData = await transportsRes.json();
      setTransports(transportsData.transports || []);

      const reviewsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reviews/destination/${id}`);
      const reviewsData = await reviewsRes.json();
      const reviewsList = reviewsData.reviews || reviewsData.data || [];
      setReviews(Array.isArray(reviewsList) ? reviewsList : []);
    } catch (error) {
      console.error('Error fetching destination data:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const flights = transports.filter(t => t.category === 'flight');
  const groundTransports = transports.filter(t => t.category === 'ground');
  const carRentals = transports.filter(t => t.category === 'car_rental');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2d7a5a]"></div>
          <p className="mt-4 text-lg">{t('destinationDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif italic mb-4">{t('destinationDetail.notFound')}</h1>
          <button
            onClick={() => navigate('/destinations')}
            className="text-[#2d7a5a] dark:text-surface font-bold text-sm uppercase tracking-widest flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> {t('destinationDetail.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text">

      {/* HERO */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={destination.image_url || "https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=1920&q=80"}
          alt={destination.name}
          className="w-full h-full object-cover"
        />

        <button
          onClick={() => navigate('/destinations')}
          className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-[#1a4a36] dark:text-dark-text hover:bg-[#c9a844] hover:text-white transition-all shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t('destinationDetail.back')}</span>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-4 text-white">
                <MapPin className="w-5 h-5" />
                <span className="text-lg font-medium">{destination.country || destination.location}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif italic mb-4 text-white">{destination.name}</h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#c9a844] fill-current" />
                  <span className="text-xl font-bold text-white">{destination.rating || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#c9a844]" />
                  <span className="text-xl font-bold text-white">{destination.price || 0}DA</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">

        {/* Description */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-serif italic mb-6 text-[#1a4a36] dark:text-dark-text">{t('destinationDetail.aboutTitle')}</h2>
          <p className="text-[#2d7a5a] dark:text-surface text-lg leading-relaxed mb-8">{destination.description}</p>

          {(destination.luxury_score || destination.nature_score || destination.adventure_score ||
            destination.culture_score || destination.beach_score || destination.food_score) && (
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-sm border border-[#e0dcd4] dark:border-dark-border">
              <h3 className="text-xl font-serif font-bold mb-4 text-[#1a4a36] dark:text-dark-text">{t('destinationDetail.characteristics')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {destination.luxury_score && (
                  <div className="text-center p-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-xl">
                    <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold">{(destination.luxury_score * 10).toFixed(0)}/10</div>
                    <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">{t('destinationDetail.luxury')}</div>
                  </div>
                )}
                {destination.nature_score && (
                  <div className="text-center p-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-xl">
                    <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold">{(destination.nature_score * 10).toFixed(0)}/10</div>
                    <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">{t('destinationDetail.nature')}</div>
                  </div>
                )}
                {destination.adventure_score && (
                  <div className="text-center p-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-xl">
                    <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold">{(destination.adventure_score * 10).toFixed(0)}/10</div>
                    <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">{t('destinationDetail.adventure')}</div>
                  </div>
                )}
                {destination.culture_score && (
                  <div className="text-center p-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-xl">
                    <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold">{(destination.culture_score * 10).toFixed(0)}/10</div>
                    <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">{t('destinationDetail.culture')}</div>
                  </div>
                )}
                {destination.beach_score && (
                  <div className="text-center p-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-xl">
                    <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold">{(destination.beach_score * 10).toFixed(0)}/10</div>
                    <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">{t('destinationDetail.beach')}</div>
                  </div>
                )}
                {destination.food_score && (
                  <div className="text-center p-4 bg-[#f7f5f0] dark:bg-dark-bg rounded-xl">
                    <div className="text-[#2d7a5a] dark:text-surface text-2xl font-bold">{(destination.food_score * 10).toFixed(0)}/10</div>
                    <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">{t('destinationDetail.food')}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.section>

        {/* ✈️ COMMENT S'Y RENDRE - TRANSPORTS */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-serif italic mb-6 text-[#1a4a36] dark:text-dark-text flex items-center gap-3">
            <Compass className="w-8 h-8 text-[#2d7a5a] dark:text-surface" />
            Comment s'y rendre ?
          </h2>
          
          {transports.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-10 border border-[#e0dcd4] dark:border-dark-border text-center shadow-sm">
              <Compass className="w-12 h-12 text-[#6b8f7b] dark:text-dark-text-muted mx-auto mb-3" />
              <p className="text-[#2d7a5a] dark:text-surface text-lg">Aucune option de transport disponible pour le moment</p>
            </div>
          ) : (
            <div className="space-y-8">
              {flights.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-[#1a4a36] dark:text-dark-text mb-4 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-[#2d7a5a] dark:text-surface" />
                    Vols
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {flights.map((transport) => (
                      <div key={transport.id} className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-[#e0dcd4] dark:border-dark-border shadow-sm hover:shadow-md transition-all group">
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={transport.image_url || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"}
                            alt={transport.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-[#c9a844] font-bold text-sm">{transport.price}DA</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-lg font-bold mb-2 text-[#1a4a36] dark:text-dark-text">{transport.name}</h4>
                          {transport.company && (
                            <p className="text-[#2d7a5a] dark:text-surface text-sm mb-3">{transport.company}</p>
                          )}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-[#c9a844] fill-current" />
                              <span className="text-sm font-bold text-[#1a4a36] dark:text-dark-text">{transport.rating || 'N/A'}</span>
                            </div>
                            {transport.booking_link && (
                              <a
                                href={transport.booking_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#c9a844] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all flex items-center gap-1 group/btn"
                              >
                                Réserver
                                <span className="transform group-hover/btn:translate-x-0.5 transition-transform">→</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {groundTransports.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-[#1a4a36] dark:text-dark-text mb-4 flex items-center gap-2">
                    <Bus className="w-5 h-5 text-[#2d7a5a] dark:text-surface" />
                    Transports Terrestres
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groundTransports.map((transport) => (
                      <div key={transport.id} className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-[#e0dcd4] dark:border-dark-border shadow-sm hover:shadow-md transition-all group">
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={transport.image_url || "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80"}
                            alt={transport.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-[#c9a844] font-bold text-sm">{transport.price}DA</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-lg font-bold mb-2 text-[#1a4a36] dark:text-dark-text">{transport.name}</h4>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-[#c9a844] fill-current" />
                              <span className="text-sm font-bold text-[#1a4a36] dark:text-dark-text">{transport.rating || 'N/A'}</span>
                            </div>
                            {transport.booking_link && (
                              <a
                                href={transport.booking_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#c9a844] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all flex items-center gap-1 group/btn"
                              >
                                Réserver
                                <span className="transform group-hover/btn:translate-x-0.5 transition-transform">→</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {carRentals.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-[#1a4a36] dark:text-dark-text mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-[#2d7a5a] dark:text-surface" />
                    Locations de Voiture
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {carRentals.map((transport) => (
                      <div key={transport.id} className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-[#e0dcd4] dark:border-dark-border shadow-sm hover:shadow-md transition-all group">
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={transport.image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"}
                            alt={transport.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-[#c9a844] font-bold text-sm">{transport.price}DA{transport.price_unit === 'per_day' ? '/jour' : ''}</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-lg font-bold mb-2 text-[#1a4a36] dark:text-dark-text">{transport.name}</h4>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-[#c9a844] fill-current" />
                              <span className="text-sm font-bold text-[#1a4a36] dark:text-dark-text">{transport.rating || 'N/A'}</span>
                            </div>
                            {transport.booking_link && (
                              <a
                                href={transport.booking_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#c9a844] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all flex items-center gap-1 group/btn"
                              >
                                Réserver
                                <span className="transform group-hover/btn:translate-x-0.5 transition-transform">→</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.section>

        {/* HÔTELS */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-serif italic mb-6 text-[#1a4a36] dark:text-dark-text">{t('destinationDetail.hotelsTitle')} {destination.name}</h2>
          {hotels.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-10 border border-[#e0dcd4] dark:border-dark-border text-center shadow-sm">
              <Star className="w-12 h-12 text-[#6b8f7b] dark:text-dark-text-muted mx-auto mb-3" />
              <p className="text-[#2d7a5a] dark:text-surface text-lg">{t('destinationDetail.noHotels')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-[#e0dcd4] dark:border-dark-border shadow-sm hover:shadow-md transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(hotel.stars || 0)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#c9a844] fill-current" />
                      ))}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-[#1a4a36] dark:text-dark-text">{hotel.name}</h3>
                    <p className="text-[#2d7a5a] dark:text-surface text-sm mb-3 line-clamp-2">{hotel.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#1a4a36] dark:text-dark-text">{hotel.price || 0}DA<span className="text-sm text-[#6b8f7b] dark:text-dark-text-muted">{t('destinationDetail.perNight')}</span></span>
                      <button className="bg-[#c9a844] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all flex items-center gap-1 group">
                        {t('destinationDetail.book')}
                        <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ACTIVITÉS */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-serif italic mb-6 text-[#1a4a36] dark:text-dark-text">{t('destinationDetail.activitiesTitle')} {destination.name}</h2>
          {activities.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-10 border border-[#e0dcd4] dark:border-dark-border text-center shadow-sm">
              <Sparkles className="w-12 h-12 text-[#6b8f7b] dark:text-dark-text-muted mx-auto mb-3" />
              <p className="text-[#2d7a5a] dark:text-surface text-lg">{t('destinationDetail.noActivities')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden border border-[#e0dcd4] dark:border-dark-border shadow-sm hover:shadow-md transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={activity.image_url || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"}
                      alt={activity.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2 text-[#1a4a36] dark:text-dark-text">{activity.name}</h3>
                    <p className="text-[#2d7a5a] dark:text-surface text-sm mb-3 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center gap-4 mb-3 text-sm text-[#6b8f7b] dark:text-dark-text-muted">
                      {activity.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{activity.duration}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#c9a844] fill-current" />
                        <span>{activity.rating || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-[#1a4a36] dark:text-dark-text">{activity.price || 0}DA</span>
                      <button className="bg-[#c9a844] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all flex items-center gap-1 group">
                        {t('destinationDetail.details')}
                        <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* AVIS */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-serif italic text-[#1a4a36] dark:text-dark-text">{t('destinationDetail.reviewsTitle')}</h2>
            {averageRating && (
              <div className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-full px-5 py-3 shadow-sm">
                <Star className="w-5 h-5 text-[#c9a844] fill-current" />
                <span className="text-2xl font-bold text-[#1a4a36] dark:text-dark-text">{averageRating}</span>
                <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">/ 5 · {reviews.length} avis</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-10 border border-[#e0dcd4] dark:border-dark-border text-center shadow-sm">
              <Star className="w-12 h-12 text-[#6b8f7b] dark:text-dark-text-muted mx-auto mb-3" />
              <p className="text-[#2d7a5a] dark:text-surface text-lg">{t('destinationDetail.noReviewsYet')}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 bg-[#2d7a5a] text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-[#1a4a36] transition-all duration-200"
                >
                  <span>💬</span>
                  {showComments ? 'Masquer les commentaires' : `Voir les avis (${reviews.length})`}
                </button>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showComments ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-[#e0dcd4] dark:border-dark-border shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#f7f5f0] dark:bg-dark-bg rounded-full flex items-center justify-center text-[#2d7a5a] dark:text-surface font-bold text-lg">
                            {review.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-[#1a4a36] dark:text-dark-text">{review.user?.username || t('destinationDetail.user')}</div>
                            <div className="text-[#6b8f7b] dark:text-dark-text-muted text-sm">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(review.rating) ? 'text-[#c9a844] fill-current' : 'text-[#e0dcd4] dark:text-dark-border'}`}
                            />
                          ))}
                          <span className="text-[#6b8f7b] dark:text-dark-text-muted text-sm ml-1">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-[#2d7a5a] dark:text-surface leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.section>

        {/* ✨ CTA MODERNE */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="relative overflow-hidden rounded-3xl border border-[#e0dcd4] dark:border-dark-border bg-white dark:bg-dark-surface shadow-sm p-10 md:p-14 text-center">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#f7f5f0] dark:bg-dark-bg rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#f7f5f0] dark:bg-dark-bg rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#c9a844]" />
                <span className="text-[#c9a844] text-sm font-bold uppercase tracking-widest">Expérience exclusive</span>
                <Sparkles className="w-5 h-5 text-[#c9a844]" />
              </div>

              <h3 className="text-3xl md:text-4xl font-serif italic text-[#1a4a36] dark:text-dark-text mb-3">
                Prêt à explorer <span className="text-[#c9a844]">{destination.name}</span> ?
              </h3>
              <p className="text-[#2d7a5a] dark:text-surface text-lg mb-8 max-w-xl mx-auto">
                Découvrez chaque recoin de cette destination d'exception et vivez une aventure inoubliable.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => isAuthenticated ? navigate('/dashboard') : openAuthModal('login')}
                  className="group relative flex items-center gap-3 bg-[#c9a844] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#b08a30] transition-all duration-300 shadow-lg shadow-[#c9a844]/20 hover:shadow-[#b08a30]/40 hover:scale-105"
                >
                  <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                  Découvrir & Explorer
                </button>

                <button
                  onClick={() => navigate('/destinations')}
                  className="flex items-center gap-2 border-2 border-[#e0dcd4] dark:border-dark-border text-[#2d7a5a] dark:text-surface px-8 py-4 rounded-full font-semibold text-base hover:border-[#2d7a5a] hover:bg-white dark:hover:bg-dark-surface-2 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Autres destinations
                </button>
              </div>
            </div>
          </div>
        </motion.section>

      </div>

      <footer className="bg-[#1a4a36] dark:bg-dark-bg text-white py-12 px-6 border-t dark:border-dark-border">
        <div className="max-w-7xl mx-auto text-center text-white/70 text-sm">
          <p>© 2026 Afalou. {t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default DestinationDetail;


