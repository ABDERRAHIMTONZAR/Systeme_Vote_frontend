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
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const url =
          category === "All"
            ? "http://localhost:3001/sondage/unvoted"
            : `http://localhost:3001/sondage/unvoted?categorie=${category}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPolls(res.data);
      } catch (err) {
        console.error("Erreur chargement sondages :", err);
      }
    };

    fetchPolls();
  }, [category]);


  // Le reste de ton code inchangé : timer + RemainingTime
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

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex gap-6">

        {/* SIDEBAR */}
        <SideBar selected={category} setSelected={setCategory} />

        {/* CONTENU */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => {
            const remaining = RemainingTime(poll.end_time);
            const isFinished =
              remaining === "Finished" || poll.Etat === "finished";

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
      </main>

      <ChatBubble />
      <Footer />
    </div>
  );
}
