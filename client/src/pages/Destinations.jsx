import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, MapPin, User, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

const FALLBACK_IMAGE = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI0U4RjVFQyIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0ic2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMyRDZBNEYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4=`;

const Destinations = ({ openAuthModal, isChatbotOpen, toggleChatbot }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [reviewsData, setReviewsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentReviews, setRecentReviews] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 500;

  const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn(`Fetch attempt ${i + 1} failed:`, err.message);
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch('http://localhost:3000/api/destinations?limit=1000');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('API Response:', data);
      
      const destArray = Array.isArray(data.destinations) 
        ? data.destinations 
        : Array.isArray(data.rows) 
          ? data.rows 
          : Array.isArray(data) 
            ? data 
            : [];
      
      console.log('Destinations array:', destArray);
      setDestinations(destArray);
      setLoading(false);

      if (destArray.length > 0) {
        const reviewsPromises = destArray.map(async (d) => {
          try {
            const res = await fetch(`http://localhost:3000/api/reviews/destination/${d.id}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            return {
              id: d.id,
              averageRating: data.averageRating,
              totalReviews: data.totalReviews,
              reviews: (data.reviews || []).map(r => ({ ...r, destinationName: d.name }))
            };
          } catch {
            return { id: d.id, averageRating: 0, totalReviews: 0, reviews: [] };
          }
        });

        const reviewsResults = await Promise.all(reviewsPromises);
        setReviewsData(Object.fromEntries(reviewsResults.map(r => [r.id, r])));

        const flatReviews = reviewsResults
          .flatMap(r => r.reviews)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);

        setRecentReviews(flatReviews);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setFetchError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    setRetryCount(0);
    loadData();
  }, []);

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      loadData();
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          destination.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text">

      {/* --- PAGE HEADER --- */}
      <section className="relative h-25 flex flex-col items-center justify-center text-center overflow-hidden">
      </section>

      {/* --- SEARCH --- */}
      <motion.section
        className="py-12 px-6 bg-white/60 dark:bg-dark-surface/60"
        initial="hidden"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder={t('destinationsPage.searchPlaceholder')}
                className="w-full bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-full py-3 px-4 pl-12 text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-[#2d7a5a] shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b8f7b] dark:text-dark-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- DESTINATIONS GRID --- */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-12 text-center"
            initial="hidden"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-serif italic mb-4 text-[#1a4a36] dark:text-dark-text">
              {t('destinationsPage.allContinents')}
            </h2>
            <p className="text-[#2d7a5a] dark:text-surface max-w-2xl mx-auto">
              {t('destinationsPage.notFoundDescription')}
            </p>
          </motion.div>

          {/* Error message with Retry button */}
          {fetchError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 mb-8"
            >
              <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-6 inline-block shadow-sm">
                <p className="text-[#b08a30] text-lg mb-4">
                  {retryCount >= MAX_RETRIES
                    ? "Échec de chargement des destinations après plusieurs tentatives."
                    : "Une erreur est survenue lors du chargement."}
                </p>
                <button
                  onClick={handleRetry}
                  disabled={retryCount >= MAX_RETRIES}
                  className={`flex items-center gap-2 mx-auto px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition ${
                    retryCount >= MAX_RETRIES
                      ? 'bg-[#e0dcd4] dark:bg-dark-surface-2 text-[#6b8f7b] dark:text-dark-text-muted cursor-not-allowed'
                      : 'bg-[#c9a844] text-white hover:bg-[#b08a30]'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${retryCount < MAX_RETRIES ? 'animate-spin' : ''}`} />
                  {retryCount >= MAX_RETRIES ? 'Échec des tentatives' : `Réessayer (${retryCount + 1}/${MAX_RETRIES})`}
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <p className="text-[#6b8f7b] dark:text-dark-text-muted col-span-3 text-center">{t('featured.loading')}</p>
            ) : fetchError ? (
              <p className="text-[#b08a30] col-span-3 text-center">Erreur de chargement</p>
            ) : filteredDestinations.length === 0 ? (
              <div className="text-center py-20 col-span-3">
                <h3 className="text-2xl font-serif italic mb-4 text-[#1a4a36] dark:text-dark-text">{t('destinationsPage.notFound')}</h3>
                <p className="text-[#2d7a5a] dark:text-surface">{t('destinationsPage.notFoundDescription')}</p>
              </div>
            ) : (
              filteredDestinations.map((destination) => (
                <Link
                  key={destination.id}
                  to="/register"
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border shadow-sm hover:shadow-md transition-all hover:-translate-y-2 block no-underline"
                >
                  <div className="relative">
                    <img
                      src={destination.image_url || FALLBACK_IMAGE}
                      alt={destination.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-[#c9a844] fill-current" />
                      <span className="text-sm text-[#1a4a36] dark:text-dark-text font-medium">{destination.rating}</span>
                      {reviewsData[destination.id]?.totalReviews > 0 && (
                        <span className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">
                          ({reviewsData[destination.id].totalReviews} {t('destinationsPage.reviews')})
                        </span>
                      )}
                      <MapPin className="w-4 h-4 ml-4 text-[#2d7a5a] dark:text-surface" />
                      <span className="text-sm text-[#2d7a5a] dark:text-surface">{destination.country || destination.location}</span>
                    </div>

                    <h3 className="text-xl font-serif font-bold mb-2 text-[#1a4a36] dark:text-dark-text">{destination.name}</h3>
                    <p className="text-[#2d7a5a] dark:text-surface mb-4 text-sm line-clamp-2">{destination.description}</p>

                    <div className="flex justify-end items-center">
                      <div className="bg-[#c9a844] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all flex items-center gap-1 group/btn">
                        Découvrir
                        <ChevronRight className="w-4 h-4 transform group-hover/btn:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
};

export default Destinations;
