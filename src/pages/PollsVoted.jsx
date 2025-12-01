import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/NavBar";
import PollCard from "../components/PollCard";
import Footer from "../components/Footer";

export default function PollsVoted() {
  const [polls, setPolls] = useState([]);
  const token = localStorage.getItem("token");

 useEffect(() => {
  axios.get("http://localhost:3001/sondage/voted", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => {
    console.log("FRONT TOKEN =", token);

    setPolls(res.data);
  })
  .catch(err => console.error("Erreur chargement sondages :", err));
}, []);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Mes Sondages Votés
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              remaining="Finished"
              isFinished={true}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
