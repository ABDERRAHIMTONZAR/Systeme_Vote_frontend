import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PollsPage() {
  const [polls, setPolls] = useState([
    {
      id: 1,
      question: "Who is your favorite teacher?",
      end_time: new Date(Date.now() + 60000).toISOString(), // se termine dans 1 min
      status: "active",
      voters: 0
    },
    {
      id: 2,
      question: "Who is your favorite teacher?",
      end_time: new Date(Date.now() + 100000).toISOString(), // se termine dans 1 min
      status: "active",
      voters: 0
    },
    {
      id: 3,
      question: "Who is your favorite teacher?",
      end_time: new Date(Date.now() + 60000).toISOString(), // se termine dans 1 min
      status: "active",
      voters: 0
    },
    {
      id: 4,
      question: "Who is your favorite teacher?",
      end_time: new Date(Date.now() + 60000).toISOString(), // se termine dans 1 min
      status: "active",
      voters: 0
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());
  const navigate=useNavigate()
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  //Recuperer le nombre des votes d'un sondage
  const VotersCount = async (pollId)=>{
    try {
      const response = await axios.get(`http://localhost:3000/api/polls/${pollId}/voters`);
      return response.data.votersCount;
    } catch (err) {
      console.error("Erreur récupération des voteurs:", err.message);
      return 0;
    }
  };

  //Mettre à jour le nombre des voteurs d'un sondage en temps réel
  useEffect(() => {
    const updateVotersCounts = async () => {
      const updatedPolls = await Promise.all(
        polls.map(async (poll) => {
          const votersCount = await VotersCount(poll.id);
          return { ...poll, voters: votersCount };
        })
      );
      setPolls(updatedPolls);
    };
    // Mettre à jour toutes 5 secondes
    const votersInterval = setInterval(updateVotersCounts, 5000);
    updateVotersCounts();

    return () => clearInterval(votersInterval);
  }, [polls.length]);

  //Caculer la durée restante d'un sondage
  const RemainingTime = (endTime) => {
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return "Finished";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
//adding s or not
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${seconds > 1 ? 's' : ''}`;
    }
  };

  //Metre a jour l'etat de sondage dans la base données
  const updatePollToFinished = async (pollId) => {
    try {
      await axios.put(`http://localhost:3000/api/polls/${pollId}`, {
        state: "finished",
      });
    } catch (err) {
      console.error("Erreur finished:", err.message);
    }
  };

  //Récupérer les sondages actives
useEffect(() => {
  const fetchPolls = async () => {
    try {
      setLoading(true);

      // 2. Appel API authentifié
      const response = await axios.get("http://localhost:3001/users/unvoted", {
        headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
      });

      // 3. Ajouter les counts
      const polls = await Promise.all(
        response.data.map(async (poll) => {
          const votersCount = await VotersCount(poll.id);
          return { ...poll, voters: votersCount };
        })
      );

      setPolls(polls);
    } catch (err) {
      setError("Erreur lors du chargement des sondages");
      console.error("Erreur api:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchPolls();
}, []);


  //Vérifier en temps réel si un sondage devient finished
  useEffect(() => {
    polls.forEach((poll) => {
      const end = new Date(poll.end_time);
      if (end <= now && poll.state !== "finished") {
        updatePollToFinished(poll.id);
        setPolls((prev) =>
          prev.map((p) =>
            p.id === poll.id ? { ...p, state: "finished" } : p
          )
        );
      }
    });
  }, [now, polls]);

  if (loading) {
    return (
      <div className="text-center text-xl font-semibold py-10">
        Loading polls...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold py-10">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600">Votify</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a
                  href="#"
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Active Polls
                </a>
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Finished Polls
                </a>
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  About Us
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                <img src=""/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Active Polls</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => {
            const remaining = RemainingTime(poll.end_time);
            const isFinished = remaining === "Finished" || poll.state === "finished";

            return (
              <div
                key={poll.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      isFinished
                        ? "bg-gray-100 text-gray-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {isFinished ? "Finished" : "Active"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {isFinished ? "Expired" : `${remaining} left`}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {poll.question}
                </h2>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-5">👥</span>
                    <span className="ml-2">{poll.voters} voters</span>
                    <span className="ml-2 text-xs text-green-600 animate-pulse">
                      {poll.voters > 0 ? "Live" : ""}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => isFinished ? null : navigate('/')}
                  className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors duration-200 ${
                    isFinished
                      ? "bg-gray-600 hover:bg-gray-700 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isFinished ? "View Results" : "Vote Now"}
                </button>
              </div>
            );
          })}
        </div>

        <footer className="text-center text-gray-500 text-sm mt-12 pt-8 border-t border-gray-200">
          <p>© 2023 Verify. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}