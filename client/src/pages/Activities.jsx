import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

const Activities = ({ openAuthModal, isChatbotOpen, toggleChatbot }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState([]);
  const [reviewsData, setReviewsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/activities?limit=100');
        const data = await res.json();
        const activitiesArray = data.activities || data || [];
        setActivities(activitiesArray);

        const reviewsPromises = activitiesArray.map(async (a) => {
          try {
            const res = await fetch(`http://localhost:3000/api/reviews/activity/${a.id}`);
            const data = await res.json();
            return { id: a.id, averageRating: data.averageRating, totalReviews: data.totalReviews };
          } catch {
            return { id: a.id, averageRating: 0, totalReviews: 0 };
          }
        });
        const reviewsResults = await Promise.all(reviewsPromises);
        setReviewsData(Object.fromEntries(reviewsResults.map(r => [r.id, r])));

        const allReviewsPromises = activitiesArray.map(async (a) => {
          try {
            const res = await fetch(`http://localhost:3000/api/reviews/activity/${a.id}`);
            const data = await res.json();
            return (data.reviews || []).map(r => ({ ...r, activityName: a.name }));
          } catch {
            return [];
          }
        });
        const allReviewsResults = await Promise.all(allReviewsPromises);
        const flatReviews = allReviewsResults.flat().sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 6);
        setRecentReviews(flatReviews);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesPrice = activity.price >= priceRange[0] && activity.price <= priceRange[1];
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  const categories = ['all', 'nautisme', 'gastronomie', 'bien-être', 'aventure', 'culture'];
  const durations = ['all', '1-2 heures', '3-4 heures', 'journée'];

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text">

      {/* --- PAGE HEADER --- */}
      <section className="relative h-96 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544950984-749bff81f751?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury activities"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif italic mb-4 text-white">{t('activitiesPage.title')}</h1>
          <p className="text-white/90 text-lg">
            {t('activitiesPage.subtitle')}
          </p>
        </div>
      </section>

      {/* --- FILTERS AND SEARCH --- */}
      <section className="py-12 px-6 bg-white/60 dark:bg-dark-surface/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="relative w-full lg:w-1/3">
              <input
                type="text"
                placeholder={t('activitiesPage.searchPlaceholder')}
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

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <select
                className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-full py-3 px-4 text-[#1a4a36] dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#2d7a5a] shadow-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? t('activitiesPage.allCategories') : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <select
                className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-full py-3 px-4 text-[#1a4a36] dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#2d7a5a] shadow-sm"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
              >
                {durations.map(duration => (
                  <option key={duration} value={duration}>
                    {duration === 'all' ? t('activitiesPage.allDurations') : duration === 'journée' ? t('activitiesPage.fullDay') : duration}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-full py-3 px-4 shadow-sm">
                <span className="text-sm text-[#2d7a5a] dark:text-surface">{t('activitiesPage.priceRange')}</span>
                <span className="text-[#c9a844] font-bold">{priceRange[0]}DA - {priceRange[1]}DA</span>
              </div>

              <button className="flex items-center gap-2 bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-full py-3 px-4 text-[#2d7a5a] dark:text-surface hover:border-[#2d7a5a] hover:bg-[#f7f5f0] dark:hover:bg-dark-surface-2 transition-all shadow-sm">
                <Filter className="w-4 h-4" />
                <span>{t('activitiesPage.advancedFilters')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- ACTIVITIES GRID --- */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-serif italic mb-4 text-[#1a4a36] dark:text-dark-text">
              {selectedCategory === 'all' ? t('activitiesPage.allActivities') : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} ${t('activitiesPage.categoryActivities')}`}
            </h2>
            <p className="text-[#2d7a5a] dark:text-surface max-w-2xl mx-auto">
              {t('activitiesPage.notFoundDescription')}
            </p>
          </div>

          {loading ? (
            <p className="text-[#6b8f7b] dark:text-dark-text-muted text-center col-span-3">{t('activitiesPage.loading')}</p>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-20 col-span-3">
              <h3 className="text-2xl font-serif italic mb-4 text-[#1a4a36] dark:text-dark-text">{t('activitiesPage.notFound')}</h3>
              <p className="text-[#2d7a5a] dark:text-surface">{t('activitiesPage.notFoundDescription')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border shadow-sm hover:shadow-md transition-all">
                        <div className="relative">
                          <img
                            src={activity.image_url || "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?auto=format&fit=crop&w=800&q=80"}
                            alt={activity.name}
                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-4 right-4 flex gap-2">
                            <div className="bg-[#1a4a36]/90 backdrop-blur-sm px-3 py-1 rounded-full">
                              <span className="text-[#c9a844] font-bold">{activity.price}DA</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 text-[#c9a844] fill-current" />
                            <span className="text-sm text-[#1a4a36] dark:text-dark-text font-medium">{activity.rating}</span>
                            {reviewsData[activity.id]?.totalReviews > 0 && (
                              <span className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">
                                ({reviewsData[activity.id].totalReviews} avis)
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-serif font-bold mb-2 text-[#1a4a36] dark:text-dark-text">{activity.name}</h3>
                          <p className="text-[#2d7a5a] dark:text-surface mb-4 text-sm line-clamp-2">{activity.description}</p>

                          <div className="flex flex-wrap gap-4 mb-4 text-sm">
                            {activity.duration && (
                              <div className="flex items-center gap-1 text-[#2d7a5a] dark:text-surface">
                                <Clock className="w-4 h-4" />
                                <span>{activity.duration}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <span className="text-[#c9a844] font-bold capitalize">{activity.category || t('activitiesPage.duration')}</span>
                            </div>
                            <Link to={`/activities/${activity.id}`}>
                              <button className="bg-[#c9a844] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all flex items-center gap-1 group/btn">
                                Découvrir
                                <span className="transform group-hover/btn:translate-x-0.5 transition-transform">→</span>
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
            </div>
          )}
        </div>
      </section>

      {/* --- REVIEWS SECTION --- */}
      {recentReviews.length > 0 && (
        <section className="py-16 px-6 bg-[#f7f5f0] dark:bg-dark-bg">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-serif italic mb-4 text-[#1a4a36] dark:text-dark-text">{t('activitiesPage.travelersReviews')}</h2>
              <p className="text-[#2d7a5a] dark:text-surface max-w-2xl mx-auto">
                {t('activitiesPage.travelersReviewsDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentReviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-[#e0dcd4] dark:border-dark-border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#f7f5f0] dark:bg-dark-bg flex items-center justify-center text-[#2d7a5a] dark:text-surface font-bold text-lg">
                      {review.user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#1a4a36] dark:text-dark-text">{review.user?.username || t('activitiesPage.user')}</div>
                      <div className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">{review.activityName}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-[#c9a844] fill-current' : 'text-[#e0dcd4] dark:text-dark-border'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[#2d7a5a] dark:text-surface text-sm line-clamp-3">{review.comment}</p>
                  <div className="text-[#6b8f7b] dark:text-dark-text-muted text-xs mt-3">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-6 bg-white dark:bg-dark-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif italic mb-4 text-[#1a4a36] dark:text-dark-text">{t('activitiesPage.ctaTitle')}</h2>
          <p className="text-[#2d7a5a] dark:text-surface mb-8 max-w-2xl mx-auto">
            {t('activitiesPage.ctaDescription')}
          </p>
          <button className="bg-[#c9a844] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-[#b08a30] transition-all flex items-center gap-2 mx-auto group">
            {t('activitiesPage.requestCustomization')}
            <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
};

export default Activities;
