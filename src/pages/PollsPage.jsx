import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { socket } from "../socket";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import SideBar from "../components/SideBar";

export default function PollsPage() {
  const [sondages, setSondages] = useState([]);
  const [maintenant, setMaintenant] = useState(Date.now()); // ✅ timestamp (plus simple)
  const [categorie, setCategorie] = useState("All");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const token = localStorage.getItem("token");
  const mountedRef = useRef(true);
  const lockRef = useRef(false);
  const lastFetchRef = useRef(0);

  const baseUrl = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:3001",
    []
  );

const chargerSondages = useCallback(
  async (force = false, silent = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    if (lockRef.current) return;
    lockRef.current = true;

    if (!silent && mountedRef.current) setLoading(true);

    try {
      const url =
        categorie === "All"
          ? `${baseUrl}/sondage/unvoted`
          : `${baseUrl}/sondage/unvoted?categorie=${encodeURIComponent(categorie)}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nowMs = Date.now(); // ✅ pas besoin de "maintenant"
      const filtres = (res.data || []).filter((s) => {
        if (!s) return false;
        const finMs = new Date(s.end_time).getTime();
        return s.Etat !== "finished" && finMs > nowMs;
      });

      if (mountedRef.current) setSondages(filtres);
    } catch (e) {
      console.error("Erreur chargement sondages:", e);
    } finally {
      if (!silent && mountedRef.current) setLoading(false);
      lockRef.current = false;
    }
  },
  [baseUrl, categorie, token] // ✅ maintenant retiré
);

  useEffect(() => {
    mountedRef.current = true;
    chargerSondages(true, false);
    return () => {
      mountedRef.current = false;
    };
  }, [chargerSondages]);

  // ✅ tick temps
  useEffect(() => {
    const timer = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ sockets
  useEffect(() => {
    if (!token) return;

    const onVoteAdded = ({ pollId, totalVoters }) => {
      setSondages((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, voters: totalVoters } : p))
      );
    };

    const onPollFinished = ({ pollId }) => {
      // si backend émet poll:finished
      setSondages((prev) => prev.filter((p) => p.id !== pollId));
    };

    const onPollsChanged = () => {
      chargerSondages(true, true); // silent
    };

    socket.on("poll:vote:added", onVoteAdded);
    socket.on("poll:finished", onPollFinished);
    socket.on("polls:changed", onPollsChanged);

    return () => {
      socket.off("poll:vote:added", onVoteAdded);
      socket.off("poll:finished", onPollFinished);
      socket.off("polls:changed", onPollsChanged);
    };
  }, [token, chargerSondages]);

  useEffect(() => setPage(1), [categorie]);

  const tempsRestant = (finString) => {
    const finMs = new Date(finString).getTime();
    const diff = Math.floor((finMs - maintenant) / 1000);
    if (diff <= 0) return "Terminé";

    const j = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return `${j ? j + "j " : ""}${h ? h + "h " : ""}${m}m ${s}s`;
  };

  const totalPages = Math.max(1, Math.ceil(sondages.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = sondages.slice(start, end);

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
  }, [sondages.length, totalPages]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex gap-6">
        <SideBar selected={categorie} setSelected={setCategorie} />

        <div className="flex-1 px-6">
          <h1 className="text-2xl font-bold mt-6 mb-4">Les sondages en cours</h1>

          {loading ? (
            <p className="text-gray-500 mt-4">Chargement...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageItems.map((s) => (
                  <PollCard
                    key={s.id}
                    poll={s}
                    remaining={tempsRestant(s.end_time)}
                    isFinished={false}
                    mode="vote"
                  />
                ))}
              </div>

              {sondages.length === 0 && (
                <p className="text-gray-500 mt-4">Aucun sondage à afficher.</p>
              )}

              {sondages.length > pageSize && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
                  <div className="text-sm text-gray-600">
                    Affichage {start + 1}-{Math.min(end, sondages.length)} sur{" "}
                    {sondages.length}
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
