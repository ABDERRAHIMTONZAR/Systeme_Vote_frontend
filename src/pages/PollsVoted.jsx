import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { socket } from "../socket";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import SideBar from "../components/SideBar";

export default function PollsVoted() {
  const [polls, setPolls] = useState([]);
  const token = localStorage.getItem("token");
  const [category, setCategory] = useState("All");
  const [now, setNow] = useState(new Date());

  const fetchPolls = useCallback(async () => {
    try {
      const url =
        category === "All"
          ? "http://localhost:3001/sondage/voted"
          : `http://localhost:3001/sondage/voted?categorie=${encodeURIComponent(
              category
            )}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPolls(res.data);
    } catch (err) {
      console.error("Erreur chargement sondages votés :", err);
    }
  }, [category, token]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  useEffect(() => {
    const onChanged = () => fetchPolls();

    socket.on("polls:changed", onChanged);

    return () => {
      socket.off("polls:changed", onChanged);
    };
  }, [fetchPolls]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const RemainingTime = (endTime) => {
    const end = new Date(endTime);
    const diff = Math.floor((end - now) / 1000);

    if (diff <= 0) return "Finished";

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    let timeString = "";
    if (days > 0) timeString += `${days}d `;
    if (hours > 0 || days > 0) timeString += `${hours}h `;
    timeString += `${minutes}m ${seconds}s`;

    return timeString;
  };

  const pollsAvecEtat = useMemo(() => {
    return polls.map((poll) => {
      const end = new Date(poll.end_time);
      return {
        ...poll,
        isFinished: poll.Etat === "finished" || end <= now,
      };
    });
  }, [polls, now]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow w-full flex gap-6">
        <SideBar selected={category} setSelected={setCategory} />

        <div className="flex-1 px-6">
          <div className="ml-10 md:ml-0">
            <h1 className="text-2xl font-bold mt-6 mb-4">
              Mes sondages votés
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pollsAvecEtat.map((poll) => {
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
        </div>
      </main>

      <ChatBubble />
      <Footer />
    </div>
  );
}
