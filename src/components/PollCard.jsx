// PollCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../utils/decodeToken";
import { Clock, Users, Tag, Lock, Award, ChevronRight } from "lucide-react";

export default function PollCard({ poll, remaining, isFinished, mode }) {
  const navigate = useNavigate();
  const id = poll.id;
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");
  const user = decodeToken(token);
  const userId = user?.id;
  const isOwner = userId === poll.user_id;

  const buttonConfig = {
    vote: {
      label: "Voter maintenant",
      disabled: false,
      onClick: () => navigate(`/polls/${id}/vote`),
      style: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    },
    waiting: {
      label: "Résultats disponibles après la fin ⏳",
      disabled: true,
      onClick: () => {},
      style: "bg-gray-300 text-gray-500 cursor-not-allowed",
    },
    results: {
      label: "Voir les résultats",
      disabled: false,
      onClick: () => navigate(`/polls/${id}/results`),
      style: "bg-gray-600 hover:bg-gray-700 text-white shadow-sm",
    },
  };

  const btn = buttonConfig[mode] || buttonConfig.vote;

  const shouldDisable = 
    mode === "vote" ? (isFinished || btn.disabled || isOwner) : btn.disabled;

  // Couleur de statut
  const getStatusColor = () => {
    if (isFinished) return "bg-gray-100 text-gray-600";
    return "bg-green-100 text-green-600";
  };

  // Couleur de la catégorie
  const getCategoryColor = (category) => {
    const colors = {
      "Politique": "bg-blue-100 text-blue-600",
      "Sport": "bg-green-100 text-green-600",
      "Culture": "bg-purple-100 text-purple-600",
      "Technologie": "bg-cyan-100 text-cyan-600",
      "Éducation": "bg-orange-100 text-orange-600",
      "Divertissement": "bg-pink-100 text-pink-600",
      "default": "bg-gray-100 text-gray-600"
    };
    return colors[category] || colors.default;
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col h-80 transition-all duration-200 hover:shadow-md">
      
  {/* En-tête */}
  <div className="flex justify-between items-center mb-4">
    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor()}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isFinished ? "bg-gray-400" : "bg-green-400"}`}></div>
      {isFinished ? "Terminé" : "En cours"}
    </span>

    {/* Ajout d'un conteneur flexible pour mieux gérer l'espace */}
    <div className="flex-1 min-w-[120px] flex justify-end">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
        <Clock className="w-4 h-4" />
        <span className="font-medium">
          {isFinished ? "Expiré" : remaining}
        </span>
      </div>
    </div>
  </div>

      {/* Question */}
      <div className="flex-1 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
          {poll.question}
        </h2>
      </div>

      {/* Métadonnées */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">
            {poll.voters || 0} votant{poll.voters !== 1 ? 's' : ''}
          </span>
        </div>

        {poll.categorie && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(poll.categorie)}`}>
            <div className="flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              {poll.categorie}
            </div>
          </div>
        )}

        {isOwner && (
          <div className="ml-auto flex items-center gap-1.5 text-yellow-600">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium">Votre sondage</span>
          </div>
        )}
      </div>

      {/* Bouton */}
      <button
        disabled={shouldDisable}
        onClick={btn.onClick}
        className={`mt-auto w-full py-3 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          shouldDisable 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
            : btn.style
        } ${isOwner && mode === "vote" ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Chargement...
          </div>
        ) : (
          <>
            {isOwner && mode === "vote" ? (
              <>
                <Lock className="w-4 h-4" />
                Votre propre sondage
              </>
            ) : (
              <>
                {btn.label}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </>
        )}
      </button>

      {/* Indicateur visuel pour le propriétaire */}
      {isOwner && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-yellow-100 border border-yellow-200 rounded-full flex items-center justify-center shadow-sm">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Badge pour expirant bientôt (optionnel - plus subtil) */}
      {!isFinished && !remaining.includes("j") && !remaining.includes("h") && (
        <div className="absolute -top-2 -right-2">
          <div className="px-2 py-1 bg-orange-100 border border-orange-200 rounded-lg text-xs font-medium text-orange-700">
            Bientôt fini
          </div>
        </div>
      )}
    </div>
  );
}

// Composant de chargement pour maintenir la cohérence
export const PollCardLoading = () => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-80 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      <div className="h-6 w-24 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
    <div className="flex gap-3 mb-6">
      <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded-md mt-auto"></div>
  </div>
);