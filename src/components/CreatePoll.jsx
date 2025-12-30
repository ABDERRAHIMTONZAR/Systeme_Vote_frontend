import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Clock,
  X,
  Check,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  FileText,
  Tag,
  Hash,
  Sparkles,
} from "lucide-react";

/* ----------------------------
   Modal simple (réutilisable)
---------------------------- */
function Modal({ open, type = "info", title, message, onClose, onConfirm, confirmText = "OK" }) {
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
  ) : (
    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
      <span className="text-2xl">⚠️</span>
    </div>
  );

  const buttonClass = isSuccess
    ? "bg-green-600 hover:bg-green-700"
    : isError
    ? "bg-red-600 hover:bg-red-700"
    : "bg-amber-600 hover:bg-amber-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-[fadeIn_.2s_ease-out]">
        <div className="flex flex-col items-center text-center">
          {icon}
          <h2 className="mt-4 text-xl font-bold text-gray-800">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>

          <div className="mt-6 w-full flex gap-3">
            {onClose && (
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
const toLocalDateTimeInputValue = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
};

export default function CreatePoll() {
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState(["", ""]);
  const [question, setQuestion] = useState("");
  const [categorie, setCategorie] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxOptions = 4;
  const navigate = useNavigate();
  const totalSteps = 4;

  // ✅ Modals
  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "OK",
    onConfirm: null,
    showClose: true,
  });

  const openModal = ({ type, title, message, confirmText = "OK", onConfirm, showClose = true }) => {
    setModal({ open: true, type, title, message, confirmText, onConfirm, showClose });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // useEffect(() => {
  //   const now = new Date();
  //   now.setHours(now.getHours() + 1);
  //   now.setMinutes(0, 0, 0);
  //   setEndDateTime(now.toISOString().slice(0, 16));
  // }, []);
  useEffect(() => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(0, 0, 0);

  setEndDateTime(toLocalDateTimeInputValue(now));
}, []);


  const categories = [
    { value: "tech", label: "Technologie", icon: "💻" },
    { value: "sports", label: "Sports", icon: "⚽" },
    { value: "music", label: "Musique", icon: "🎵" },
    { value: "movies", label: "Films", icon: "🎬" },
    { value: "games", label: "Jeux vidéo", icon: "🎮" },
    { value: "education", label: "Éducation", icon: "📚" },
    { value: "food", label: "Nourriture", icon: "🍕" },
    { value: "other", label: "Autre", icon: "🔮" },
  ];

  const addOption = () => {
    if (options.length < maxOptions) setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
const parseLocalDateTime = (value) => {
  const [date, time] = value.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
};

  const formatDurationFromNow = (futureDateTime) => {
    const now = new Date();
    // const end = new Date(futureDateTime);
    const end = parseLocalDateTime(futureDateTime);
    let diffMs = end - now;
    if (diffMs <= 0) return "terminé";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    diffMs -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    diffMs -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diffMs / (1000 * 60));

    let parts = [];
    if (days > 0) parts.push(`${days} jour${days > 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} heure${hours > 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} min`);
    return parts.join(" ");
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return question.trim().length >= 10 && question.length <= 200;
      case 2:
        return categorie !== "";
      case 3:
        return options.filter((o) => o.trim() !== "").length >= 2;
      case 4:
        return endDateTime !== "" && parseLocalDateTime(endDateTime) > new Date()
;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      openModal({
        type: "warn",
        title: "Étape incomplète",
        message: `Veuillez compléter l'étape ${step} correctement avant de continuer.`,
        confirmText: "OK",
        showClose: false,
        onConfirm: () => closeModal(),
      });
    }
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) {
      openModal({
        type: "warn",
        title: "Formulaire incomplet",
        message: "Veuillez compléter toutes les étapes correctement !",
        confirmText: "OK",
        showClose: false,
        onConfirm: () => closeModal(),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const validOptions = options.filter((o) => o.trim() !== "");
      const payload = { question: question.trim(), categorie, endDateTime, options: validOptions };
      const API = process.env.REACT_APP_API_URL || "http://localhost:3001";

      await axios.post(`${API}/dashboard/create-poll`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      openModal({
        type: "success",
        title: "Sondage créé ✅",
        message: "Votre sondage a été créé avec succès !",
        confirmText: "Aller au dashboard",
        showClose: false,
        onConfirm: () => {
          closeModal();
          navigate("/dashboard");
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Erreur inconnue";

      openModal({
        type: "error",
        title: "Erreur",
        message: `Impossible de créer le sondage : ${msg}`,
        confirmText: "Compris",
        showClose: false,
        onConfirm: () => closeModal(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full -z-10"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>

        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex flex-col items-center relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step >= stepNumber
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : <span className="font-bold">{stepNumber}</span>}
            </div>
            <span className="text-sm mt-2 text-gray-600 font-medium">
              {stepNumber === 1 && "Question"}
              {stepNumber === 2 && "Catégorie"}
              {stepNumber === 3 && "Options"}
              {stepNumber === 4 && "Date"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Modal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        onClose={modal.showClose ? closeModal : null}
        onConfirm={modal.onConfirm}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Créer un nouveau sondage</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Suivez les étapes pour créer votre sondage</p>
          </div>

          <ProgressBar />

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
            {step === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Quelle est votre question ?</h2>
                    <p className="text-gray-600">Formulez une question claire et concise</p>
                  </div>
                </div>

                <textarea
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none"
                  placeholder="Exemple : Quel est votre langage de programmation préféré ?"
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${question.length >= 10 ? "bg-green-500" : "bg-amber-500"}`}></div>
                    <span className="text-sm text-gray-600">Minimum 10 caractères</span>
                  </div>
                  <span className={`text-sm font-medium ${question.length > 200 ? "text-red-500" : "text-gray-500"}`}>
                    {question.length}/200
                  </span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Choisissez une catégorie</h2>
                    <p className="text-gray-600">Cela aide les utilisateurs à trouver votre sondage</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategorie(cat.value)}
                      className={`relative group p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                        categorie === cat.value
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium text-gray-700 text-center">{cat.label}</span>
                      {categorie === cat.value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow">
                    <Hash className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Définissez les options</h2>
                    <p className="text-gray-600">Minimum 2 options, maximum {maxOptions}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-all duration-300 ${
                          opt.trim() ? "bg-blue-500 text-white shadow" : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <input
                        type="text"
                        className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        placeholder={`Option ${index + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(index, e.target.value)}
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {options.length < maxOptions && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Ajouter une option
                  </button>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          options.filter((o) => o.trim() !== "").length >= 2 ? "bg-green-500" : "bg-amber-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-700">
                        {options.filter((o) => o.trim() !== "").length} option(s) valide(s)
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {options.length}/{maxOptions} options
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Date de fin du sondage</h2>
                    <p className="text-gray-600">Le sondage se fermera automatiquement à cette date</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="relative group mb-6">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={22} />

                    <input
                      type="datetime-local"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                     // min={new Date().toISOString().slice(0, 16)}
                     // max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 16)}
                     min={toLocalDateTimeInputValue(new Date())}
  max={toLocalDateTimeInputValue(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  )} 
                     className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 border-gray-200 text-gray-700 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-blue-400 transition-all duration-200 cursor-pointer"
                    />
                  </div>

                  {endDateTime && (
                    <div className="p-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm opacity-80">Clôture du sondage</p>
                        <p className="text-lg font-bold text-white leading-tight">
                          {parseLocalDateTime(endDateTime).toLocaleString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
})}
                        </p>

                        <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 bg-white/20 rounded-full text-xs font-semibold text-white">
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          ⏱️ {formatDurationFromNow(endDateTime)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-300"
                >
                  <ChevronLeft size={20} />
                  Précédent
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-300"
                >
                  Annuler
                </button>
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Suivant
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-white ${
                    isSubmitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Check size={20} /> Créer le sondage
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500">
                Étape {step} sur {totalSteps}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
