import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import SideBar from "../components/SideBar";

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const token = localStorage.getItem("token");
  const [now, setNow] = useState(new Date());
  const [category, setCategory] = useState("All");

  // Charger les sondages selon catégorie
  const fetchPolls = async () => {
    try {
      const url =
        category === "All"
          ? "http://localhost:3001/sondage/unvoted"
          : `http://localhost:3001/sondage/unvoted?categorie=${category}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPolls(res.data.filter(poll=>poll.Etat!="finished"));
    } catch (err) {
      console.error("Erreur chargement sondages :", err);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [category]);
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      await axios.put(
        "http://localhost:3001/sondage/auto-finish",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Recharger les sondages votés
      const url =
        category === "All"
          ? "http://localhost:3001/sondage/unvoted"
          : `http://localhost:3001/sondage/unvoted?categorie=${category}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPolls(res.data);
    } catch (err) {
      console.error("Erreur auto-finish votés :", err);
    }
  }, 60000);

  return () => clearInterval(interval);
}, [category]);
  // Timer pour le RemainingTime
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
            <h1 className="text-2xl font-bold mt-6 mb-4">Les sondages en cours</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => {
              const remaining = RemainingTime(poll.end_time);
              const isFinished = remaining === "Finished" || poll.Etat === "finished";

              return (
                <PollCard
                  key={poll.Id_Sondage}
                  poll={poll}
                  remaining={remaining}
                  isFinished={isFinished}
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
