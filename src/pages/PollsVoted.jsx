import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import SideBar from "../components/SideBar";

export default function PollsVoted() {
  const [polls, setPolls] = useState([]);
  const token = localStorage.getItem("token");
  const [category, setCategory] = useState("All");

  // Charger les sondages votés selon catégorie
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const url =
          category === "All"
            ? "http://localhost:3001/sondage/voted"
            : `http://localhost:3001/sondage/voted?categorie=${category}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPolls(res.data);
      } catch (err) {
        console.error("Erreur chargement sondages votés :", err);
      }
    };

    fetchPolls();
  }, [category]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 w-full flex gap-6">

        {/* SIDEBAR FILTRE CATEGORIES */}
        <SideBar selected={category} setSelected={setCategory} />

        {/* CONTENT */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-6">
            Mes Sondages Votés
          </h1>

          {/* Grid des sondages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <PollCard
                key={poll.Id_Sondage}
                poll={poll}
                remaining="Finished"
                isFinished={true}
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
