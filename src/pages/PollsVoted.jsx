import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { socket } from "../socket";
import { 
  Clock, 
  Filter, 
  Search,
  Users,
  Award,
  Trophy,
  History,
  CalendarCheck
} from "lucide-react";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import SideBar from "../components/SideBar";

export default function PollsVoted() {
  const [polls, setPolls] = useState([]);
  const token = localStorage.getItem("token");
  const [category, setCategory] = useState("All");
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [realTimeUpdates, setRealTimeUpdates] = useState({});

  const lockRef = useRef(false);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(0);
  const pollingRef = useRef(null);

  const fetchPolls = useCallback(async (force = false) => {
    const currentTime = Date.now();
    if (!force && currentTime - lastFetchRef.current < 2000) return;
    
    lastFetchRef.current = currentTime;
    
    if (lockRef.current) return;
    lockRef.current = true;
    
    setLoading(true);
    try {
      const url =
        category === "All"
          ? `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/sondage/voted`
          : `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/sondage/voted?categorie=${encodeURIComponent(
              category
            )}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (mountedRef.current) {
        setPolls(res.data);
      }
    } catch (err) {
      console.error("Erreur chargement sondages votés :", err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      lockRef.current = false;
    }
  }, [category, token]);

  // Chargement initial
  useEffect(() => {
    mountedRef.current = true;
    fetchPolls();

    // Polling léger pour maintenir à jour (toutes les 30s)
    pollingRef.current = setInterval(() => {
      if (mountedRef.current && !lockRef.current) {
        fetchPolls();
      }
    }, 30000);

    return () => {
      mountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchPolls]);

  // Timer pour mise à jour du temps
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket.io pour mises à jour temps réel
  useEffect(() => {
    if (!token) return;

    // Quand un sondage est modifié
    const onPollsChanged = () => {
      if (mountedRef.current && !lockRef.current) {
        fetchPolls(true);
      }
    };

    // Quand les résultats sont mis à jour
    const onResultsUpdated = (data) => {
      // Mettre à jour le compteur de votes pour ce sondage
      setRealTimeUpdates(prev => ({
        ...prev,
        [data.pollId]: {
          voters: data.totalVoters,
          timestamp: Date.now()
        }
      }));

      // Mettre à jour le sondage concerné
      setPolls(prev => prev.map(p => 
        p.id === data.pollId 
          ? { ...p, voters: data.totalVoters }
          : p
      ));
    };

    // Quand un sondage se termine
    const onPollFinished = (data) => {
      // Si ce sondage était en cours et devient terminé
      setPolls(prev => prev.map(p => 
        p.id === data.pollId 
          ? { ...p, Etat: 'finished' }
          : p
      ));
    };

    // Abonnement aux événements
    socket.on("polls:changed", onPollsChanged);
    socket.on("poll:results:updated", onResultsUpdated);
    socket.on("poll:finished", onPollFinished);

    // Nettoyage
    return () => {
      socket.off("polls:changed", onPollsChanged);
      socket.off("poll:results:updated", onResultsUpdated);
      socket.off("poll:finished", onPollFinished);
    };
  }, [token, fetchPolls]);

  // Fusionner les mises à jour temps réel
  const pollsWithRealtime = useMemo(() => {
    return polls.map(p => {
      const update = realTimeUpdates[p.id];
      if (update && Date.now() - update.timestamp < 10000) {
        return { ...p, voters: update.voters };
      }
      return p;
    });
  }, [polls, realTimeUpdates]);

  const { RemainingTime, filteredPolls, stats } = useMemo(() => {
    const nowDate = new Date(now);
    
    const RemainingTime = (endTime) => {
      const end = new Date(endTime);
      const diff = Math.floor((end.getTime() - nowDate.getTime()) / 1000);

      if (diff <= 0) return "Terminé";

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (days > 0) return `${days}j ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      if (minutes > 0) return `${minutes}m ${seconds}s`;
      return `${seconds}s`;
    };

    const pollsAvecEtat = pollsWithRealtime.map((poll) => {
      const end = new Date(poll.end_time);
      return {
        ...poll,
        isFinished: poll.Etat === "finished" || end <= nowDate,
      };
    });

    const filteredPolls = pollsAvecEtat.filter(poll => {
      if (!poll || !poll.question) return false;
      return searchTerm 
        ? poll.question.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
    });

    const stats = {
      total: polls.length,
      completed: pollsAvecEtat.filter(p => p.isFinished).length,
      active: pollsAvecEtat.filter(p => !p.isFinished).length,
      popular: polls.filter(p => p && p.voters > 10).length
    };

    return { RemainingTime, filteredPolls, stats };
  }, [pollsWithRealtime, now, searchTerm]);

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

  // Formatage de l'heure
  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, [now]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex gap-6">
        <SideBar selected={category} setSelected={setCategory} />

        <div className="flex-1 px-6">
          <div className="ml-10 md:ml-0 mt-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Mes sondages votés</h1>
            <p className="text-gray-600 mt-1">
              Consultez l'historique de vos votes et les résultats
            </p>
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
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{currentTime}</span>
              </div>
            </div>

            {/* Filtre actif */}
            {category !== "All" && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Catégorie: {category}
                </span>
                <button
                  onClick={() => setCategory("All")}
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
              {filteredPolls.length > 0 ? (
                <>
                  {/* Statistiques rapides */}
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total votés</p>
                          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CalendarCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Résultats disponibles</p>
                          <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">En attente de résultats</p>
                          <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid des sondages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolls.map((poll) => {
                      const mode = poll.isFinished ? "results" : "waiting";
                      return (
                        <PollCard
                          key={poll.id}
                          poll={poll}
                          remaining={RemainingTime(poll.end_time)}
                          isFinished={poll.isFinished}
                          mode={mode}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Footer info */}
                  <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-600">
                            {filteredPolls.length} sondage{filteredPolls.length !== 1 ? 's' : ''} voté{filteredPolls.length !== 1 ? 's' : ''}
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
                          <Award className="h-4 w-4 text-amber-500" />
                          <span>{stats.completed} résultats disponibles</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Vos participations</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-300">
                    <History className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {searchTerm ? "Aucun résultat trouvé" : "Aucun sondage voté"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    {searchTerm 
                      ? `Aucun sondage voté ne correspond à "${searchTerm}"`
                      : "Vous n'avez pas encore voté à des sondages. Commencez par participer !"
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 font-medium"
                      >
                        Afficher tous les sondages votés
                      </button>
                    )}
                    <button
                      onClick={() => window.location.href = '/polls'}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-all duration-300 font-medium"
                    >
                      Voter maintenant
                    </button>
                  </div>
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