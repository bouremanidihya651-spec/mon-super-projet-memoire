import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, MapPin, Clock, Phone, MessageCircle,
  ArrowRight, Mail, Send, Car, Hotel,
  Compass, Ticket
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import Footer from '../components/Footer';

/* ── Google Fonts ── */
if (!document.getElementById('afalou-fonts')) {
  const link = document.createElement('link');
  link.id   = 'afalou-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap';
  document.head.appendChild(link);
}

/* ── Palette ── */
const C = {
  bg:    '#f7f5f0',
  card:  '#ffffff',
  border:'#e0dcd4',
  text:  '#1a4a36',
  text2: '#2d7a5a',
  text3: '#6b8f7b',
  accent:'#2d7a5a',
  dark:  '#1a4a36',
  gold:  '#c9a844',
  serif: "'Playfair Display', Georgia, serif",
  sans:  "'DM Sans', sans-serif",
};

/* ── Photos Algérie ── */
const ALG = {
  sahara:   'https://images.unsplash.com/photo-1655897025325-83ef20621438?q=80&w=1489&auto=format&fit=crop',
  tassili:  'https://img.over-blog-kiwi.com/0/93/30/77/20171115/ob_8aeabe_berarde-05.jpg',
  bejaia:   'https://africainside.net/medias/Grande-Logo2024-11-10-15-53-43.webp',
  casbah:   'https://upload.wikimedia.org/wikipedia/commons/6/66/The_Test_Garden_Hamma.jpg',
  timgad:   'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=80',
  dunes:    'https://ulysse.com/news/wp-content/uploads/2024/01/La-Casbah-dAlger-.jpg',
  montagne: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
  mer:      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=900&q=80',
};

const fadeUp  = { hidden:{ opacity:0, y:36 }, show:{ opacity:1, y:0, transition:{ duration:0.65, ease:[0.22,1,0.36,1] } } };
const stagger = { show:{ transition:{ staggerChildren:0.12 } } };

/* ══ SECTION LABEL ══ */
const SectionLabel = ({ eyebrow, title, sub, align='center', colors }) => (
  <div style={{ textAlign:align, marginBottom:52 }}>
    <span style={{
      display:'inline-flex', alignItems:'center', gap:10,
      fontFamily:colors.sans, fontSize:10, fontWeight:500,
      letterSpacing:'0.22em', textTransform:'uppercase', color:colors.text3, marginBottom:14,
    }}>
      <span style={{ display:'inline-block', width:28, height:1, background:colors.text3 }}/>
      {eyebrow}
      <span style={{ display:'inline-block', width:28, height:1, background:colors.text3 }}/>
    </span>
    <h2 style={{
      fontFamily:colors.serif, fontSize:'clamp(30px,4.5vw,52px)',
      fontWeight:600, fontStyle:'italic', color:colors.text, lineHeight:1.12,
      marginBottom: sub ? 16 : 0,
    }}>{title}</h2>
    {sub && (
      <p style={{
        fontFamily:colors.sans, fontSize:15, color:colors.text3,
        maxWidth:520, margin: align==='center'?'0 auto':'0',
        lineHeight:1.8, fontWeight:300,
      }}>{sub}</p>
    )}
  </div>
);

/* ══ OUTLINE BTN ══ */
const OutlineBtn = ({ children, to, onClick, dark=false, colors }) => {
  const [hov, setHov] = useState(false);
  const s = {
    display:'inline-flex', alignItems:'center', gap:8, padding:'12px 26px',
    background: hov ? (dark?'rgba(255,255,255,0.12)':colors.accent) : 'transparent',
    border:`1px solid ${dark?'rgba(181,228,202,0.5)':colors.border}`,
    color: hov ? '#fff' : (dark?'rgba(255,255,255,0.8)':colors.text),
    fontFamily:colors.sans, fontSize:11, fontWeight:500,
    letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer',
    borderRadius:0, transition:'all 0.22s',
  };
  const inner = <button style={s} onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>{children}</button>;
  return to ? <Link to={to} style={{ textDecoration:'none' }}>{inner}</Link> : inner;
};

/* ══ HERO ══ */
const HeroSection = ({ openAuthModal, t }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target:ref, offset:['start start','end start'] });
  const y = useTransform(scrollYProgress, [0,1], ['0%','28%']);
  return (
    <section ref={ref} style={{ position:'relative', height:'100vh', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <motion.div style={{ position:'absolute', inset:'-10%', y }}>
        <img src={ALG.sahara} alt="Sahara algérien" style={{ width:'100%', height:'110%', objectFit:'cover' }}/>
      </motion.div>
      <div style={{ position:'absolute', inset:0, background:'rgba(18,45,30,0.48)' }}/>
      <motion.div
        style={{ position:'relative', zIndex:10, textAlign:'center', padding:'0 24px', maxWidth:860 }}
        initial="hidden" animate="show" variants={stagger}
      >
        <motion.p variants={fadeUp} style={{
          fontFamily:C.sans, fontSize:10, fontWeight:500,
          letterSpacing:'0.32em', textTransform:'uppercase',
          color:'rgba(181,228,202,0.85)', marginBottom:20,
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        }}>
          <span style={{ display:'inline-block', width:32, height:1, background:'rgba(181,228,202,0.5)' }}/>
          Afalou Tours —  Algérie
          <span style={{ display:'inline-block', width:32, height:1, background:'rgba(181,228,202,0.5)' }}/>
        </motion.p>
        <motion.h1 variants={fadeUp} style={{
          fontFamily:C.serif, fontStyle:'italic', fontWeight:700,
          fontSize:'clamp(46px,8vw,86px)', color:'#fff', lineHeight:1.06, marginBottom:22,
        }}>
          {t('hero.title')}
        </motion.h1>
        <motion.p variants={fadeUp} style={{
          fontFamily:C.sans, fontSize:16, color:'rgba(216,243,220,0.82)',
          lineHeight:1.9, maxWidth:560, margin:'0 auto 40px', fontWeight:300,
        }}>
          {t('hero.description')}
        </motion.p>
        <motion.div variants={fadeUp} style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/destinations" style={{ textDecoration:'none' }}>
            <motion.button style={{
              background:C.accent, color:'#fff', padding:'15px 34px', border:'none',
              fontFamily:C.sans, fontSize:12, fontWeight:500,
              letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer',
            }} whileHover={{ background:C.dark }} transition={{ duration:0.2 }}>
              {t('hero.exploreButton')}
            </motion.button>
          </Link>
       
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ══ STATS STRIP ══ */
const StatsStrip = () => (
  <div style={{ background:C.dark, padding:'28px 48px' }}>
    <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:24, textAlign:'center' }}>
      {[
        { n:'10 000+', l:'Voyageurs satisfaits' },
        { n:'48',      l:"Wilayas d'Algérie" },
        { n:'15 ans',  l:"D'expérience" },
        { n:'24/7',    l:'Support dédié' },
      ].map((s,i) => (
        <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}>
          <div style={{ fontFamily:C.serif, fontSize:28, fontWeight:600, fontStyle:'italic', color:C.gold, marginBottom:4 }}>{s.n}</div>
          <div style={{ fontFamily:C.sans, fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(181,228,202,0.6)', fontWeight:300 }}>{s.l}</div>
        </motion.div>
      ))}
    </div>
  </div>
);

/* ── SERVICE ITEM ── */
const ServiceItem = ({ icon, title, desc, colors, isDark }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      onHoverStart={()=>setHov(true)}
      onHoverEnd={()=>setHov(false)}
      style={{
        background: hov ? colors.accent : (isDark ? colors.card : '#fff'),
        padding:'38px 32px',
        transition:'background 0.3s',
        cursor:'default',
      }}
    >
      <div style={{ color:C.gold, marginBottom:18 }}>{icon}</div>
      <h3 style={{
        fontFamily:colors.serif, fontSize:18, fontWeight:600, fontStyle:'italic',
        color: hov ? '#fff' : colors.text, marginBottom:10, lineHeight:1.2,
        transition:'color 0.3s',
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily:colors.sans, fontSize:13,
        color: hov ? 'rgba(216,243,220,0.82)' : colors.text3,
        lineHeight:1.75, fontWeight:300, transition:'color 0.3s',
      }}>
        {desc}
      </p>
    </motion.div>
  );
};

/* ── ABOUT — AFALOU TOURS ══ */
const AboutSection = ({ colors, isDark, t, isMobile }) => {
  const services = [
    {
      icon: <Compass size={22}/>,
      title: t('aboutSection.services.discovery.title'),
      desc: t('aboutSection.services.discovery.desc'),
    },
    {
      icon: <Hotel size={22}/>,
      title: t('aboutSection.services.hotels.title'),
      desc: t('aboutSection.services.hotels.desc'),
    },
    {
      icon: <Car size={22}/>,
      title: t('aboutSection.services.transport.title'),
      desc: t('aboutSection.services.transport.desc'),
    },
    {
      icon: <Ticket size={22}/>,
      title: "Réservation d'activités",
      desc: "Randonnées, excursions en mer, activités culturelles et sportives — réservez facilement vos expériences à travers toute l'Algérie.",
    },
  ];

  const mosaicPhotos = [
    { src:ALG.tassili,  alt:"Tassili n'Ajjer", label:'Djurdura' },
    { src:ALG.bejaia,   alt:'Côte de Béjaïa',  label:'Sahara' },
    { src:ALG.dunes,    alt:'Dunes du Sahara',  label:'Casbah' },
    { src:ALG.casbah,   alt:"Casbah d'Alger",  label:'Alger'  },
  ];

  return (
    <section style={{ padding: isMobile ? '60px 0' : '110px 0 100px', background: isDark ? colors.bg : '#f2efea', overflow:'hidden' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding: isMobile ? '0 24px' : '0 48px' }}>

        <motion.div initial="hidden" whileInView="show" viewport={{ once:true, amount:0.3 }} variants={fadeUp} style={{ textAlign:'center', marginBottom: isMobile ? 48 : 72 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:colors.sans, fontSize:10, fontWeight:500, letterSpacing:'0.22em', textTransform:'uppercase', color:colors.text3, marginBottom:16 }}>
            <span style={{ width:28, height:1, background:colors.text3 }}/>
            {t('aboutSection.eyebrow')}
            <span style={{ width:28, height:1, background:colors.text3 }}/>
          </span>
          <h2 style={{ fontFamily:colors.serif, fontStyle:'italic', fontWeight:700, fontSize:'clamp(34px,4.5vw,54px)', color:colors.text, lineHeight:1.1, marginBottom:18 }}>
            {t('aboutSection.title')}<br/>
            <span style={{ color:C.gold }}>{t('aboutSection.titleHighlight')}</span>
          </h2>
          <p style={{ fontFamily:colors.sans, fontSize:15, color:colors.text3, maxWidth:640, margin:'0 auto', lineHeight:1.9, fontWeight:300 }}>
            {t('aboutSection.description', { name: 'Afalou Tours' })}
          </p>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 48 : 72, alignItems:'center', marginBottom: isMobile ? 60 : 80 }}>
          <motion.div initial={{ opacity:0, x: isMobile ? 0 : -40, y: isMobile ? 20 : 0 }} whileInView={{ opacity:1, x:0, y:0 }} viewport={{ once:true, amount:0.3 }} transition={{ duration:0.75, ease:[0.22,1,0.36,1] }}>

            {/* ✅ CORRECTION : dangerouslySetInnerHTML pour rendre le HTML des traductions */}
            <p
              style={{ fontFamily:colors.sans, fontSize:15, color:colors.text3, lineHeight:1.95, marginBottom:18, fontWeight:300 }}
              dangerouslySetInnerHTML={{ __html: t('aboutSection.paragraph1') }}
            />
            <p
              style={{ fontFamily:colors.sans, fontSize:15, color:colors.text3, lineHeight:1.95, marginBottom:28, fontWeight:300 }}
              dangerouslySetInnerHTML={{ __html: t('aboutSection.paragraph2') }}
            />

            <div style={{ display:'flex', gap: isMobile ? 24 : 36, marginBottom:32, flexWrap:'wrap' }}>
              {[
                { n:'48',   l:t('aboutSection.stats.wilayas') },
                { n:'15k+', l:t('aboutSection.stats.clients')  },
                { n:'98%',  l:t('aboutSection.stats.satisfaction') },
              ].map((s,i) => (
                <div key={i}>
                  <div style={{ fontFamily:colors.serif, fontSize: isMobile ? 28 : 32, fontWeight:700, fontStyle:'italic', color:colors.text, lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontFamily:colors.sans, fontSize:11, color:colors.text3, fontWeight:300, marginTop:4, letterSpacing:'0.05em' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <Link to="/about" style={{ textDecoration:'none' }}>
              <motion.button style={{ background:colors.accent, color:'#fff', padding:'14px 32px', border:'none', fontFamily:colors.sans, fontSize:11, fontWeight:500, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:10 }} whileHover={{ background:colors.dark }} transition={{ duration:0.2 }}>
                {t('aboutSection.learnMore')} <ArrowRight size={14}/>
              </motion.button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity:0, x: isMobile ? 0 : 40, y: isMobile ? 20 : 0 }} whileInView={{ opacity:1, x:0, y:0 }} viewport={{ once:true, amount:0.3 }} transition={{ duration:0.75, ease:[0.22,1,0.36,1], delay:0.15 }} style={{ position:'relative', order: isMobile ? -1 : 1 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {mosaicPhotos.map((p,i) => (
                <motion.div key={i} style={{ overflow:'hidden', borderRadius:2, height: isMobile ? (i < 2 ? 180 : 140) : (i < 2 ? 240 : 180), position:'relative' }} whileHover={{ scale:1.02 }} transition={{ duration:0.4 }}>
                  <img src={p.src} alt={p.alt} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial="hidden" whileInView="show" viewport={{ once:true, amount:0.2 }} variants={stagger} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:1, background:colors.border }}>
          {services.map((v,i) => (
            <ServiceItem key={i} {...v} colors={colors} isDark={isDark} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ══ DEST CARD ══ */
const DestCard = ({ dest, colors, openAuthModal, index=0 }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:0.2 }}
      transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      style={{ overflow:'hidden', cursor:'pointer', borderRadius:2, boxShadow: hov?'0 20px 50px rgba(26,74,54,0.18)':'0 4px 16px rgba(26,74,54,0.06)', transform: hov?'translateY(-6px)':'translateY(0)', transition:'all 0.35s', background:colors.card }}
    >
      <div style={{ position:'relative', height:220, overflow:'hidden' }}>
        <motion.img src={dest.image_url||ALG.mer} alt={dest.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} animate={{ scale: hov?1.06:1 }} transition={{ duration:0.7 }} />
        <div style={{ position:'absolute', bottom:12, left:14, display:'flex', alignItems:'center', gap:4, fontSize:10, color:'rgba(255,255,255,0.9)', fontFamily:colors.sans, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase' }}>
          <MapPin size={9}/> {dest.country||dest.location}
        </div>
      </div>
      <div style={{ padding:'18px 20px 22px', borderTop:`1px solid ${colors.border}` }}>
        <h4 style={{ fontFamily:colors.serif, fontSize:20, fontWeight:600, fontStyle:'italic', color:colors.text, marginBottom:8 }}>{dest.name}</h4>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <motion.span style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:colors.sans, fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:colors.accent }}>
            Découvrir <ChevronRight size={12}/>
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
};

/* ══════════════════════ HOME ══════════════════════ */
const Home = ({ openAuthModal }) => {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const isAr = i18n.language === 'ar';
  const [destinations, setDestinations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth <= 968);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 968);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  const colors = {
    bg:     isDark ? '#1a2f26' : '#f7f5f0',
    card:   isDark ? '#24342c' : '#ffffff',
    border: isDark ? '#2d4038' : '#e0dcd4',
    text:   isDark ? '#b5e4ca' : '#1a4a36',
    text2:  isDark ? '#8fa89e' : '#2d7a5a',
    text3:  isDark ? '#6b8f7b' : '#6b8f7b',
    accent: '#2d7a5a',
    dark:   isDark ? '#0f1f17' : '#1a4a36',
    white:  '#ffffff',
    serif:  "'Playfair Display', Georgia, serif",
    sans:   "'DM Sans', sans-serif",
  };

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('http://localhost:3000/api/destinations?limit=100');
        const d = await r.json();
        setDestinations((d.destinations||d||[]).slice(0, 3));
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const divider = <div style={{ height:1, background:colors.border, margin: isMobile ? '0 24px' : '0 48px' }}/>;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight:'100vh', background:colors.bg, color:colors.text, fontFamily:colors.sans, textAlign: isAr ? 'right' : 'left' }}>

      <HeroSection openAuthModal={openAuthModal} t={t}/>
      <StatsStrip/>
      <AboutSection colors={colors} isDark={isDark} t={t} isMobile={isMobile}/>

      {divider}

      {/* DESTINATIONS */}
      <section style={{ padding: isMobile ? '60px 24px' : '100px 48px', background:colors.bg }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true, amount:0.3 }} variants={fadeUp}>
            <SectionLabel eyebrow="Nos destinations" title={t('featured.destinationsTitle')} sub={t('featured.destinationsDescription')} colors={colors} />
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24 }}>
            {destinations.map((d, i) => (
              <DestCard key={d.id} dest={d} colors={colors} index={i}/>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:48 }}>
            <OutlineBtn to="/destinations" colors={colors}>Voir toutes les destinations <ChevronRight size={13}/></OutlineBtn>
          </div>
        </div>
      </section>

      {divider}

      {/* SECTION CONTACT */}
      <section id="contact" style={{ padding: isMobile ? '60px 24px' : '100px 48px', background:colors.bg }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once:true, amount:0.3 }} variants={fadeUp}>
            <SectionLabel eyebrow={t('contactPage.infoTitle')} title={t('contactPage.title')} sub={t('contactPage.subtitle')} colors={colors} />
          </motion.div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 60, alignItems:'start' }}>
            <motion.div initial={{ opacity:0, x: isMobile ? 0 : -30, y: isMobile ? 20 : 0 }} whileInView={{ opacity:1, x:0, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
                <div style={{ display:'flex', gap:20 }}>
                  <div style={{ width:56, height:56, background:colors.card, border:`1px solid ${colors.border}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:colors.accent, flexShrink:0 }}><Mail size={24} /></div>
                  <div>
                    <h4 style={{ fontFamily:colors.serif, fontSize:20, fontWeight:600, fontStyle:'italic', color:colors.text, marginBottom:4 }}>{t('contactPage.email')}</h4>
                    <p style={{ fontFamily:colors.sans, fontSize:15, color:colors.text3 }}>contact@afalou.com</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:20 }}>
                  <div style={{ width:56, height:56, background:colors.card, border:`1px solid ${colors.border}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:colors.accent, flexShrink:0 }}><Phone size={24} /></div>
                  <div>
                    <h4 style={{ fontFamily:colors.serif, fontSize:20, fontWeight:600, fontStyle:'italic', color:colors.text, marginBottom:4 }}>{t('contactPage.phone')}</h4>
                    <p style={{ fontFamily:colors.sans, fontSize:15, color:colors.text3 }}>+213 (0) 34 12 34 56</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:20 }}>
                  <div style={{ width:56, height:56, background:colors.card, border:`1px solid ${colors.border}`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:colors.accent, flexShrink:0 }}><MapPin size={24} /></div>
                  <div>
                    <h4 style={{ fontFamily:colors.serif, fontSize:20, fontWeight:600, fontStyle:'italic', color:colors.text, marginBottom:4 }}>{t('contactPage.address')}</h4>
                    <p style={{ fontFamily:colors.sans, fontSize:15, color:colors.text3 }}>Rue Boumdaoui Nacer, EDIMCO, Béjaïa</p>
                  </div>
                </div>
              </div>
              <div style={{ marginTop:48, height:240, background:colors.card, border:`1px solid ${colors.border}`, borderRadius:2, overflow:'hidden' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3202.46332158!2d5.05!3d36.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDQ1JzAwLjAiTiA1wrAwMycwMC4wIkU!5e0!3m2!1sfr!2sdz!4v1620000000000!5m2!1sfr!2sdz"
                  width="100%" height="100%"
                  style={{ border: 0, filter: isDark ? 'invert(90%)' : 'grayscale(1)' }}
                  allowFullScreen="" loading="lazy"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, x: isMobile ? 0 : 30, y: isMobile ? 20 : 0 }} whileInView={{ opacity:1, x:0, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }} style={{ background:colors.card, border:`1px solid ${colors.border}`, padding: isMobile ? '24px' : '40px', borderRadius:2 }}>
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:24 }}>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20 }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <label style={{ fontFamily:colors.sans, fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:colors.text3 }}>{t('contactPage.nameLabel')}</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ background:colors.bg, border:`1px solid ${colors.border}`, padding:'12px 16px', color:colors.text, fontFamily:colors.sans, fontSize:14, outline:'none' }} />
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <label style={{ fontFamily:colors.sans, fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:colors.text3 }}>{t('contactPage.emailLabel')}</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ background:colors.bg, border:`1px solid ${colors.border}`, padding:'12px 16px', color:colors.text, fontFamily:colors.sans, fontSize:14, outline:'none' }} />
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <label style={{ fontFamily:colors.sans, fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:colors.text3 }}>{t('contactPage.subjectLabel')}</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required style={{ background:colors.bg, border:`1px solid ${colors.border}`, padding:'12px 16px', color:colors.text, fontFamily:colors.sans, fontSize:14, outline:'none' }} placeholder={t('contactPage.subjectPlaceholder')} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <label style={{ fontFamily:colors.sans, fontSize:10, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:colors.text3 }}>{t('contactPage.messageLabel')}</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" style={{ background:colors.bg, border:`1px solid ${colors.border}`, padding:'12px 16px', color:colors.text, fontFamily:colors.sans, fontSize:14, outline:'none', resize:'none' }} placeholder={t('contactPage.messagePlaceholder')}></textarea>
                </div>
                <button type="submit" disabled={status==='loading'} style={{ background:colors.accent, color:'#fff', padding:'16px', border:'none', fontFamily:colors.sans, fontSize:12, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  {status === 'loading' ? t('contactPage.sending') : status === 'success' ? t('contactPage.sent') : <><Send size={16}/> {t('contactPage.sendButton')}</>}
                </button>
                {status === 'success' && <p style={{ textAlign:'center', color:colors.accent, fontSize:13 }}>{t('contactPage.successMessage')}</p>}
                {status === 'error' && <p style={{ textAlign:'center', color:'#e74c3c', fontSize:13 }}>{errorMessage || t('contactPage.errorMessage') || 'Une erreur est survenue. Veuillez réessayer.'}</p>}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {divider}

      {/* FEATURES */}
      <div style={{ background: isDark?colors.card:'#fff', borderBottom:`1px solid ${colors.border}`, padding: isMobile ? '40px 24px' : '60px 48px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:36, textAlign:'center' }}>
          {[
            { title:t('features.customTitle'),          desc:t('features.customDesc') },
            { title:t('features.expertGuidesTitle'),    desc:t('features.expertGuidesDesc') },
            { title:t('features.exclusiveAccessTitle'), desc:t('features.exclusiveAccessDesc') },
          ].map((f,i) => (
            <div key={i}>
              <div style={{ width:32, height:1.5, background:colors.text3, margin:'0 auto 20px' }}/>
              <h3 style={{ fontFamily:colors.serif, fontStyle:'italic', fontSize:20, fontWeight:600, color:colors.text, marginBottom:10 }}>{f.title}</h3>
              <p style={{ fontFamily:colors.sans, fontSize:13, color:colors.text3, lineHeight:1.8, fontWeight:300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section style={{ position:'relative', padding: isMobile ? '80px 24px' : '120px 48px', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url('${ALG.timgad}')`, backgroundSize:'cover', backgroundPosition:'center', backgroundAttachment:'fixed' }}/>
        <div style={{ position:'absolute', inset:0, background:'rgba(20,48,34,0.74)' }}/>
        <div style={{ position:'relative', zIndex:10, maxWidth:700, margin:'0 auto', textAlign:'center' }}>
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, amount:0.4 }} transition={{ duration:0.7 }}>
            <p style={{ fontFamily:colors.sans, fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(181,228,202,0.7)', marginBottom:22 }}>{t('homeCta.subtitle')}</p>
            <h2 style={{ fontFamily:colors.serif, fontStyle:'italic', fontSize:'clamp(36px,5vw,60px)', fontWeight:600, color:'#fff', lineHeight:1.12, marginBottom:22 }}>{t('homeCta.title')}</h2>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <motion.button onClick={()=>openAuthModal('signup')} style={{ background:C.gold, color: isDark?'#0f1f17':'#1a4a36', padding:'15px 34px', border:'none', fontFamily:colors.sans, fontSize:12, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer' }} whileHover={{ background:'#b08a30' }}>{t('homeCta.createAccount')}</motion.button>
              <OutlineBtn dark colors={colors}><Phone size={13}/> {t('homeCta.callUs')}</OutlineBtn>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;