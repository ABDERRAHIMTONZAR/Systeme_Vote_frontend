import React from "react";
import { useNavigate } from "react-router-dom";

export default function PollCard({ poll, remaining, isFinished }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
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

      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {poll.question}
      </h2>

      <div className="space-y-2 mb-6">
        <div className="flex items-center text-sm text-gray-500">
          <span className="w-5">👥</span>
          <span className="ml-2">{poll.voters} voters</span>
        </div>
      </div>
      <button
        onClick={() => (isFinished ? null : navigate("/"))}
        className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors duration-200 ${
          isFinished
            ? "bg-gray-600 hover:bg-gray-700 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isFinished ? "View Results" : "Vote Now"}
      </button>
    </div>
  );
}
