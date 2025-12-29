import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Clock, ArrowLeft, Info, CheckCircle, Users, AlertCircle, X } from "lucide-react";

import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

/* ----------------------------
   Modal (success/error/warn/info)
---------------------------- */
function Modal({
  open,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  showClose = true,
}) {
  if (!open) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isWarn = type === "warn";

  const icon = isSuccess ? (
    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
      <CheckCircle className="w-7 h-7 text-green-600" />
    </div>
  ) : isError ? (
    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
      <X className="w-7 h-7 text-red-600" />
    </div>
  ) : isWarn ? (
    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
      <span className="text-2xl">⚠️</span>
    </div>
  ) : (
    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
      <span className="text-2xl">ℹ️</span>
    </div>
  );

  const buttonClass = isSuccess
    ? "bg-green-600 hover:bg-green-700"
    : isError
    ? "bg-red-600 hover:bg-red-700"
    : isWarn
    ? "bg-amber-600 hover:bg-amber-700"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-[fadeIn_.2s_ease-out]">
        <div className="flex flex-col items-center text-center">
          {icon}
          <h2 className="mt-4 text-xl font-bold text-gray-800">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>

          <div className="mt-6 w-full flex gap-3">
            {showClose && onClose && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition"
              >
                Fermer
              </button>
            )}

            <button
              onClick={onConfirm || onClose}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${buttonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

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
  const [submitting, setSubmitting] = useState(false);

  // ✅ Modal state
  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "OK",
    showClose: true,
    onConfirm: null,
  });

  const openModal = ({ type, title, message, confirmText = "OK", showClose = true, onConfirm }) => {
    setModal({ open: true, type, title, message, confirmText, showClose, onConfirm });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const API = process.env.REACT_APP_API_URL || "http://localhost:3001";

  /* ================= FETCH POLL ================= */
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API}/sondage/${id_sondage}`)
      .then((res) => {
        setPoll(res.data);
        setVotersCount(res.data.voters || 0);
      })
      .catch((err) => {
        console.error(err);
        setPoll(null);
      })
      .finally(() => setLoading(false));
  }, [id_sondage]);

  /* ================= FETCH OPTIONS ================= */
  useEffect(() => {
    axios
      .get(`${API}/sondage/options/${id_sondage}`)
      .then((res) => setOptions(res.data.options || []))
      .catch(console.error);
  }, [id_sondage]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!poll) return;

    const updateTimer = () => {
      const diff = Math.floor((new Date(poll.End_time) - new Date()) / 1000);

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
      openModal({
        type: "warn",
        title: "Choix requis",
        message: "Veuillez choisir une option avant de voter.",
        confirmText: "D'accord",
        showClose: false,
        onConfirm: closeModal,
      });
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${API}/vote/insert`,
        { id_sondage, id_option: selectedOption },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      openModal({
        type: "success",
        title: "Vote enregistré ✅",
        message: "Votre vote a été enregistré avec succès !",
        confirmText: "OK",
        showClose: false,
        onConfirm: () => {
          closeModal();
          navigate("/polls");
        },
      });
    } catch (err) {
      console.error(err);
      openModal({
        type: "error",
        title: "Erreur",
        message: err?.response?.data?.message || "Erreur lors de l'enregistrement de votre vote.",
        confirmText: "OK",
        showClose: false,
        onConfirm: closeModal,
      });
    } finally {
      setSubmitting(false);
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

      {/* ✅ Global Modal */}
      <Modal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        showClose={modal.showClose}
        onClose={closeModal}
        onConfirm={modal.onConfirm || closeModal}
      />

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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{poll.question}</h1>

              <div className="flex flex-wrap items-center gap-4">
                {/* Timer */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    isFinished
                      ? "bg-gray-100 text-gray-700 border border-gray-300"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  <Clock size={16} />
                  <span>{isFinished ? "Terminé" : remainingTime}</span>
                </div>

                {/* Nombre de votants */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200">
                  <Users size={16} />
                  <span>
                    {votersCount} votant{votersCount !== 1 ? "s" : ""}
                  </span>
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
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Choisissez votre réponse :</h2>

              <div className="space-y-3">
                {options.map((opt, index) => (
                  <button
                    key={opt.id_option}
                    disabled={isFinished || submitting}
                    onClick={() => setSelectedOption(opt.id_option)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === opt.id_option
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    } ${isFinished || submitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedOption === opt.id_option ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-gray-800 font-medium text-left">{opt.label}</span>
                    </div>

                    {selectedOption === opt.id_option && <CheckCircle className="text-blue-600" size={20} />}
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
                        <span className="font-medium">Option sélectionnée :</span>{" "}
                        {options.find((opt) => opt.id_option === selectedOption)?.label}
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
                    disabled={!selectedOption || isFinished || submitting}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow flex items-center gap-2 min-w-[160px] justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Voter maintenant
                      </>
                    )}
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
                    <span className="font-medium">Votre vote est anonyme.</span> Une fois voté, vous ne pourrez plus
                    modifier votre choix.
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
