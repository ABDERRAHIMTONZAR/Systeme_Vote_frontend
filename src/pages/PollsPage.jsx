import React, { useEffect, useState, useCallback, useRef } from "react";
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

  const token = localStorage.getItem("token");
  const lockRef = useRef(false);

  const chargerSondages = useCallback(async () => {
    const url =
      categorie === "All"
        ? `${process.env.REACT_APP_API_URL}/sondage/unvoted`
        : `${process.env.REACT_APP_API_URL}/sondage/unvoted?categorie=${encodeURIComponent(
            categorie
          )}`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const filtres = res.data.filter((s) => {
      const fin = new Date(s.end_time);
      return s.Etat !== "finished" && fin > new Date();
    });

    setSondages(filtres);
  }, [categorie, token]);

  useEffect(() => {
    chargerSondages();
  }, [chargerSondages]);

  useEffect(() => {
    const timer = setInterval(() => setMaintenant(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return;

    const onChanged = async () => {
      if (lockRef.current) return;
      lockRef.current = true;
      try {
        await chargerSondages();
      } finally {
        lockRef.current = false;
      }
    };

    socket.on("polls:changed", onChanged);

    return () => {
      socket.off("polls:changed", onChanged);
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
          <div className="ml-10 md:ml-0">
       <h1 className="text-2xl font-bold mt-6 mb-4 ">
            Les sondages en cours
          </h1>
          </div>
   


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
        </div>
      </main>

      <ChatBubble />
      <Footer />
    </div>
  );
}
