import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { socket } from "../socket";
import { 
  Clock, 
  Filter, 
  Search,
  Zap,
  BarChart3,
  Vote,
  Sparkles,
  TrendingUp
} from "lucide-react";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import SideBar from "../components/SideBar";

export default function PollsPage() {
  const [sondages, setSondages] = useState([]);
  const [maintenant, setMaintenant] = useState(Date.now());
  const [categorie, setCategorie] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [realTimeUpdates, setRealTimeUpdates] = useState({});
  const [statsUpdated, setStatsUpdated] = useState(false);

  const token = localStorage.getItem("token");
  const lockRef = useRef(false);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(0);
  const pollingRef = useRef(null);

  const chargerSondages = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 2000) return;
    
    lastFetchRef.current = now;
    
    if (lockRef.current) return;
    lockRef.current = true;
    
    setLoading(true);
    try {
      const url =
        categorie === "All"
          ? `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/sondage/unvoted`
          : `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/sondage/unvoted?categorie=${encodeURIComponent(
              categorie
            )}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const maintenantDate = new Date();
      const filtres = res.data.filter((s) => {
        if (!s) return false;
        const fin = new Date(s.end_time);
        return s.Etat !== "finished" && fin > maintenantDate;
      });

      if (mountedRef.current) {
        setSondages(filtres);
        setStatsUpdated(true);
        setTimeout(() => setStatsUpdated(false), 1000);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des sondages:", error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      lockRef.current = false;
    }
  }, [categorie, token]);

  // Chargement initial
  useEffect(() => {
    mountedRef.current = true;
    chargerSondages();

    // Polling léger pour maintenir à jour (toutes les 30s)
    pollingRef.current = setInterval(() => {
      if (mountedRef.current && !lockRef.current) {
        chargerSondages();
      }
    }, 30000);

    return () => {
      mountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [chargerSondages]);

  // Timer pour l'heure actuelle
  useEffect(() => {
    const timer = setInterval(() => {
      setMaintenant(Date.now());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Socket.io pour mises à jour temps réel
  useEffect(() => {
    if (!token) return;

    console.log("🎯 Configuration des listeners Socket.io pour PollsPage");

    // Quand un sondage est créé/modifié/supprimé
    const onPollsChanged = (data) => {
      console.log("📡 polls:changed reçu", data);
      if (mountedRef.current && !lockRef.current) {
        chargerSondages(true);
      }
    };

    // Quand un vote est ajouté (mise à jour du compteur)
    const onVoteAdded = (data) => {
      console.log("🗳️ Nouveau vote temps réel:", data);
      
      // Mettre à jour l'état des mises à jour temps réel
      setRealTimeUpdates(prev => ({
        ...prev,
        [data.pollId]: {
          voters: data.totalVoters,
          timestamp: Date.now()
        }
      }));

      // Mettre à jour immédiatement le sondage concerné
      setSondages(prev => prev.map(s => 
        s.id === data.pollId 
          ? { ...s, voters: data.totalVoters }
          : s
      ));
    };

    // Quand un sondage se termine automatiquement
    const onPollFinished = (data) => {
      console.log("🏁 Sondage terminé:", data);
      // Retirer le sondage terminé de la liste
      setSondages(prev => prev.filter(s => s.id !== data.pollId));
    };

    // Écouter les mises à jour des statistiques
    const onStatsUpdate = (data) => {
      console.log("📊 Mise à jour statistiques:", data);
      setStatsUpdated(true);
      setTimeout(() => setStatsUpdated(false), 1500);
    };

    // Abonnement aux événements
    socket.on("polls:changed", onPollsChanged);
    socket.on("poll:vote:added", onVoteAdded);
    socket.on("poll:finished", onPollFinished);
    socket.on("stats:updated", onStatsUpdate);

    // Nettoyage
    return () => {
      socket.off("polls:changed", onPollsChanged);
      socket.off("poll:vote:added", onVoteAdded);
      socket.off("poll:finished", onPollFinished);
      socket.off("stats:updated", onStatsUpdate);
    };
  }, [token, chargerSondages]);

  // Fusionner les mises à jour temps réel
  const sondagesWithRealtime = useMemo(() => {
    return sondages.map(s => {
      const update = realTimeUpdates[s.id];
      if (update && Date.now() - update.timestamp < 10000) { // 10 secondes
        return { ...s, voters: update.voters, hasRealTimeUpdate: true };
      }
      return { ...s, hasRealTimeUpdate: false };
    });
  }, [sondages, realTimeUpdates]);

  const { tempsRestant, filteredSondages, stats } = useMemo(() => {
    const maintenantDate = new Date(maintenant);
    
    const tempsRestant = (fin) => {
      const diff = Math.floor((new Date(fin).getTime() - maintenantDate.getTime()) / 1000);

      if (diff <= 0) return "Terminé";

      const j = Math.floor(diff / 86400);
      const h = Math.floor((diff % 86400) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      if (j > 0) return `${j}j ${h}h ${m}m ${s}s`;
      if (h > 0) return `${h}h ${m}m ${s}s`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    };

    const filteredSondages = sondagesWithRealtime.filter(s => {
      if (!s || !s.question) return false;
      return searchTerm 
        ? s.question.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
    });

    const stats = {
      total: sondagesWithRealtime.length,
      expiringSoon: sondagesWithRealtime.filter(s => {
        if (!s) return false;
        const diff = new Date(s.end_time).getTime() - maintenantDate.getTime();
        return diff > 0 && diff < 3600000; // Moins d'1 heure
      }).length,
      popular: sondagesWithRealtime.filter(s => s && s.voters > 10).length,
      realTimeUpdates: Object.keys(realTimeUpdates).filter(id => 
        Date.now() - realTimeUpdates[id].timestamp < 10000
      ).length
    };

    return { tempsRestant, filteredSondages, stats };
  }, [sondagesWithRealtime, maintenant, searchTerm, realTimeUpdates]);

  // Skeleton loader
  const SkeletonLoader = useMemo(() => () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded-xl mb-6"></div>
          <div className="flex justify-between">
            <div className="h-7 bg-gray-200 rounded-full w-24"></div>
            <div className="h-7 bg-gray-200 rounded-full w-20"></div>
          </div>
        </div>
      ))}
    </div>
  ), []);

  // Formatage de l'heure locale
  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, [maintenant]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex gap-6">
        <SideBar selected={categorie} setSelected={setCategorie} />

        <div className="flex-1 px-6">
          <div className="ml-10 md:ml-0 mt-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Les sondages en cours</h1>
                <p className="text-gray-600 mt-1">Participez aux sondages en temps réel</p>
              </div>
              
              <div className="flex items-center gap-2">
                {statsUpdated && (
                  <div className="animate-pulse px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Mise à jour...</span>
                  </div>
                )}
                {stats.realTimeUpdates > 0 && (
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span>{stats.realTimeUpdates} en direct</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recherche et filtres */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un sondage..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className={`transition-all ${stats.realTimeUpdates > 0 ? 'font-semibold text-green-600' : ''}`}>
                    Temps réel actif
                  </span>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{currentTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtre actif */}
            {categorie !== "All" && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Catégorie: {categorie}
                </span>
                <button
                  onClick={() => setCategorie("All")}
                  className="text-xs px-2 py-1 bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-800 rounded transition-colors border border-blue-200"
                >
                  Effacer
                </button>
              </div>
            )}
          </div>

          {/* Contenu principal */}
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {filteredSondages.length > 0 ? (
                <>
                  {/* Statistiques rapides */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Vote className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Sondages disponibles</p>
                          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Expirent bientôt</p>
                          <p className="text-xl font-bold text-gray-900">{stats.expiringSoon}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Populaires</p>
                          <p className="text-xl font-bold text-gray-900">{stats.popular}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid des sondages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSondages.map((s) => (
                      <PollCard
                        key={s.id}
                        poll={s}
                        remaining={tempsRestant(s.end_time)}
                        isFinished={false}
                        mode="vote"
                        hasRealTimeUpdate={s.hasRealTimeUpdate}
                      />
                    ))}
                  </div>
                  
                  {/* Footer info */}
                  <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${stats.realTimeUpdates > 0 ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></div>
                          <span className="text-sm text-gray-600">
                            {filteredSondages.length} sondage{filteredSondages.length !== 1 ? 's' : ''} disponible{filteredSondages.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {searchTerm && (
                          <>
                            <div className="w-px h-4 bg-gray-300"></div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">
                                Filtre: "{searchTerm}"
                              </span>
                              <button
                                onClick={() => setSearchTerm("")}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded transition-colors"
                              >
                                Effacer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span>Live</span>
                          </div>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Mise à jour automatique toutes les 30s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-300">
                    <Search className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {searchTerm ? "Aucun résultat trouvé" : "Aucun sondage disponible"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    {searchTerm 
                      ? `Aucun sondage ne correspond à "${searchTerm}"`
                      : "Il n'y a actuellement aucun sondage en cours. Revenez plus tard !"
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 font-medium"
                    >
                      Afficher tous les sondages
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ChatBubble />
      <Footer />
    </div>
  );
} 