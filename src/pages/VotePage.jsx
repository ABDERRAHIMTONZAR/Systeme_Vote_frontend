import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Clock, ArrowLeft, CheckCircle } from "lucide-react";

import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

export default function VotePage() {
  const { id_sondage } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [remainingTime, setRemainingTime] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  /* ================= FETCH POLL ================= */
  useEffect(() => {
    axios
      .get(`http://localhost:3001/sondage/${id_sondage}`)
      .then((res) => setPoll(res.data))
      .catch(console.error);
  }, [id_sondage]);

  /* ================= FETCH OPTIONS ================= */
  useEffect(() => {
    axios
      .get(`http://localhost:3001/sondage/options/${id_sondage}`)
      .then((res) => setOptions(res.data.options))
      .catch(console.error);
  }, [id_sondage]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!poll) return;

    const interval = setInterval(() => {
      const diff = Math.floor(
        (new Date(poll.End_time) - new Date()) / 1000
      );

      if (diff <= 0) {
        setRemainingTime("Expired");
        setIsFinished(true);
        return;
      }

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      setRemainingTime(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [poll]);

  /* ================= SUBMIT ================= */
  const submitVote = async () => {
    if (!selectedOption) return alert("Choisissez une option");

    try {
      await axios.post(
        "http://localhost:3001/vote/insert",
        { id_sondage, id_option: selectedOption },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      navigate("/polls");
    } catch {
      alert("Erreur lors du vote");
    }
  };

  if (!poll) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-blue-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4   flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft size={20} /> Retour
          </button><br />

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {poll.question}
          </h1>

          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
            ${isFinished ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}
          >
            <Clock size={14} />
            {remainingTime}
          </div>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {options.map((opt) => (
              <button
                key={opt.id_option}
                disabled={isFinished}
                onClick={() => setSelectedOption(opt.id_option)}
                className={`w-full flex items-center justify-between px-5 py-3 rounded-xl border transition
                  ${selectedOption === opt.id_option
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400"}
                  ${isFinished && "opacity-50 cursor-not-allowed"}
                `}
              >
                <span className="text-gray-800">{opt.label}</span>
                {selectedOption === opt.id_option && (
                  <CheckCircle className="text-blue-600" size={18} />
                )}
              </button>
            ))}
          </div>

        <div className="mt-8 flex justify-center">
          <button
            disabled={isFinished}
            onClick={submitVote}
            className="
              w-full max-w-xs
              py-3
              rounded-xl
              bg-gradient-to-r from-blue-500 to-blue-700
              text-white
              font-semibold
              shadow-lg
              hover:opacity-90
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            Voter
          </button>
        </div>    
          </div>
      </main>

      <Footer />
    </div>
  );
}
