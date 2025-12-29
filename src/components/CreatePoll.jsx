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
  Sparkles
} from "lucide-react";

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

  // Définir la date de fin par défaut (1h après maintenant)
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);
    setEndDateTime(now.toISOString().slice(0,16));
  }, []);

  const categories = [
    { value: "tech", label: "Technologie", icon: "💻", color: "bg-blue-100 text-blue-700" },
    { value: "sports", label: "Sports", icon: "⚽", color: "bg-green-100 text-green-700" },
    { value: "music", label: "Musique", icon: "🎵", color: "bg-purple-100 text-purple-700" },
    { value: "movies", label: "Films", icon: "🎬", color: "bg-red-100 text-red-700" },
    { value: "games", label: "Jeux vidéo", icon: "🎮", color: "bg-violet-100 text-violet-700" },
    { value: "education", label: "Éducation", icon: "📚", color: "bg-amber-100 text-amber-700" },
    { value: "food", label: "Nourriture", icon: "🍕", color: "bg-rose-100 text-rose-700" },
    { value: "other", label: "Autre", icon: "🔮", color: "bg-gray-100 text-gray-700" }
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

  // Validation des étapes
  const validateStep = () => {
    switch(step) {
      case 1:
        return question.trim().length >= 10 && question.length <= 200;
      case 2:
        return categorie !== "";
      case 3:
        return options.filter(o => o.trim() !== "").length >= 2;
      case 4:
        return endDateTime !== "" && new Date(endDateTime) > new Date();
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      alert(`Veuillez compléter l'étape ${step} correctement avant de continuer.`);
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if(!validateStep()) {
      alert("Veuillez compléter toutes les étapes correctement !");
      return;
    }

    setIsSubmitting(true);
    try{
      const token = localStorage.getItem("token");
      const validOptions = options.filter(o=>o.trim()!=="");
      const payload = { question: question.trim(), categorie, endDateTime, options: validOptions };
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/dashboard/create-poll`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      alert("✅ Sondage créé avec succès !");
      navigate("/dashboard");
    }catch(err){
      console.error(err);
      alert(`❌ Erreur lors de la création du sondage : ${err.response?.data?.message || err.message}`);
    }finally{ setIsSubmitting(false); }
  };

  // Barre de progression
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 relative">
        {/* Ligne de fond */}
        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 rounded-full -z-10"></div>
        
        {/* Ligne active */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
        
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex flex-col items-center relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                          transition-all duration-300 ${step >= stepNumber 
                            ? 'bg-blue-600 text-white shadow' 
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                          }`}>
              {step > stepNumber ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="font-bold">
                  {stepNumber}
                </span>
              )}
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
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {step === 1 && "Étape 1 : La question"}
          {step === 2 && "Étape 2 : La catégorie"}
          {step === 3 && "Étape 3 : Les options"}
          {step === 4 && "Étape 4 : La date de fin"}
        </h3>
        <p className="text-gray-600 text-sm">
          {step === 1 && "Commencez par formuler votre question de sondage"}
          {step === 2 && "Choisissez une catégorie pertinente pour votre sondage"}
          {step === 3 && "Définissez les choix de réponse possibles"}
          {step === 4 && "Définissez quand votre sondage se terminera"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Créer un nouveau sondage</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Suivez les étapes pour créer votre sondage
          </p>
        </div>

        {/* Barre de progression */}
        <ProgressBar />

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
          
          {/* Étape 1 : Question */}
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
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none"
                placeholder="Exemple : Quel est votre langage de programmation préféré ?"
                rows={4}
                value={question}
                onChange={e=>setQuestion(e.target.value)}
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${question.length >= 10 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    Minimum 10 caractères
                  </span>
                </div>
                <span className={`text-sm font-medium ${question.length>200?'text-red-500':'text-gray-500'}`}>
                  {question.length}/200
                </span>
              </div>
            </div>
          )}

          {/* Étape 2 : Catégorie */}
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
                {categories.map(cat=>(
                  <button
                    key={cat.value}
                    type="button"
                    onClick={()=>setCategorie(cat.value)}
                    className={`group p-4 rounded-xl border-2 transition-all duration-300 
                             flex flex-col items-center justify-center gap-2 ${
                      categorie===cat.value 
                        ? `border-blue-500 bg-blue-50 shadow-sm` 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="font-medium text-gray-700 text-center">
                      {cat.label}
                    </span>
                    {categorie===cat.value && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Étape 3 : Options */}
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
                {options.map((opt,index)=>(
                  <div key={index} className="flex items-center gap-3 group">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center 
                                  font-semibold transition-all duration-300 ${
                      opt.trim() 
                        ? 'bg-blue-500 text-white shadow' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      <span>
                        {index+1}
                      </span>
                    </div>
                    
                    <input
                      type="text"
                      className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 
                               focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder={`Option ${index+1}`}
                      value={opt}
                      onChange={e=>updateOption(index,e.target.value)}
                    />
                    
                    {options.length>2 && (
                      <button 
                        type="button" 
                        onClick={()=>removeOption(index)}
                        className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 
                                 rounded-xl transition-all duration-300"
                      >
                        <X size={20}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {options.length<maxOptions && (
                <button 
                  type="button" 
                  onClick={addOption}
                  className="w-full py-3 border-2 border-dashed border-gray-300 
                           text-gray-600 hover:text-blue-600 hover:border-blue-400 
                           hover:bg-blue-50 rounded-xl transition-all duration-300 
                           flex items-center justify-center gap-2"
                >
                  <Plus size={20}/> Ajouter une option
                </button>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${options.filter(o => o.trim() !== "").length >= 2 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <span className="text-sm text-gray-700">
                      {options.filter(o => o.trim() !== "").length} option(s) valide(s)
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {options.length}/{maxOptions} options
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4 : Date */}
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
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 
                              text-blue-500 group-hover:text-blue-600 transition-all" 
                    size={22}
                  />

                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    max={new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    ).toISOString().slice(0, 16)}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 
                             border-gray-200 text-gray-700 font-semibold focus:outline-none 
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                             hover:border-blue-400 transition-all duration-200 cursor-pointer"
                  />
                </div>

                {/* Recap */}
                {endDateTime && (
                  <div className="p-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 
                                text-white shadow flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm opacity-80">Clôture du sondage</p>
                      <p className="text-lg font-bold text-white leading-tight">
                        {new Date(endDateTime).toLocaleString("fr-FR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      
                      <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 
                                    bg-white/20 rounded-full text-xs font-semibold text-white">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        ⏱️ {formatDurationFromNow(endDateTime)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 
                         text-gray-700 hover:bg-gray-50 rounded-xl font-semibold 
                         transition-all duration-300"
              >
                <ChevronLeft size={20} />
                Précédent
              </button>
            ) : (
              <button 
                type="button" 
                onClick={()=>navigate("/dashboard")}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 
                         hover:bg-gray-50 rounded-xl font-semibold 
                         transition-all duration-300"
              >
                Annuler
              </button>
            )}
            
            {step < totalSteps ? (
              <button 
                type="button" 
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl 
                         font-semibold transition-all duration-300"
              >
                Suivant
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold 
                         transition-all duration-300 ${isSubmitting 
                           ? 'bg-blue-400 cursor-not-allowed' 
                           : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                         }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Check size={20}/> Créer le sondage
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Indicateur d'étape */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">
              Étape {step} sur {totalSteps}
            </span>
          </div>
        </div>
        
        {/* Résumé rapide */}
        {step > 1 && (
          <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Résumé de votre sondage :</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Question</p>
                <p className="text-gray-800 font-medium truncate">{question || "Non définie"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Catégorie</p>
                <p className="text-gray-800 font-medium">
                  {categorie ? categories.find(c => c.value === categorie)?.label : "Non définie"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Options</p>
                <p className="text-gray-800 font-medium">
                  {options.filter(o => o.trim() !== "").length} définies
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}