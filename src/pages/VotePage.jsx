import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Clock, ArrowLeft,Info, CheckCircle, Users, AlertCircle } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [votersCount, setVotersCount] = useState(0);

  /* ================= FETCH POLL ================= */
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/sondage/${id_sondage}`)
      .then((res) => {
        setPoll(res.data);
        // Récupérer le nombre de votants
        setVotersCount(res.data.voters || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id_sondage]);

  /* ================= FETCH OPTIONS ================= */
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/sondage/options/${id_sondage}`)
      .then((res) => setOptions(res.data.options))
      .catch(console.error);
  }, [id_sondage]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!poll) return;

    const updateTimer = () => {
      const diff = Math.floor(
        (new Date(poll.End_time) - new Date()) / 1000
      );

      if (diff <= 0) {
        setRemainingTime("Terminé");
        setIsFinished(true);
        return;
      }

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      setRemainingTime(`${h}h ${m}m ${s}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [poll]);

  /* ================= SUBMIT ================= */
  const submitVote = async () => {
    if (!selectedOption) {
      alert("Veuillez choisir une option avant de voter");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/vote/insert`,
        { id_sondage, id_option: selectedOption },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      alert("✅ Votre vote a été enregistré avec succès !");
      navigate("/polls");
    } catch {
      alert("❌ Erreur lors de l'enregistrement de votre vote");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du sondage...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sondage non trouvé</h2>
            <p className="text-gray-600 mb-6">Le sondage que vous cherchez n'existe pas ou a été supprimé.</p>
            <button
              onClick={() => navigate("/polls")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
            >
              Retour aux sondages
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* En-tête avec bouton retour */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Retour aux sondages</span>
            </button>
          </div>

          {/* Carte principale */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            {/* Titre et info */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {poll.question}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Timer */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  isFinished 
                    ? "bg-gray-100 text-gray-700 border border-gray-300" 
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  <Clock size={16} />
                  <span>{isFinished ? "Terminé" : remainingTime}</span>
                </div>

                {/* Nombre de votants */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200">
                  <Users size={16} />
                  <span>{votersCount} votant{votersCount !== 1 ? 's' : ''}</span>
                </div>

                {/* Catégorie */}
                {poll.categorie && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                    <span className="text-sm font-medium">{poll.categorie}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section des options */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Choisissez votre réponse :
              </h2>
              
              <div className="space-y-3">
                {options.map((opt, index) => (
                  <button
                    key={opt.id_option}
                    disabled={isFinished}
                    onClick={() => setSelectedOption(opt.id_option)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === opt.id_option
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    } ${isFinished ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedOption === opt.id_option
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-gray-800 font-medium text-left">{opt.label}</span>
                    </div>
                    {selectedOption === opt.id_option && (
                      <CheckCircle className="text-blue-600" size={20} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton de vote */}
            <div className="pt-6 border-t border-gray-200">
              {isFinished ? (
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <p className="text-gray-700 font-medium">Ce sondage est terminé</p>
                  <p className="text-gray-600 text-sm mt-1">Les votes ne sont plus acceptés</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    {selectedOption ? (
                      <p className="text-gray-700">
                        <span className="font-medium">Option sélectionnée :</span> {
                          options.find(opt => opt.id_option === selectedOption)?.label
                        }
                      </p>
                    ) : (
                      <p className="text-amber-600 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Sélectionnez une option pour voter
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={submitVote}
                    disabled={!selectedOption || isFinished}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow flex items-center gap-2 min-w-[140px] justify-center"
                  >
                    <CheckCircle size={18} />
                    Voter maintenant
                  </button>
                </div>
              )}
            </div>

            {/* Message d'information */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Votre vote est anonyme.</span> Une fois voté, vous ne pourrez plus modifier votre choix.
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Vous pourrez voir les résultats lorsque le sondage sera terminé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}