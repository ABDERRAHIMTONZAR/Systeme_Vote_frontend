import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const token = localStorage.getItem("token");
  const [now, setNow] = useState(new Date());

 useEffect(() => {
  const interval = setInterval(async () => {
    try {
      await axios.put("http://localhost:3001/sondage/auto-finish");
      const res = await axios.get("http://localhost:3001/sondage/unvoted", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolls(res.data);
    } catch (err) {
      console.error("Auto refresh error :", err);
    }
  }, 30000); 
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get("http://localhost:3001/sondage/unvoted", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPolls(res.data);
      } catch (err) {
        console.error("Erreur chargement sondages :", err);
      }
    };

    fetchPolls();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

   const RemainingTime = (endTime) => {
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "Finished";

    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${minutes} minute${minutes > 1 ? "s" : ""}, ${seconds} second${
      seconds > 1 ? "s" : ""
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Active Polls</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
