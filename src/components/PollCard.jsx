import React from "react";
import { useNavigate } from "react-router-dom";

export default function PollCard({ poll, remaining, isFinished }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 h-80 flex flex-col">
      
      {/* Header avec statut et timer */}
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

      {/* Question - Section avec hauteur fixe */}
      <div className="flex-1 mb-4 min-h-[72px]">
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-3">
          {poll.question}
        </h2>
      </div>

      {/* Métadonnées */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span className="w-5">👥</span>
          <span className="ml-2">{poll.voters || 0} voters</span>
        </div>
        
        {/* Ajout d'info sur les catégories si disponible */}
        {poll.categorie && (
          <div className="flex items-center text-sm text-gray-500">
            <span className="w-5">🏷️</span>
            <span className="ml-2">{poll.categorie}</span>
          </div>
        )}
      </div>

      {/* Bouton - Toujours en bas */}
      <div className="mt-auto">
        <button
          onClick={() => {
            if (isFinished) {
              navigate(`/polls/${poll.id}/results`);
            } else {
              navigate(`/polls/${poll.id}/vote`);
            }
          }}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors duration-200 ${
            isFinished
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isFinished ? "View Results" : "Vote Now"}
        </button>
      </div>
    </div>
  );
}