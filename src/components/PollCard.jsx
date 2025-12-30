// PollCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken";
import { Clock, Users, Tag, Lock, Award, ChevronRight, Zap } from "lucide-react";
import { socket } from "../socket";

export default function PollCard({ poll, remaining, isFinished, mode, hasRealTimeUpdate = false }) {
  const navigate = useNavigate();
  const id = poll.id;
  const [isLoading, setIsLoading] = useState(false);
  const [localVoters, setLocalVoters] = useState(poll.voters || 0);
  const [voteAnimation, setVoteAnimation] = useState(false);
  const [newVotesCount, setNewVotesCount] = useState(0);
  
  const token = localStorage.getItem("token");
  const user = decodeToken(token);
  const userId = user?.id;
  const isOwner = userId === poll.user_id;

  // Mise à jour temps réel via Socket.io
  useEffect(() => {
    if (isFinished || !socket) return;

    // Écouter les nouveaux votes pour ce sondage spécifique
    const onVoteAdded = (data) => {
      if (data.pollId === poll.id) {
        const oldVotes = localVoters;
        const newVotes = data.totalVoters;
        const voteDiff = newVotes - oldVotes;
        
        // Mettre à jour le compteur
        setLocalVoters(newVotes);
        
        // Animation de notification si c'est un nouveau vote
        if (voteDiff > 0) {
          setNewVotesCount(voteDiff);
          setVoteAnimation(true);
          
          // Arrêter l'animation après 3 secondes
          setTimeout(() => {
            setVoteAnimation(false);
            setNewVotesCount(0);
          }, 3000);
        }
      }
    };

    // Écouter les mises à jour de statut
    const onPollUpdated = (data) => {
      if (data.pollId === poll.id) {
        setLocalVoters(data.totalVoters || poll.voters);
      }
    };

    // Joindre la room de ce sondage pour des mises à jour ciblées
    socket.emit('join-poll', poll.id);
    
    socket.on('poll:vote:added', onVoteAdded);
    socket.on('poll:updated', onPollUpdated);

    return () => {
      socket.off('poll:vote:added', onVoteAdded);
      socket.off('poll:updated', onPollUpdated);
      socket.emit('leave-poll', poll.id);
    };
  }, [poll.id, isFinished, localVoters]);

  // Mettre à jour localVoters quand poll.voters change
  useEffect(() => {
    setLocalVoters(poll.voters || 0);
  }, [poll.voters]);

  const buttonConfig = {
    vote: {
      label: "Voter maintenant",
      disabled: false,
      onClick: () => navigate(`/polls/${id}/vote`),
      style: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20",
      icon: null
    },
    waiting: {
      label: "Résultats disponibles après la fin ⏳",
      disabled: true,
      onClick: () => {},
      style: "bg-gray-100 text-gray-400 cursor-not-allowed",
      icon: <Clock className="w-4 h-4" />
    },
    results: {
      label: "Voir les résultats",
      disabled: false,
      onClick: () => navigate(`/polls/${id}/results`),
      style: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg shadow-gray-500/20",
      icon: null
    },
  };

  const btn = buttonConfig[mode] || buttonConfig.vote;

  const shouldDisable = 
    mode === "vote" ? (isFinished || btn.disabled || isOwner) : btn.disabled;

  // Couleur de statut avec animation pour temps réel
  const getStatusColor = () => {
    if (isFinished) return "bg-gray-100 text-gray-600";
    if (voteAnimation) return "bg-green-100 text-green-600 animate-pulse";
    return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 border border-green-200";
  };

  // Couleur de la catégorie
  const getCategoryColor = (category) => {
    const colors = {
      "Politique": "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-200",
      "Sport": "bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 border border-green-200",
      "Culture": "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-600 border border-purple-200",
      "Technologie": "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 border border-cyan-200",
      "Éducation": "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 border border-orange-200",
      "Divertissement": "bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 border border-pink-200",
      "Technologie": "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 border border-cyan-200",
      "Sports": "bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 border border-green-200",
      "Musique": "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-600 border border-purple-200",
      "Films": "bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border border-red-200",
      "Jeux vidéo": "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 border border-amber-200",
      "Éducation": "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 border border-indigo-200",
      "Nourriture": "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 border border-emerald-200",
      "default": "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200"
    };
    return colors[category] || colors.default;
  };

  // Formatage du nombre de votants avec animation
  const formatVoters = (count) => {
    return count.toLocaleString('fr-FR');
  };

  return (
    <div className={`group bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col h-80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden ${
      hasRealTimeUpdate ? 'ring-2 ring-green-400 ring-opacity-50' : ''
    } ${voteAnimation ? 'ring-2 ring-green-500 ring-opacity-70' : ''}`}>
      
      {/* Effet de brillance temps réel */}
      {voteAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50/20 to-transparent animate-pulse"></div>
      )}

      {/* Badge temps réel */}
      {hasRealTimeUpdate && !voteAnimation && (
        <div className="absolute top-2 right-2 z-10">
          <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-sm animate-pulse">
            <Zap className="w-3 h-3" />
            <span>En direct</span>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor()}`}>
          <div className={`w-2 h-2 rounded-full ${isFinished ? "bg-gray-400" : "bg-green-400"} ${voteAnimation ? 'animate-ping' : ''}`}></div>
          {isFinished ? "Terminé" : "En cours"}
          {voteAnimation && (
            <span className="ml-1 animate-bounce">•</span>
          )}
        </span>

        <div className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-gray-50 to-slate-50 px-3 py-1.5 rounded-full border border-gray-200">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700">
            {isFinished ? "Expiré" : remaining}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 mb-6 relative z-10">
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-3 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
          {poll.question}
        </h2>
      </div>

      {/* Métadonnées */}
      <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-full border border-blue-200">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {formatVoters(localVoters)} votant{localVoters !== 1 ? 's' : ''}
          </span>
          
          {/* Animation de nouveau vote */}
          {voteAnimation && newVotesCount > 0 && (
            <div className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full animate-bounce">
              +{newVotesCount}
            </div>
          )}
        </div>

        {poll.categorie && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getCategoryColor(poll.categorie)}`}>
            <Tag className="w-3 h-3" />
            {poll.categorie}
          </div>
        )}

        {isOwner && (
          <div className="ml-auto flex items-center gap-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 px-3 py-1.5 rounded-full border border-yellow-200">
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">Votre sondage</span>
          </div>
        )}
      </div>

      {/* Bouton */}
      <button
        disabled={shouldDisable}
        onClick={btn.onClick}
        className={`mt-auto w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${
          shouldDisable 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : `${btn.style} hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`
        } ${isOwner && mode === "vote" ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Chargement...</span>
          </div>
        ) : (
          <>
            {isOwner && mode === "vote" ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Votre propre sondage</span>
              </>
            ) : (
              <>
                {btn.icon && <span className="mr-1">{btn.icon}</span>}
                <span>{btn.label}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </>
        )}
      </button>

      {/* Indicateur visuel pour le propriétaire */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-7 h-7 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 rounded-full flex items-center justify-center shadow-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Badge pour expirant bientôt */}
      {!isFinished && !remaining.includes("j") && !remaining.includes("h") && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-lg shadow-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Bientôt fini</span>
            </div>
          </div>
        </div>
      )}

      {/* Effet de bordure animée pour temps réel */}
      {voteAnimation && (
        <div className="absolute inset-0 rounded-xl border-2 border-green-400 animate-ping"></div>
      )}
    </div>
  );
}

// Composant de chargement pour maintenir la cohérence
export const PollCardLoading = () => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-80 animate-pulse overflow-hidden">
    <div className="flex justify-between mb-4">
      <div className="h-7 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
      <div className="h-7 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/5"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
    </div>
    <div className="flex gap-3 mb-6">
      <div className="h-7 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
      <div className="h-7 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
    </div>
    <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mt-auto"></div>
    
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
    
    <style>{`
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `}</style>
  </div>
);