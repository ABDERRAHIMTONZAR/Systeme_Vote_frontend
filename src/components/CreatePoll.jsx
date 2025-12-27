import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, X, Check, Calendar } from "lucide-react";

export default function CreatePoll() {
  const [options, setOptions] = useState(["", ""]);
  const [question, setQuestion] = useState("");
  const [categorie, setCategorie] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const maxOptions = 4;
  const navigate = useNavigate();

  // Définir la date de fin par défaut (1h après maintenant)
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);
    setEndDateTime(now.toISOString().slice(0,16));
  }, []);

  const categories = [
    { value: "", label: "Sélectionner une catégorie...", icon: "📋" },
    { value: "tech", label: "Technologie", icon: "💻" },
    { value: "sports", label: "Sports", icon: "⚽" },
    { value: "music", label: "Musique", icon: "🎵" },
    { value: "movies", label: "Films", icon: "🎬" },
    { value: "games", label: "Jeux vidéo", icon: "🎮" },
    { value: "education", label: "Éducation", icon: "📚" },
    { value: "food", label: "Nourriture", icon: "🍕" },
    { value: "other", label: "Autre", icon: "🔮" }
  ];

  // Options
  const addOption = () => { if (options.length < maxOptions) setOptions([...options,""]); };
  const removeOption = (index) => { if (options.length>2) setOptions(options.filter((_,i)=>i!==index)); };
  const updateOption = (index,value) => { const newOptions=[...options]; newOptions[index]=value; setOptions(newOptions); };

  // Formatage durée restante
  const formatDurationFromNow = (futureDateTime) => {
    const now = new Date();
    const end = new Date(futureDateTime);
    let diffMs = end - now;
    if(diffMs<=0) return "terminé";

    const days = Math.floor(diffMs/(1000*60*60*24));
    diffMs -= days*(1000*60*60*24);
    const hours = Math.floor(diffMs/(1000*60*60));
    diffMs -= hours*(1000*60*60);
    const minutes = Math.floor(diffMs/(1000*60));

    let parts=[];
    if(days>0) parts.push(`${days} jour${days>1?'s':''}`);
    if(hours>0) parts.push(`${hours} heure${hours>1?'s':''}`);
    if(minutes>0) parts.push(`${minutes} min`);
    return parts.join(' ');
  };

  const handleSubmit = async () => {
    if(!question.trim()){ alert("Veuillez saisir une question !"); return; }
    const validOptions = options.filter(o=>o.trim()!=="");
    if(validOptions.length<2){ alert("Veuillez saisir au moins 2 options valides !"); return; }
    if(!categorie){ alert("Veuillez sélectionner une catégorie !"); return; }
    if(!endDateTime){ alert("Veuillez sélectionner une date de fin !"); return; }

    setIsSubmitting(true);
    try{
      const token = localStorage.getItem("token");
      const payload = { question: question.trim(), categorie, endDateTime, options: validOptions };
      await axios.post(`${process.env.REACT_APP_API_URL}/dashboard/create-poll`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      alert("✅ Sondage créé avec succès !");
      navigate("/dashboard");
    }catch(err){
      console.error(err);
      alert(`❌ Erreur lors de la création du sondage : ${err.response?.data?.message || err.message}`);
    }finally{ setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-3xl mx-auto border border-gray-100">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Créer un nouveau sondage</h1>
          <p className="text-gray-600">Partagez votre question et découvrez les opinions de la communauté</p>
        </div>

        {/* Question */}
        <div className="mb-8">
          <label className="font-semibold text-lg text-gray-800 mb-2 block">Question du sondage</label>
          <textarea
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
            placeholder="Exemple : Quel est votre langage de programmation préféré ?"
            rows={3}
            value={question}
            onChange={e=>setQuestion(e.target.value)}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">Soyez clair et concis</span>
            <span className={`text-sm ${question.length>200?'text-red-500':'text-gray-500'}`}>{question.length}/200</span>
          </div>
        </div>

        {/* Catégorie */}
        <div className="mb-8">
          <label className="font-semibold text-lg text-gray-800 mb-2 block">Catégorie</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.filter(c=>c.value).map(cat=>(
              <button
                key={cat.value}
                type="button"
                onClick={()=>setCategorie(cat.value)}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                  categorie===cat.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-medium text-gray-700">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="font-semibold text-lg text-gray-800">Options de réponse</label>
            <span className="text-sm text-gray-500">{options.length}/{maxOptions}</span>
          </div>
          <div className="space-y-3">
            {options.map((opt,index)=>(
              <div key={index} className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-semibold">{index+1}</div>
                <input
                  type="text"
                  className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  placeholder={`Option ${index+1}`}
                  value={opt}
                  onChange={e=>updateOption(index,e.target.value)}
                />
                {options.length>2 && (
                  <button type="button" onClick={()=>removeOption(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition">
                    <X size={20}/>
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length<maxOptions && (
            <button type="button" onClick={addOption} className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition flex items-center justify-center gap-2">
              <Plus size={20}/> Ajouter une option
            </button>
          )}
        </div>

{/* Calendrier & Heure */}
<div className="mb-12">
  <label className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
    <Clock size={22} className="text-blue-600" />
    Date & heure de fin
  </label>

  <div className="relative bg-gradient-to-br from-white to-blue-50 
                  p-6 rounded-2xl shadow-lg border border-blue-100">

    {/* INPUT CONTAINER */}
    <div className="relative group">
      {/* Icon */}
      <Calendar
        size={22}
        className="absolute left-4 top-1/2 -translate-y-1/2 
                   text-blue-500 group-hover:text-blue-600 transition"
      />

      <input
        type="datetime-local"
        value={endDateTime}
        onChange={(e) => setEndDateTime(e.target.value)}
        min={new Date().toISOString().slice(0, 16)}
        max={new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ).toISOString().slice(0, 16)}
        className="
          w-full pl-12 pr-4 py-4
          rounded-xl border-2 border-blue-200
          bg-white text-gray-700 font-semibold
          focus:outline-none focus:border-blue-500 
          focus:ring-4 focus:ring-blue-200
          hover:border-blue-400
          transition-all duration-200
          cursor-pointer
        "
      />
    </div>

    {/* HELP TEXT */}
    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
      Choisissez quand le sondage se fermera automatiquement
    </div>

    {/* RECAP PREMIUM */}
    {endDateTime && (
      <div className="mt-6 p-5 rounded-2xl 
                      bg-gradient-to-r from-blue-600 to-indigo-600 
                      text-white shadow-xl flex items-center gap-5
                      animate-fade-in">

        {/* ICON */}
        <div className="w-14 h-14 rounded-full bg-white/20 
                        flex items-center justify-center">
          <Clock size={28} />
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          <p className="text-sm opacity-80">Clôture du sondage</p>

          <p className="text-lg font-bold leading-tight">
            {new Date(endDateTime).toLocaleString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <span className="inline-block mt-2 px-4 py-1 
                           text-xs font-semibold rounded-full
                           bg-white/20 backdrop-blur">
            ⏱️ {formatDurationFromNow(endDateTime)}
          </span>
        </div>
      </div>
    )}
  </div>
</div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button type="button" onClick={()=>navigate("/dashboard")} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition">Annuler</button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${isSubmitting?'bg-blue-400 cursor-not-allowed':'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
            {isSubmitting ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Création en cours...</>) :
            (<><Check size={20}/> Créer le sondage</>)}
          </button>
        </div>

      </div>
    </div>
  );
}
