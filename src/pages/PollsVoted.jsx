import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { socket } from "../socket";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import SideBar from "../components/SideBar";

export default function PollsVoted() {
  const [polls, setPolls] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // ✅ pagination
  const [page, setPage] = useState(1);
  const pageSize = 6; // ✅ 6 polls par page

  const token = localStorage.getItem("token");
  const mountedRef = useRef(true);
  const lockRef = useRef(false);
  const lastFetchRef = useRef(0);

  const baseUrl = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:3001",
    []
  );

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
      if (!force && currentTime - lastFetchRef.current < 1000) return;

      lastFetchRef.current = currentTime;

      if (lockRef.current) return;
      lockRef.current = true;

      if (!silent && mountedRef.current) setLoading(true);

      try {
        const url =
          category === "All"
            ? `${baseUrl}/sondage/voted`
            : `${baseUrl}/sondage/voted?categorie=${encodeURIComponent(category)}`;

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
    [baseUrl, category, token]
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
      fetchPolls(true, true);
    };

    const onPollFinished = ({ pollId }) => {
      setPolls((prev) =>
        prev.map((p) =>
          p.id === pollId ? { ...p, Etat: "finished" } : p
        )
      );
    };

    socket.on("polls:changed", onPollsChanged);
    socket.on("poll:finished", onPollFinished);

    return () => {
      socket.off("polls:changed", onPollsChanged);
      socket.off("poll:finished", onPollFinished);
    };
  }, [token, fetchPolls]);

  // ✅ si catégorie change => page 1
  useEffect(() => {
    setPage(1);
  }, [category]);

  const isPollFinished = (poll) => {
    const fin = parseUTCDate(poll.end_time);
    const maintenant = new Date(now);
    return poll.Etat === "finished" || fin <= maintenant;
  };

  const tempsRestant = (finUTC) => {
    const fin = parseUTCDate(finUTC);
    const maintenant = new Date(now);
    const diff = Math.floor((fin - maintenant) / 1000);

    if (diff <= 0) return "Terminé";

    const j = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return `${j ? j + "j " : ""}${h ? h + "h " : ""}${m}m ${s}s`;
  };

  // ✅ pagination calc
  const totalPages = Math.max(1, Math.ceil(polls.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = polls.slice(start, end);

  // ✅ range buttons (max 5)
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

  // ✅ keep page valid after list size changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polls.length, totalPages]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex gap-6">
        <SideBar selected={category} setSelected={setCategory} />

        <div className="flex-1 px-6">
          <h1 className="text-2xl font-bold mt-6 mb-4">Mes sondages votés</h1>

          {loading ? (
            <p className="text-gray-500 mt-4">Chargement...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageItems.map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    remaining={tempsRestant(poll.end_time)}
                    isFinished={isPollFinished(poll)}
                    mode={isPollFinished(poll) ? "results" : "waiting"}
                  />
                ))}
              </div>

              {polls.length === 0 && (
                <p className="text-gray-500 mt-4">Aucun sondage voté à afficher.</p>
              )}

              {/* ✅ Pagination UI */}
              {polls.length > pageSize && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
                  <div className="text-sm text-gray-600">
                    Affichage {start + 1}-{Math.min(end, polls.length)} sur{" "}
                    {polls.length}
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
          )}
        </div>
      </main>

      <ChatBubble />
      <Footer />
    </div>
  );
}