import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import SideBar from "../components/SideBar";

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [now, setNow] = useState(new Date());
  const [category, setCategory] = useState("All");
  const token = localStorage.getItem("token");

  const fetchPolls = useCallback(async () => {
    try {
      const url =
        category === "All"
          ? "http://localhost:3001/sondage/unvoted"
          : `http://localhost:3001/sondage/unvoted?categorie=${encodeURIComponent(
              category
            )}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ⚠️ Filtrer côté front (tu peux aussi le faire côté SQL si tu veux)
      const filtered = res.data.filter((poll) => {
        const end = new Date(poll.end_time);
        return poll.Etat !== "finished" && end > new Date(); // ✅ utilise new Date() pas "now"
      });

      setPolls(filtered);
    } catch (err) {
      console.error("Erreur chargement sondages :", err);
    }
  }, [category, token]);

  // ✅ Charger quand la catégorie change
  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  // ✅ Timer pour l'affichage du remaining time فقط
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Auto-finish: ne dépend pas de now (sinon interval reset كل ثانية)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await axios.put(
          "http://localhost:3001/sondage/auto-finish",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchPolls(); // refresh بعد ما كيتبدل Etat
      } catch (err) {
        console.error("Erreur auto-finish :", err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [token, fetchPolls]);

  const RemainingTime = (endTime) => {
    const end = new Date(endTime);
    const diff = Math.floor((end - now) / 1000);

    if (diff <= 0) return "Finished";

    const days = Math.floor(diff / (24 * 3600));
    let remainder = diff % (24 * 3600);

    const hours = Math.floor(remainder / 3600);
    remainder %= 3600;

    const minutes = Math.floor(remainder / 60);
    const seconds = remainder % 60;

    let timeString = "";
    if (days > 0) timeString += `${days}d `;
    if (hours > 0 || days > 0) timeString += `${hours}h `;
    timeString += `${minutes}m ${seconds}s`;

    return timeString;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow w-full flex gap-6">
        <SideBar selected={category} setSelected={setCategory} />

        <div className="flex-1 px-6">
          <div className="ml-10 md:ml-0">
            <h1 className="text-2xl font-bold mt-6 mb-4">
              Les sondages en cours
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => {
              const remaining = RemainingTime(poll.end_time);
              const isFinished =
                remaining === "Finished" || poll.Etat === "finished";

              return (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  remaining={remaining}
                  isFinished={isFinished}
                  mode="vote"
                />
              );
            })}
          </div>
        </div>
      </main>

      <ChatBubble />
      <Footer />
    </div>
  );
}
