import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = ({ openAuthModal, isChatbotOpen, toggleChatbot }) => {
  // Featured destinations data
  const featuredDestinations = [
    {
      id: 1,
      name: "Santorin, Grèce",
      description: "Des couchers de soleil inoubliables et des vues spectaculaires sur la caldeira",
      image: "https://images.unsplash.com/photo-1567874790230-3acbb51e61dd?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      duration: "7 jours"
    },
    {
      id: 2,
      name: "Maldives",
      description: "Des lagons cristallins et des resorts de luxe sur pilotis paradisiaques",
      image: "https://images.unsplash.com/photo-1527959987222-9946fb0e7139?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      duration: "5 jours"
    },
    {
      id: 3,
      name: "Toscane, Italie",
      description: "Des paysages bucoliques, des vignobles et une gastronomie exceptionnelle",
      image: "https://images.unsplash.com/photo-1507923590520-8f0e3a37ca4e?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      duration: "10 jours"
    }
  ];

  // Activities data
  const activities = [
    {
      id: 1,
      title: "Excursion en yacht privé",
      description: "Naviguez dans les eaux turquoises en toute élégance",
      image: "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?auto=format&fit=crop&w=800&q=80",
      price: "5,000DA"
    },
    {
      id: 2,
      title: "Dîner gastronomique étoilé",
      description: "Un chef étoilé vous prépare un menu exclusif",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      price: "800DA"
    },
    {
      id: 3,
      title: "Spa de luxe en montagne",
      description: "Détendez-vous dans un spa de montagne avec vue panoramique",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
      price: "300DA"
    }
  ];

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const heroTextVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const heroItemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury travel destination"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0A0A0A]" />
        </div>

        <motion.div 
          className="relative z-10 px-4 max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={heroTextVariant}
        >
          <motion.p 
            className="text-[#D4AF37] text-[12px] font-bold uppercase tracking-[0.3em] mb-4"
            variants={heroItemVariant}
          >
            EXPÉRIENCE DE LUXE
          </motion.p>
          <motion.h1 
            className="text-5xl md:text-7xl font-serif italic mb-6 leading-tight"
            variants={heroItemVariant}
          >
            Voyagez dans l'élégance
          </motion.h1>
          <motion.p 
            className="max-w-2xl mx-auto text-zinc-300 text-lg leading-relaxed tracking-wide mb-10"
            variants={heroItemVariant}
          >
            Découvrez des destinations exclusives et des expériences uniques conçues pour les voyageurs exigeants
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={heroItemVariant}
          >
            <Link to="/destinations">
              <button className="bg-[#D4AF37] text-black px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-yellow-500 transition">
                Explorer nos destinations
              </button>
            </Link>
            <button className="border-2 border-[#D4AF37] text-[#D4AF37] px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-[#D4AF37]/10 transition">
              Demander une personnalisation
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronRight className="text-[#D4AF37] rotate-90 w-6 h-6" />
        </motion.div>
      </section>

      {/* --- FEATURED DESTINATIONS --- */}
      <section className="py-24 px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-serif italic mb-4">Destinations en Vedette</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Découvrez nos destinations les plus prisées par les voyageurs de luxe du monde entier
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
          >
            {featuredDestinations.map((destination) => (
              <motion.div 
                key={destination.id} 
                className="group relative overflow-hidden rounded-xl"
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-[#D4AF37] fill-current" />
                    <span className="text-sm">{destination.rating}</span>
                    <MapPin className="w-4 h-4 ml-4" />
                    <span className="text-sm">{destination.duration}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-2">{destination.name}</h3>
                  <p className="text-zinc-300 text-sm mb-4">{destination.description}</p>
                  <Link to={`/destinations/${destination.id}`}>
                    <button className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest flex items-center group-hover:gap-2 transition-all">
                      Explorer <ChevronRight className="w-4 h-4 mt-0.5" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- LUXURY ACTIVITIES --- */}
      <section className="py-24 bg-zinc-900/30 px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-serif italic mb-4">Expériences de Luxe</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Des activités exclusives et personnalisées pour enrichir votre voyage
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
          >
            {activities.map((activity) => (
              <motion.div 
                key={activity.id} 
                className="bg-[#0A0A0A] rounded-xl overflow-hidden border border-zinc-800 group"
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold mb-2">{activity.title}</h3>
                  <p className="text-zinc-400 mb-4">{activity.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#D4AF37] font-bold">{activity.price}</span>
                    <Link to={`/activities/${activity.id}`}>
                      <button className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest flex items-center group-hover:gap-2 transition-all">
                        Réserver <ChevronRight className="w-4 h-4 mt-0.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-12">
        <motion.div 
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-12 border border-zinc-800"
          initial="hidden"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl md:text-4xl font-serif italic mb-4">Prêt pour votre prochain voyage de luxe ?</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            Notre équipe d'experts est là pour créer un itinéraire sur mesure selon vos préférences et votre budget
          </p>
          <button className="bg-[#D4AF37] text-black px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-yellow-500 transition">
            Commencer mon expérience
          </button>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-black border-t border-zinc-800 py-16 px-12">
        <motion.div 
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12"
          initial="hidden"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div variants={{ hidden: { opacity: 0 }, animate: { opacity: 1 } }}>
            <div className="text-2xl font-serif font-bold text-[#D4AF37] tracking-tight mb-4">TravelLux</div>
            <p className="text-zinc-400 text-sm">
              Votre partenaire de confiance pour des voyages de luxe exceptionnels depuis 2008.
            </p>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0 }, animate: { opacity: 1 } }}>
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest text-sm mb-4">Destinations</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Europe</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Asie</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Amérique</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Afrique</a></li>
            </ul>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0 }, animate: { opacity: 1 } }}>
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest text-sm mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Hôtels de luxe</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Excursions privées</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Transferts VIP</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white text-sm transition-colors">Conciergerie</a></li>
            </ul>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0 }, animate: { opacity: 1 } }}>
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest text-sm mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-zinc-400 text-sm">contact@travellux.com</li>
              <li className="text-zinc-400 text-sm">+33 1 23 45 67 89</li>
              <li className="text-zinc-400 text-sm">Paris, France</li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div 
          className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          © 2026 TravelLux. Tous droits réservés.
        </motion.div>
      </footer>
    </div>
  );
};

export default Home;