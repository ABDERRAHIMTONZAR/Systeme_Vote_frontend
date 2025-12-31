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
  CalendarCheck,
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

  // ✅ pagination
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const lockRef = useRef(false);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(0);

  // ✅ Ajout de la même fonction parseUTCDate
  const parseUTCDate = (utcString) => {
    const d = new Date(utcString);
    return new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    );
  };

  const fetchPolls = useCallback(
    async (force = false, silent = false) => {
      const currentTime = Date.now();
      if (!force && currentTime - lastFetchRef.current < 2000) return;

      lastFetchRef.current = currentTime;

      if (lockRef.current) return;
      lockRef.current = true;

      if (!silent && mountedRef.current) setLoading(true);

      try {
        const baseUrl =
          process.env.REACT_APP_API_URL || "http://localhost:3001";

        const url =
          category === "All"
            ? `${baseUrl}/sondage/voted`
            : `${baseUrl}/sondage/voted?categorie=${encodeURIComponent(
                category
              )}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (mountedRef.current) setPolls(res.data || []);
      } catch (err) {
        console.error("Erreur chargement sondages votés :", err);
      } finally {
        if (!silent && mountedRef.current) setLoading(false);
        lockRef.current = false;
      }
    },
    [category, token]
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchPolls(true, false);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchPolls]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return;

    const onPollsChanged = () => {
      if (mountedRef.current && !lockRef.current) fetchPolls(true, true);
    };

    const onResultsUpdated = (data) => {
      setRealTimeUpdates((prev) => ({
        ...prev,
        [data.pollId]: {
          voters: data.totalVoters,
          timestamp: Date.now(),
        },
      }));

      setPolls((prev) =>
        prev.map((p) =>
          p.id === data.pollId ? { ...p, voters: data.totalVoters } : p
        )
      );
    };

    const onPollFinished = (data) => {
      setPolls((prev) =>
        prev.map((p) => (p.id === data.pollId ? { ...p, Etat: "finished" } : p))
      );
    };

    socket.on("polls:changed", onPollsChanged);
    socket.on("poll:results:updated", onResultsUpdated);
    socket.on("poll:finished", onPollFinished);

    return () => {
      socket.off("polls:changed", onPollsChanged);
      socket.off("poll:results:updated", onResultsUpdated);
      socket.off("poll:finished", onPollFinished);
    };
  }, [token, fetchPolls]);

  // ✅ reset page when filters change
  useEffect(() => setPage(1), [category, searchTerm]);

  const pollsWithRealtime = useMemo(() => {
    return polls.map((p) => {
      const update = realTimeUpdates[p.id];
      if (update && Date.now() - update.timestamp < 10000) {
        return { ...p, voters: update.voters };
      }
      return p;
    });
  }, [polls, realTimeUpdates]);

  const { RemainingTime, filteredPolls } = useMemo(() => {
    const nowDate = new Date(now);

    const RemainingTime = (endTime) => {
      const fin = parseUTCDate(endTime); // <-- Utilisation de parseUTCDate
      const diff = Math.floor((fin.getTime() - nowDate.getTime()) / 1000);

      if (diff <= 0) return "Terminé";

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      // ✅ Format identique à PollsPage
      if (days > 0) return `${days}j ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      if (minutes > 0) return `${minutes}m ${seconds}s`;
      return `${seconds}s`;
    };

    const pollsAvecEtat = pollsWithRealtime.map((poll) => {
      const fin = parseUTCDate(poll.end_time); // <-- Utilisation de parseUTCDate
      return {
        ...poll,
        isFinished: poll.Etat === "finished" || fin <= nowDate,
      };
    });

    const filteredPolls = pollsAvecEtat.filter((poll) => {
      if (!poll || !poll.question) return false;
      return searchTerm
        ? poll.question.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
    });

    return { RemainingTime, filteredPolls };
  }, [pollsWithRealtime, now, searchTerm]);

  // ✅ pagination calc over filteredPolls
  const totalPages = Math.max(1, Math.ceil(filteredPolls.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filteredPolls.slice(start, end);

  const pageButtons = useMemo(() => {
    const max = 5;
    const half = Math.floor(max / 2);
    let from = Math.max(1, safePage - half);
    let to = Math.min(totalPages, from + max - 1);
    from = Math.max(1, to - max + 1);
    const arr = [];
    for (let i = from; i <= to; i++) arr.push(i);
    return arr;
  }, [safePage, totalPages]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPolls.length, totalPages]);

  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [now]);

  const SkeletonLoader = useMemo(
    () => () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-sm border animate-pulse"
          >
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
    ),
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex gap-6">
        <SideBar selected={category} setSelected={setCategory} />

        <div className="flex-1 px-6">
          <div className="ml-10 md:ml-0 mt-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Mes sondages votés
            </h1>
            <p className="text-gray-600 mt-1">
              Consultez l'historique de vos votes et les résultats
            </p>
          </div>

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

          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {filteredPolls.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pageItems.map((poll) => {
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

                  {filteredPolls.length > pageSize && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
                      <div className="text-sm text-gray-600">
                        Affichage {start + 1}-{Math.min(end, filteredPolls.length)} sur{" "}
                        {filteredPolls.length}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={safePage === 1}
                        >
                          Précédent
                        </button>

                        {pageButtons.map((n) => (
                          <button
                            key={n}
                            onClick={() => setPage(n)}
                            className={`px-3 py-2 rounded-lg border ${
                              n === safePage
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white"
                            }`}
                          >
                            {n}
                          </button>
                        ))}

                        <button
                          className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={safePage === totalPages}
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
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
                      : "Vous n'avez pas encore voté à des sondages. Commencez par participer !"}
                  </p>
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