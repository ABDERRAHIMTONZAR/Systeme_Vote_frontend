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
  const [maintenant, setMaintenant] = useState(new Date());
  const [categorie, setCategorie] = useState("All");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const mountedRef = useRef(true);
  const lockRef = useRef(false);
  const lastFetchRef = useRef(0);

  const baseUrl = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:3001",
    []
  );

  // ✅ silent = true => pas de setLoading(true/false)
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
            : `${baseUrl}/sondage/unvoted?categorie=${encodeURIComponent(
                categorie
              )}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const nowDate = new Date();
        const filtres = (res.data || []).filter((s) => {
          if (!s) return false;
          const fin = new Date(s.end_time);
          return s.Etat !== "finished" && fin > nowDate;
        });

        if (mountedRef.current) setSondages(filtres);
      } catch (e) {
        console.error("Erreur chargement sondages:", e);
      } finally {
        if (!silent && mountedRef.current) setLoading(false);
        lockRef.current = false;
      }
    },
    [baseUrl, categorie, token]
  );

  // ✅ Chargement initial (avec loading)
  useEffect(() => {
    mountedRef.current = true;
    chargerSondages(true, false);
    return () => {
      mountedRef.current = false;
    };
  }, [chargerSondages]);

  // ✅ Timer countdown (normal)
  useEffect(() => {
    const timer = setInterval(() => setMaintenant(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Socket (refetch silencieux => aucun flash)
  useEffect(() => {
    if (!token) return;

    const onVoteAdded = ({ pollId, totalVoters }) => {
      setSondages((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, voters: totalVoters } : p))
      );
    };

    const onPollFinished = ({ pollId }) => {
      setSondages((prev) => prev.filter((p) => p.id !== pollId));
    };

    const onPollsChanged = async () => {
      // ✅ refetch mais SILENCIEUX
      await chargerSondages(true, true);
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

  const tempsRestant = (fin) => {
    const diff = Math.floor((new Date(fin) - maintenant) / 1000);
    if (diff <= 0) return "Terminé";

    const j = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return `${j ? j + "j " : ""}${h ? h + "h " : ""}${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex gap-6">
        <SideBar selected={categorie} setSelected={setCategorie} />

        <div className="flex-1 px-6">
          <h1 className="text-2xl font-bold mt-6 mb-4">
            Les sondages en cours
          </h1>

          {loading ? (
            <p className="text-gray-500 mt-4">Chargement...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sondages.map((s) => (
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
            </>
          )}
        </div>
      </main>

      <ChatBubble />
      <Footer />
    </div>
  );
}
