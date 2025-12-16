import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import axios from "axios";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import SideBar from "../components/SideBar";

export default function PollsVoted() {
  const [sondages, setSondages] = useState([]);
  const [maintenant, setMaintenant] = useState(new Date());
  const [categorie, setCategorie] = useState("All");
  const token = localStorage.getItem("token");
  const lockRef = useRef(false);

  const chargerSondages = useCallback(async () => {
    const url =
      categorie === "All"
        ? "http://localhost:3001/sondage/voted"
        : `http://localhost:3001/sondage/voted?categorie=${encodeURIComponent(
            categorie
          )}`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSondages(res.data);
  }, [categorie, token]);

  useEffect(() => {
    chargerSondages();
  }, [chargerSondages]);

  useEffect(() => {
    const timer = setInterval(() => setMaintenant(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      await axios.put(
        "http://localhost:3001/sondage/auto-finish",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      chargerSondages();
    }, 60000);

    return () => clearInterval(interval);
  }, [token, chargerSondages]);

  useEffect(() => {
    if (lockRef.current || !sondages.length) return;

    const fini = sondages.some(
      (s) => new Date(s.end_time) <= maintenant
    );

    if (!fini) return;

    lockRef.current = true;

    (async () => {
      await axios.put(
        "http://localhost:3001/sondage/auto-finish",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await chargerSondages();
      lockRef.current = false;
    })();
  }, [maintenant, sondages, token, chargerSondages]);

  const tempsRestant = (fin) => {
    const diff = Math.floor((new Date(fin) - maintenant) / 1000);
    if (diff <= 0) return "Terminé";

    const j = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return `${j ? j + "j " : ""}${h ? h + "h " : ""}${m}m ${s}s`;
  };

  const sondagesAvecEtat = useMemo(() => {
    return sondages.map((s) => ({
      ...s,
      isFinished:
        s.Etat === "finished" || new Date(s.end_time) <= maintenant,
    }));
  }, [sondages, maintenant]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow flex gap-6">
        <SideBar selected={categorie} setSelected={setCategorie} />

        <div className="flex-1 px-6">
          <h1 className="text-2xl font-bold mt-6 mb-4">
            Mes sondages votés
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sondagesAvecEtat.map((s) => (
              <PollCard
                key={s.id}
                poll={s}
                remaining={tempsRestant(s.end_time)}
                isFinished={s.isFinished}
                mode={s.isFinished ? "results" : "waiting"}
              />
            ))}
          </div>
        </div>
      </main>

      <ChatBubble />
      <Footer />
    </div>
  );
}
