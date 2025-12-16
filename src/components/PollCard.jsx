// PollCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function PollCard({ poll, remaining, isFinished, mode }) {
  const navigate = useNavigate();
  const id = poll.id;

  const buttonConfig = {
    vote: {
      label: "Voter maintenant",
      disabled: false,
      onClick: () => navigate(`/polls/${id}/vote`),
      style: "bg-blue-600 hover:bg-blue-700 text-white",
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
      style: "bg-gray-600 hover:bg-gray-700 text-white",
    },
  };

  const btn = buttonConfig[mode] || buttonConfig.vote;

  const shouldDisable =
    mode === "vote" ? isFinished || btn.disabled : btn.disabled;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-80 flex flex-col">
      <div className="flex justify-between mb-4">
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${
            isFinished
              ? "bg-gray-100 text-gray-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {isFinished ? "Terminé" : "En cours"}
        </span>

        <span className="text-sm text-gray-500">
          {isFinished ? "Expiré" : `${remaining} restantes`}
        </span>
      </div>

      <div className="flex-1 mb-4 min-h-[72px]">
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-3">
          {poll.question}
        </h2>
      </div>

      <div className="mb-6 text-sm text-gray-500">
        👥 {poll.voters || 0} votants
        {poll.categorie && ` · 🏷️ ${poll.categorie}`}
      </div>

      <button
        disabled={shouldDisable}
        onClick={btn.onClick}
        className={`mt-auto w-full py-3 rounded-md font-medium transition ${
          shouldDisable ? "bg-gray-300 text-gray-500 cursor-not-allowed" : btn.style
        }`}
      >
        {btn.label}
      </button>
    </div>
  );
}
