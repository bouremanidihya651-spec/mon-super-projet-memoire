import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart3, Users, MapPin, Star, Package, Trash2,
  Calendar, LogOut, X, Loader2, Upload, CheckCircle2, Eye,
  Crown, Mountain, Tent, Landmark, Waves, Utensils, Plane, FileText, Shield,
  Moon, Sun, Search, Sparkles, MapPinned, Brain, Menu
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import TransportManagement from "./admin/TransportManagement";
import ReservationsManagement from "./admin/ReservationsManagement";
import usePreventNavigation from "../hooks/usePreventNavigation";

// ─── COMPOSANTS EXTERNES ───
const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative mb-4">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f7b]" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-full pl-10 pr-4 py-2.5 text-sm text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] focus:border-[#2d7a5a] outline-none transition shadow-sm"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b8f7b] hover:text-[#1a4a36] dark:hover:text-dark-text transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

const ResultsBadge = ({ filtered, total, label }) => (
  <div className="flex items-center justify-between mb-3 px-1">
    <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">
      {filtered.length === total
        ? <><span className="font-bold text-[#2d7a5a]">{total}</span> {label} au total</>
        : <><span className="font-bold text-[#2d7a5a]">{filtered.length}</span> résultat{filtered.length > 1 ? "s" : ""} sur <span className="font-bold">{total}</span></>
      }
    </p>
  </div>
);

const fetchScoresFromGemini = async (destinationName) => {
  const prompt = `Tu es un expert en tourisme algerien. Pour la destination "${destinationName}" en Algerie, reponds UNIQUEMENT avec un objet JSON valide, sans texte avant, sans texte apres, sans backticks. Format exact :
{"name":"nom officiel","city":"ville principale","region":"wilaya","country":"Algerie","description":"description touristique 2 phrases en francais","luxury":7,"nature":8,"adventure":7,"culture":8,"beach":3,"food":7}
Regles : scores entre 0 et 10, estime selon la region meme si pas sur, commence par { et termine par }.`;

  const response = await fetch("${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }] })
  });
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON parse error:", e, "Raw:", text);
    return null;
  }
};

// Classes réutilisables dark-aware
const inputClass = "w-full bg-white dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-full px-4 py-2.5 focus:border-[#2d7a5a] outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-[#4a7060] shadow-sm";
const textareaClass = "w-full bg-white dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-xl px-4 py-2.5 focus:border-[#2d7a5a] outline-none transition min-h-[100px] text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-[#4a7060] shadow-sm";
const selectClass = "w-full bg-white dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-full px-4 py-2.5 focus:border-[#2d7a5a] outline-none transition text-[#1a4a36] dark:text-dark-text shadow-sm";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Prevent navigation and logout if back button is pressed
  usePreventNavigation(logout);

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [searchDestinations, setSearchDestinations] = useState("");
  const [searchHotels, setSearchHotels] = useState("");
  const [searchActivities, setSearchActivities] = useState("");
  const [searchUsers, setSearchUsers] = useState("");

  const visitChartRef = useRef(null);
  const popChartRef = useRef(null);
  const visitChartInstance = useRef(null);
  const popChartInstance = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "", description: "", location: "", country: "Algérie",
    city: "", price: "", rating: "5", stars: "5", destination_id: "",
    luxury_score: "5", nature_score: "5", adventure_score: "5",
    culture_score: "5", beach_score: "5", food_score: "5"
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState(false);
  const searchTimeoutRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [visitsData, setVisitsData] = useState([]);
  const [visitsLabels, setVisitsLabels] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDestinations(); fetchHotels(); fetchActivities(); fetchUsers(); fetchAdminStats();
  }, []);

  useEffect(() => {
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, []);

  const filteredDestinations = destinations.filter(d =>
    d.name?.toLowerCase().includes(searchDestinations.toLowerCase()) ||
    d.location?.toLowerCase().includes(searchDestinations.toLowerCase()) ||
    d.city?.toLowerCase().includes(searchDestinations.toLowerCase())
  );
  const filteredHotels = hotels.filter(h =>
    h.name?.toLowerCase().includes(searchHotels.toLowerCase()) ||
    h.location?.toLowerCase().includes(searchHotels.toLowerCase()) ||
    h.city?.toLowerCase().includes(searchHotels.toLowerCase())
  );
  const filteredActivities = activities.filter(a =>
    a.name?.toLowerCase().includes(searchActivities.toLowerCase()) ||
    a.location?.toLowerCase().includes(searchActivities.toLowerCase()) ||
    a.city?.toLowerCase().includes(searchActivities.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reservations/stats", { headers: { "Authorization": `Bearer ${token}` } });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.success) {
        setVisitsData(Array.isArray(data.visits) ? data.visits : []);
        setPopularDestinations(Array.isArray(data.popularDestinations) ? data.popularDestinations : []);
        setVisitsLabels(Array.isArray(data.visitsLabels) ? data.visitsLabels : []);
        setRecentActivity(Array.isArray(data.recentActivity) ? data.recentActivity : []);
      }
    } catch (err) { console.error("Fetch admin stats error:", err); }
  };

  useEffect(() => {
    if (activeTab !== "overview") return;
    const initCharts = () => {
      if (typeof window.Chart === "undefined") return;
      try {
        if (visitChartInstance.current) visitChartInstance.current.destroy();
        if (popChartInstance.current) popChartInstance.current.destroy();
        if (visitChartRef.current) {
          const hasRealData = visitsData.length > 0 && visitsData.some(v => v > 0);
          const labels = visitsLabels.length > 0 ? visitsLabels : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
          visitChartInstance.current = new window.Chart(visitChartRef.current, {
            type: "bar",
            data: { labels, datasets: [{ label: "Réservations", data: hasRealData ? visitsData : [0,0,0,0,0,0,0], backgroundColor: "#c9a844", borderRadius: 6, borderSkipped: false, barThickness: 20 }] },
            options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ctx.parsed.x + ' réservation(s)' } } }, scales: { x: { grid: { color: isDark ? "#2d4038" : "#e0dcd4" }, ticks: { color: isDark ? "#8fa89e" : "#6b8f7b", font: { size: 11 }, stepSize: 1 }, beginAtZero: true }, y: { grid: { display: false }, ticks: { color: isDark ? "#3d9a7a" : "#2d7a5a", font: { size: 11, weight: 'bold' } } } } },
          });
        }
        if (popChartRef.current) {
          const hasRealData = popularDestinations.length > 0 && popularDestinations.some(d => d.count > 0);
          popChartInstance.current = new window.Chart(popChartRef.current, {
            type: "line",
            data: { labels: hasRealData ? popularDestinations.map(d => d.name) : ["Aucune donnée"], datasets: [{ label: "Popularité", data: hasRealData ? popularDestinations.map(d => d.count) : [0], borderColor: "#2d7a5a", backgroundColor: "rgba(45,122,90,0.1)", borderWidth: 3, pointBackgroundColor: "#c9a844", pointBorderColor: "#fff", pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, tension: 0.4, fill: true }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ctx.parsed.y + ' avis' } } }, scales: { x: { grid: { color: isDark ? "#2d4038" : "#e0dcd4" }, ticks: { color: isDark ? "#8fa89e" : "#6b8f7b", font: { size: 11 } } }, y: { grid: { color: isDark ? "#2d4038" : "#e0dcd4" }, ticks: { color: isDark ? "#8fa89e" : "#6b8f7b", font: { size: 11 }, beginAtZero: true, stepSize: 1 } } } },
          });
        }
      } catch (error) { console.error("Chart error:", error); }
    };
    if (typeof window.Chart === "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      script.onload = initCharts;
      document.head.appendChild(script);
    } else { setTimeout(initCharts, 100); }
    return () => {
      if (visitChartInstance.current) { visitChartInstance.current.destroy(); visitChartInstance.current = null; }
      if (popChartInstance.current) { popChartInstance.current.destroy(); popChartInstance.current = null; }
    };
  }, [activeTab, visitsData, visitsLabels, popularDestinations, isDark]);

  // IA uniquement pour destinations
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData(prev => ({ ...prev, name: value }));
    setAiError(""); setAiSuccess(false);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.trim().length < 3) return;
    searchTimeoutRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const result = await fetchScoresFromGemini(value.trim());
        if (result) {
          setFormData(prev => ({ ...prev, name: result.name || value, country: result.country || "Algérie", city: result.city || value, location: result.region ? `${result.region}, Algérie` : "Algérie", description: result.description || "", luxury_score: String(result.luxury ?? 5), nature_score: String(result.nature ?? 5), adventure_score: String(result.adventure ?? 5), culture_score: String(result.culture ?? 5), beach_score: String(result.beach ?? 5), food_score: String(result.food ?? 5) }));
          setSearchQuery(result.name || value); setAiSuccess(true); setTimeout(() => setAiSuccess(false), 3000);
        } else { setAiError("Destination introuvable en Algérie. Tu peux remplir les scores manuellement."); }
      } catch (err) { setAiError("Erreur Gemini API. Vérifie ta clé API."); } finally { setAiLoading(false); }
    }, 800);
  };

  const fetchDestinations = async () => { try { setLoading(true); const r = await fetch("${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/destinations"); const d = await r.json(); setDestinations(d.destinations || d.rows || []); } catch (e) { console.error(e); } finally { setLoading(false); } };
  const fetchHotels = async () => { try { setLoading(true); const r = await fetch("${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/hotels"); const d = await r.json(); setHotels(Array.isArray(d.hotels) ? d.hotels : (Array.isArray(d) ? d : [])); } catch (e) { console.error(e); } finally { setLoading(false); } };
  const fetchActivities = async () => { try { setLoading(true); const r = await fetch("${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/activities"); const d = await r.json(); setActivities(Array.isArray(d.activities) ? d.activities : (Array.isArray(d) ? d : [])); } catch (e) { console.error(e); } finally { setLoading(false); } };
  const fetchUsers = async () => { try { setLoading(true); const token = localStorage.getItem("token"); const r = await fetch("${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users", { headers: { "Authorization": `Bearer ${token}` } }); const d = await r.json(); setUsers(Array.isArray(d) ? d : (Array.isArray(d.users) ? d.users : [])); } catch (e) { console.error(e); } finally { setLoading(false); } };

  const handleDelete = async (id) => { if (window.confirm("Supprimer cette destination ?")) { try { const t = localStorage.getItem("token"); await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/destinations/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${t}` } }); fetchDestinations(); } catch { alert("Erreur suppression"); } } };
  const handleDeleteHotel = async (id) => { if (window.confirm("Supprimer cet hôtel ?")) { try { const t = localStorage.getItem("token"); await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/hotels/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${t}` } }); fetchHotels(); } catch { alert("Erreur suppression"); } } };
  const handleDeleteActivity = async (id) => { if (window.confirm("Supprimer cette activité ?")) { try { const t = localStorage.getItem("token"); await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/activities/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${t}` } }); fetchActivities(); } catch { alert("Erreur suppression"); } } };
  const handleDeleteUser = async (id) => { if (window.confirm("Supprimer cet utilisateur ?")) { try { const t = localStorage.getItem("token"); await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${t}` } }); fetchUsers(); } catch { alert("Erreur suppression"); } } };
  const handleBlockUser = async (id) => { try { const t = localStorage.getItem("token"); await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/${id}/block`, { method: "PUT", headers: { "Authorization": `Bearer ${t}` } }); fetchUsers(); } catch { alert("Erreur blocage"); } };
  const handleUnblockUser = async (id) => { try { const t = localStorage.getItem("token"); await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/${id}/unblock`, { method: "PUT", headers: { "Authorization": `Bearer ${t}` } }); fetchUsers(); } catch { alert("Erreur déblocage"); } };

  const resetModal = () => {
    setIsModalOpen(false); setSelectedFile(null); setSearchQuery(""); setAiError(""); setAiSuccess(false);
    setFormData({ name: "", description: "", location: "", country: "Algérie", city: "", price: "", rating: "5", stars: "5", destination_id: "", luxury_score: "5", nature_score: "5", adventure_score: "5", culture_score: "5", beach_score: "5", food_score: "5" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "destinations" && destinations.length >= 15) { alert("Limite atteinte : vous ne pouvez pas créer plus de 15 destinations."); return; }
    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("name", formData.name); data.append("description", formData.description); data.append("location", formData.location); data.append("country", formData.country); data.append("city", formData.city);
    data.append("price", activeTab === "destinations" ? "0" : formData.price); data.append("rating", formData.rating);
    if (formData.destination_id) data.append("destination_id", formData.destination_id);
    if (activeTab === "destinations") {
      data.append("luxury_score",    (parseFloat(formData.luxury_score)    / 10).toString());
      data.append("nature_score",    (parseFloat(formData.nature_score)    / 10).toString());
      data.append("adventure_score", (parseFloat(formData.adventure_score) / 10).toString());
      data.append("culture_score",   (parseFloat(formData.culture_score)   / 10).toString());
      data.append("beach_score",     (parseFloat(formData.beach_score)     / 10).toString());
      data.append("food_score",      (parseFloat(formData.food_score)      / 10).toString());
    }
    if (selectedFile) data.append("image", selectedFile);
    let endpoint = "${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/destinations"; let fetchFunction = fetchDestinations; let successMsg = "Destination publiée avec succès !";
    if (activeTab === "hotels") { endpoint = "${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/hotels"; fetchFunction = fetchHotels; data.append("stars", formData.stars); successMsg = "Hôtel publié avec succès !"; }
    else if (activeTab === "activities") { endpoint = "${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/activities"; fetchFunction = fetchActivities; successMsg = "Activité publiée avec succès !"; }
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: data });
      const result = await response.json();
      if (response.status === 201 || response.status === 200) { resetModal(); fetchFunction(); setSuccessMessage(successMsg); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000); }
      else { alert("Erreur lors de l'enregistrement: " + (result.message || "Erreur inconnue")); }
    } catch (err) { alert("Erreur réseau: " + err.message); }
  };

  const navItems = [
    { tab: "overview",     icon: <BarChart3 className="w-5 h-5" />, label: "Dashboard" },
    { tab: "destinations", icon: <MapPin className="w-5 h-5" />,    label: "Destinations" },
    { tab: "hotels",       icon: <Package className="w-5 h-5" />,   label: "Hôtels" },
    { tab: "activities",   icon: <Star className="w-5 h-5" />,      label: "Activités" },
    { tab: "transports",   icon: <Plane className="w-5 h-5" />,     label: "Transports" },
    { tab: "reservations", icon: <FileText className="w-5 h-5" />,  label: "Réservations" },
    { tab: "users",        icon: <Users className="w-5 h-5" />,     label: "Utilisateurs" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-dark-bg text-[#1a4a36] dark:text-dark-text flex relative">

      {/* TOAST */}
      {showSuccess && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-[#2d7a5a] text-white px-6 py-4 rounded-2xl shadow-lg">
          <CheckCircle2 className="w-6 h-6" /><span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* OVERLAY MOBILE */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`w-64 bg-white dark:bg-dark-surface border-r border-[#e0dcd4] dark:border-dark-border flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-5 flex items-center justify-between lg:block">
          <span className="font-bold text-[#1a4a36] dark:text-dark-text">AFALOU Tours Admin</span>
          <button className="lg:hidden text-[#6b8f7b]" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-[#f7f5f0] dark:bg-dark-surface-2 rounded-xl border border-[#e0dcd4] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#f7f5f0] dark:bg-dark-surface-2 border-2 border-[#e0dcd4] dark:border-dark-border flex items-center justify-center flex-shrink-0"><Shield size={20} className="text-[#2d7a5a]" /></div>
            <div className="overflow-hidden">
              <h3 className="font-medium text-sm truncate text-[#1a4a36] dark:text-dark-text">Administrateur</h3>
              <p className="text-[10px] text-[#6b8f7b] dark:text-dark-text-muted truncate">admin@example.com</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab ? "bg-[#2d7a5a] text-white font-semibold" : "text-[#6b8f7b] dark:text-dark-text-muted hover:bg-[#f7f5f0] dark:hover:bg-dark-surface-2 hover:text-[#1a4a36] dark:hover:text-dark-text"}`}>
              {icon}<span className="text-sm">{label}</span>
            </button>
          ))}
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[#6b8f7b] dark:text-dark-text-muted hover:bg-[#f7f5f0] dark:hover:bg-dark-surface-2 hover:text-[#1a4a36] dark:hover:text-dark-text transition-all">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-sm">{isDark ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </nav>
        <div className="p-4 border-t border-[#e0dcd4] dark:border-dark-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#6b8f7b] hover:bg-[#fef2f2] hover:text-[#dc2626] transition-all group">
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" /><span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* TOPBAR MOBILE */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-dark-surface border-b border-[#e0dcd4] dark:border-dark-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-[#6b8f7b] hover:text-[#1a4a36] dark:hover:text-dark-text"><Menu className="w-6 h-6" /></button>
          <span className="font-bold text-sm text-[#1a4a36] dark:text-dark-text">TravelLux Admin</span>
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-[#c9a844] text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-[#b08a30] transition">+ Créer</button>
        </div>

        <div className="p-4 sm:p-6 lg:p-10">
          {/* HEADER DESKTOP */}
          <header className="hidden lg:flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#1a4a36] dark:text-dark-text">Tableau de Bord</h2>
              <p className="text-[#6b8f7b] dark:text-dark-text-muted">Bienvenue dans votre espace d'administration TravelLux.</p>
            </div>
            <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-[#c9a844] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#b08a30] transition">+ Créer</button>
          </header>
          <div className="lg:hidden mb-6">
            <h2 className="text-2xl font-bold text-[#1a4a36] dark:text-dark-text">Tableau de Bord</h2>
            <p className="text-sm text-[#6b8f7b] dark:text-dark-text-muted">Espace d'administration TravelLux.</p>
          </div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: "Destinations", value: destinations.length, badge: "+2 ↗", icon: <MapPin className="w-4 h-4 text-[#2d7a5a]" /> },
                  { label: "Hôtels",       value: hotels.length,       badge: "+3 ↗", icon: <Package className="w-4 h-4 text-[#2d7a5a]" /> },
                  { label: "Activités",    value: activities.length,   badge: "+5 ↗", icon: <Star className="w-4 h-4 text-[#2d7a5a]" /> },
                  { label: "Utilisateurs", value: users.length || 0,   badge: "+12% ↗", icon: <Users className="w-4 h-4 text-[#2d7a5a]" /> },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-4 sm:p-5 relative hover:border-[#2d7a5a]/40 transition shadow-sm">
                    <span className="absolute top-3 right-3 text-xs font-bold text-[#c9a844]">{s.badge}</span>
                    <div className="w-8 h-8 rounded-xl bg-[#f7f5f0] dark:bg-dark-surface-2 flex items-center justify-center mb-3">{s.icon}</div>
                    <p className="text-2xl sm:text-3xl font-bold text-[#1a4a36] dark:text-dark-text">{s.value.toLocaleString()}</p>
                    <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted mt-1 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
                <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-1"><p className="font-semibold text-sm text-[#1a4a36] dark:text-dark-text">Réservations cette semaine</p><Calendar className="w-4 h-4 text-[#2d7a5a]" /></div>
                  <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted mb-4">Nombre de réservations par jour</p>
                  <div style={{ position: "relative", height: "180px" }}><canvas ref={visitChartRef}></canvas></div>
                </div>
                <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-1"><p className="font-semibold text-sm text-[#1a4a36] dark:text-dark-text">Destinations Populaires</p><Eye className="w-4 h-4 text-[#2d7a5a]" /></div>
                  <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted mb-4">Par nombre d'avis</p>
                  <div style={{ position: "relative", height: "180px" }}><canvas ref={popChartRef}></canvas></div>
                </div>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-5 shadow-sm">
                  <p className="font-semibold text-sm mb-4 text-[#1a4a36] dark:text-dark-text">Activité Récente</p>
                  {recentActivity.length > 0 ? recentActivity.slice(0, 4).map((a, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-[#e0dcd4] dark:border-dark-border last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-[#f7f5f0] dark:bg-dark-surface-2 flex items-center justify-center flex-shrink-0"><Calendar className="w-3.5 h-3.5 text-[#2d7a5a]" /></div>
                      <span className="text-sm text-[#2d7a5a] flex-1">{a.text}</span>
                      <span className="text-xs text-[#6b8f7b] flex-shrink-0">{a.time}</span>
                    </div>
                  )) : <p className="text-sm text-[#6b8f7b] dark:text-dark-text-muted text-center py-8">Aucune activité récente</p>}
                </div>
                <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl p-5 shadow-sm">
                  <p className="font-semibold text-sm mb-4 text-[#1a4a36] dark:text-dark-text">Actions Rapides</p>
                  <div className="flex flex-col gap-3">
                    {[{ label: "Ajouter une destination", tab: "destinations" }, { label: "Ajouter un hôtel", tab: "hotels" }, { label: "Ajouter une activité", tab: "activities" }, { label: "Voir les utilisateurs", tab: "users" }].map((q, i) => (
                      <button key={i} onClick={() => setActiveTab(q.tab)} className="flex items-center justify-between px-4 py-3 bg-[#f7f5f0] dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-xl text-sm text-[#2d7a5a] dark:text-dark-text hover:border-[#2d7a5a] transition">
                        <span>{q.label}</span><span className="text-[#c9a844] text-base">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DESTINATIONS */}
          {activeTab === "destinations" && (
            <div>
              <SearchBar value={searchDestinations} onChange={setSearchDestinations} placeholder="Rechercher une destination par nom, ville, région…" />
              <ResultsBadge filtered={filteredDestinations} total={destinations.length} label="destination(s)" />
              <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[480px]">
                  <thead className="bg-[#f7f5f0] dark:bg-dark-surface-2 text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase border-b border-[#e0dcd4] dark:border-dark-border">
                    <tr><th className="p-4 sm:p-6">Visuel</th><th className="p-4 sm:p-6">Nom</th><th className="p-4 sm:p-6">Localisation</th><th className="p-4 sm:p-6 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0dcd4] dark:divide-dark-border">
                    {filteredDestinations.length > 0 ? filteredDestinations.map((d) => (
                      <tr key={d.id} className="hover:bg-[#f7f5f0] dark:hover:bg-dark-surface-2 transition">
                        <td className="p-4 sm:p-6"><img src={d.image_url} className="w-14 h-10 object-cover rounded-lg border border-[#e0dcd4] dark:border-dark-border" alt="" onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Image"} /></td>
                        <td className="p-4 sm:p-6 font-bold text-[#1a4a36] dark:text-dark-text text-sm">{d.name}</td>
                        <td className="p-4 sm:p-6 text-[#2d7a5a] text-sm">{d.location}</td>
                        <td className="p-4 sm:p-6 text-right"><button onClick={() => handleDelete(d.id)} className="p-2 text-[#b08a30] hover:bg-[#b08a30]/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    )) : <tr><td colSpan={4} className="p-12 text-center text-[#6b8f7b] dark:text-dark-text-muted text-sm">{searchDestinations ? `Aucune destination trouvée pour "${searchDestinations}"` : "Aucune destination disponible"}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HOTELS */}
          {activeTab === "hotels" && (
            <div>
              <SearchBar value={searchHotels} onChange={setSearchHotels} placeholder="Rechercher un hôtel par nom, ville, localisation…" />
              <ResultsBadge filtered={filteredHotels} total={hotels.length} label="hôtel(s)" />
              <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[540px]">
                  <thead className="bg-[#f7f5f0] dark:bg-dark-surface-2 text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase border-b border-[#e0dcd4] dark:border-dark-border">
                    <tr><th className="p-4 sm:p-6">Visuel</th><th className="p-4 sm:p-6">Nom</th><th className="p-4 sm:p-6">Localisation</th><th className="p-4 sm:p-6">Prix</th><th className="p-4 sm:p-6 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0dcd4] dark:divide-dark-border">
                    {filteredHotels.length > 0 ? filteredHotels.map((h) => (
                      <tr key={h.id} className="hover:bg-[#f7f5f0] dark:hover:bg-dark-surface-2 transition">
                        <td className="p-4 sm:p-6"><img src={h.image_url} className="w-14 h-10 object-cover rounded-lg border border-[#e0dcd4] dark:border-dark-border" alt="" onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Image"} /></td>
                        <td className="p-4 sm:p-6 font-bold text-[#1a4a36] dark:text-dark-text text-sm">{h.name}</td>
                        <td className="p-4 sm:p-6 text-[#2d7a5a] text-sm">{h.location}</td>
                        <td className="p-4 sm:p-6 text-[#c9a844] font-bold text-sm">{h.price} DA</td>
                        <td className="p-4 sm:p-6 text-right"><button onClick={() => handleDeleteHotel(h.id)} className="p-2 text-[#b08a30] hover:bg-[#b08a30]/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    )) : <tr><td colSpan={5} className="p-12 text-center text-[#6b8f7b] dark:text-dark-text-muted text-sm">{searchHotels ? `Aucun hôtel trouvé pour "${searchHotels}"` : "Aucun hôtel disponible"}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACTIVITIES */}
          {activeTab === "activities" && (
            <div>
              <SearchBar value={searchActivities} onChange={setSearchActivities} placeholder="Rechercher une activité par nom, ville, localisation…" />
              <ResultsBadge filtered={filteredActivities} total={activities.length} label="activité(s)" />
              <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[540px]">
                  <thead className="bg-[#f7f5f0] dark:bg-dark-surface-2 text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase border-b border-[#e0dcd4] dark:border-dark-border">
                    <tr><th className="p-4 sm:p-6">Visuel</th><th className="p-4 sm:p-6">Nom</th><th className="p-4 sm:p-6">Localisation</th><th className="p-4 sm:p-6">Prix</th><th className="p-4 sm:p-6 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0dcd4] dark:divide-dark-border">
                    {filteredActivities.length > 0 ? filteredActivities.map((a) => (
                      <tr key={a.id} className="hover:bg-[#f7f5f0] dark:hover:bg-dark-surface-2 transition">
                        <td className="p-4 sm:p-6"><img src={a.image_url} className="w-14 h-10 object-cover rounded-lg border border-[#e0dcd4] dark:border-dark-border" alt="" onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Image"} /></td>
                        <td className="p-4 sm:p-6 font-bold text-[#1a4a36] dark:text-dark-text text-sm">{a.name}</td>
                        <td className="p-4 sm:p-6 text-[#2d7a5a] text-sm">{a.location}</td>
                        <td className="p-4 sm:p-6 text-[#c9a844] font-bold text-sm">{a.price} DA</td>
                        <td className="p-4 sm:p-6 text-right"><button onClick={() => handleDeleteActivity(a.id)} className="p-2 text-[#b08a30] hover:bg-[#b08a30]/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    )) : <tr><td colSpan={5} className="p-12 text-center text-[#6b8f7b] dark:text-dark-text-muted text-sm">{searchActivities ? `Aucune activité trouvée pour "${searchActivities}"` : "Aucune activité disponible"}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <div>
              <SearchBar value={searchUsers} onChange={setSearchUsers} placeholder="Rechercher un utilisateur par nom, prénom, email…" />
              <ResultsBadge filtered={filteredUsers} total={users.length} label="utilisateur(s)" />
              <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[580px]">
                  <thead className="bg-[#f7f5f0] dark:bg-dark-surface-2 text-[#6b8f7b] dark:text-dark-text-muted text-xs uppercase border-b border-[#e0dcd4] dark:border-dark-border">
                    <tr><th className="p-4 sm:p-6">Utilisateur</th><th className="p-4 sm:p-6">Email</th><th className="p-4 sm:p-6">Rôle</th><th className="p-4 sm:p-6">Statut</th><th className="p-4 sm:p-6 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0dcd4] dark:divide-dark-border">
                    {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#f7f5f0] dark:hover:bg-dark-surface-2 transition">
                        <td className="p-4 sm:p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#f7f5f0] dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {u.profilePhoto ? <img src={u.profilePhoto.startsWith('http') ? u.profilePhoto : `http://localhost:3000${u.profilePhoto}`} alt={u.username} className="w-full h-full object-cover" /> : <svg className="w-5 h-5 text-[#6b8f7b]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}                            </div>
                            <div><p className="font-bold text-[#1a4a36] dark:text-dark-text text-sm">{u.username}</p><p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted">{u.firstName} {u.lastName}</p></div>
                          </div>
                        </td>
                        <td className="p-4 sm:p-6 text-[#2d7a5a] text-sm">{u.email}</td>
                        <td className="p-4 sm:p-6"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === "admin" ? "bg-[#c9a844]/20 text-[#c9a844]" : "bg-[#f7f5f0] dark:bg-dark-surface-2 text-[#2d7a5a]"}`}>{u.role === "admin" ? "Admin" : "Utilisateur"}</span></td>
                        <td className="p-4 sm:p-6"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isBlocked ? "bg-[#b08a30]/20 text-[#b08a30]" : "bg-[#2d7a5a]/20 text-[#2d7a5a]"}`}>{u.isBlocked ? "Bloqué" : "Actif"}</span></td>
                        <td className="p-4 sm:p-6 text-right space-x-2">
                          {u.role !== "admin" && (<>
                            {u.isBlocked ? <button onClick={() => handleUnblockUser(u.id)} className="p-2 text-[#2d7a5a] hover:bg-[#2d7a5a]/10 rounded-lg transition"><CheckCircle2 className="w-4 h-4" /></button> : <button onClick={() => handleBlockUser(u.id)} className="p-2 text-[#c9a844] hover:bg-[#c9a844]/10 rounded-lg transition"><X className="w-4 h-4" /></button>}
                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-[#b08a30] hover:bg-[#b08a30]/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                          </>)}
                        </td>
                      </tr>
                    )) : <tr><td colSpan={5} className="p-12 text-center text-[#6b8f7b] dark:text-dark-text-muted text-sm">{searchUsers ? `Aucun utilisateur trouvé pour "${searchUsers}"` : "Aucun utilisateur disponible"}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "transports"   && <TransportManagement />}
          {activeTab === "reservations" && <ReservationsManagement />}
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════
          MODAL — Dark mode complet + IA uniquement destinations
      ═══════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-dark-surface border border-[#e0dcd4] dark:border-dark-border w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#1a4a36] dark:text-dark-text">
                  {activeTab === "hotels" ? "Nouvel Hôtel" : activeTab === "activities" ? "Nouvelle Activité" : "Nouvelle Destination"}
                </h3>
                {activeTab === "destinations" && (
                  <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted mt-0.5 flex items-center gap-1">
                    <Brain className="w-3 h-3 text-[#c9a844]" /> Scores générés automatiquement par IA
                  </p>
                )}
              </div>
              <button onClick={resetModal} className="text-[#6b8f7b] hover:text-[#1a4a36] dark:hover:text-dark-text transition"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload */}
              <label className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-[#e0dcd4] dark:border-dark-border rounded-xl cursor-pointer hover:border-[#c9a844] dark:hover:border-[#c9a844] bg-[#f7f5f0] dark:bg-dark-surface-2 transition">
                <Upload className="w-7 h-7 text-[#6b8f7b] dark:text-dark-text-muted mb-1" />
                <p className="text-xs text-[#6b8f7b] dark:text-dark-text-muted px-4 text-center truncate w-full">{selectedFile ? selectedFile.name : "Uploader une photo"}</p>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </label>

              {/* NOM : avec IA pour destinations, sans IA pour hôtels/activités */}
              {activeTab === "destinations" ? (
                <div ref={autocompleteRef}>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b8f7b]" />
                    <input
                      placeholder="Nom de la destination (ex: Béjaïa, Tassili…) *"
                      required
                      className="w-full bg-white dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-full pl-10 pr-10 py-2.5 focus:border-[#2d7a5a] outline-none transition text-[#1a4a36] dark:text-dark-text placeholder-[#6b8f7b] dark:placeholder-[#4a7060] shadow-sm"
                      value={searchQuery}
                      onChange={handleSearchInput}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {aiLoading && <Loader2 className="w-4 h-4 text-[#c9a844] animate-spin" />}
                      {!aiLoading && aiSuccess && <CheckCircle2 className="w-4 h-4 text-[#2d7a5a]" />}
                      {!aiLoading && !aiSuccess && !aiError && searchQuery.length >= 3 && <Brain className="w-4 h-4 text-[#6b8f7b]" />}
                    </div>
                  </div>
                  {aiLoading && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#c9a844] bg-[#c9a844]/10 dark:bg-[#c9a844]/5 px-3 py-2 rounded-xl">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Gemini analyse la destination et génère les scores automatiquement…
                    </div>
                  )}
                  {!aiLoading && aiSuccess && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#2d7a5a] bg-[#2d7a5a]/10 dark:bg-[#2d7a5a]/5 px-3 py-2 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Scores et description générés automatiquement par Gemini AI !
                    </div>
                  )}
                  {!aiLoading && aiError && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#b08a30] bg-[#b08a30]/10 dark:bg-[#b08a30]/5 px-3 py-2 rounded-xl">
                      <X className="w-3.5 h-3.5" /> {aiError}
                    </div>
                  )}
                </div>
              ) : (
                /* Hôtel ou Activité : champ simple SANS IA */
                <input
                  placeholder={activeTab === "hotels" ? "Nom de l'hôtel *" : "Nom de l'activité *"}
                  required
                  className={inputClass}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              )}

              {/* Description */}
              <textarea
                placeholder="Description *"
                required
                className={textareaClass}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <input placeholder="Pays *" required className={inputClass} value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                <input placeholder="Ville *" required className={inputClass} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
              </div>

              <input placeholder="Lieu / Région" className={inputClass} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />

              {(activeTab === "hotels" || activeTab === "activities") && destinations.length > 0 && (
                <select className={selectClass} value={formData.destination_id} onChange={e => setFormData({ ...formData, destination_id: e.target.value })}>
                  <option value="">-- Sélectionner une destination --</option>
                  {destinations.map(dest => <option key={dest.id} value={dest.id}>{dest.name}</option>)}
                </select>
              )}

              {/* SCORES — destinations uniquement, avec dark mode */}
              {activeTab === "destinations" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs text-[#c9a844] font-bold uppercase flex items-center gap-2"><Star className="w-4 h-4" /> Scores (0–10)</label>
                    <span className="text-[10px] text-[#6b8f7b] dark:text-dark-text-muted flex items-center gap-1"><Brain className="w-3 h-3" /> Auto via Gemini · modifiables</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "luxury_score",    label: "Luxe",        icon: <Crown size={12} /> },
                      { key: "nature_score",    label: "Nature",      icon: <Mountain size={12} /> },
                      { key: "adventure_score", label: "Aventure",    icon: <Tent size={12} /> },
                      { key: "culture_score",   label: "Culture",     icon: <Landmark size={12} /> },
                      { key: "beach_score",     label: "Plage",       icon: <Waves size={12} /> },
                      { key: "food_score",      label: "Gastronomie", icon: <Utensils size={12} /> },
                    ].map(({ key, label, icon }) => (
                      <div key={key} className="bg-[#f7f5f0] dark:bg-dark-surface-2 border border-[#e0dcd4] dark:border-dark-border rounded-xl p-3">
                        <label className="text-xs text-[#2d7a5a] dark:text-[#3d9a7a] font-bold uppercase mb-1 flex items-center gap-1.5">{icon} {label}</label>
                        <input type="range" min="0" max="10" step="0.5" className="w-full accent-[#c9a844]" value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
                        <div className="text-right text-xs text-[#c9a844] font-bold mt-1">{formData[key]}/10</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prix / Note / Étoiles */}
              <div className={`grid ${activeTab === "hotels" ? "grid-cols-2" : "grid-cols-1"} gap-3 sm:gap-4`}>
                {activeTab !== "destinations" && (
                  <input placeholder="Prix DA *" type="number" required className={inputClass} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                )}
                {activeTab === "destinations" && (
                  <input placeholder="Note (0-5)" type="number" step="0.1" min="0" max="5" className={inputClass} value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} />
                )}
                {activeTab === "hotels" && (
                  <select className={selectClass} value={formData.stars} onChange={e => setFormData({ ...formData, stars: e.target.value })}>
                    <option value="3">3 ★</option><option value="4">4 ★</option><option value="5">5 ★</option>
                  </select>
                )}
              </div>

              <button type="submit" disabled={aiLoading}
                className="w-full bg-[#c9a844] text-white font-bold py-3 rounded-full hover:bg-[#b08a30] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {aiLoading ? "Gemini génère les scores…" : "Publier"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

