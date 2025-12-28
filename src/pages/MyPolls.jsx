import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Edit, Trash2, BarChart } from "lucide-react";
import LayoutDashboard from "../components/layout/LayoutDashboard";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

export default function MyPolls() {
  const [polls, setPolls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editPoll, setEditPoll] = useState(null);

  const navigate = useNavigate();
  const lockRef = useRef(false);

  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/my-polls`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPolls(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  // ✅ SOCKET : refresh auto si create/update/delete
  useEffect(() => {
    const onChanged = async () => {
      if (lockRef.current) return;
      lockRef.current = true;
      try {
        await fetchPolls();
      } finally {
        lockRef.current = false;
      }
    };

    socket.on("polls:changed", onChanged);
    return () => socket.off("polls:changed", onChanged);
  }, []);

  const updatePoll = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.REACT_APP_API_URL}/dashboard/update/${editPoll.id}`,
        {
          question: editPoll.question,
          Categorie: editPoll.category,
          End_time: (editPoll.endsOn || "").slice(0, 10), // ✅ date safe
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Sondage mis à jour !");
      setShowModal(false);
      setEditPoll(null);
      await fetchPolls(); // ✅ refresh direct
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour.");
    }
  };

  const deletePoll = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const result = window.confirm(
        "Voulez-vous vraiment supprimer ce sondage ?"
      );

      if (!result) {
        alert("Suppression annulée.");
        return;
      }

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/dashboard/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Sondage supprimé !");
      await fetchPolls(); // ✅ refresh direct
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression.");
    }
  };

  const resultPolls = (poll) => {
    if (poll.status === "Active") {
      alert("Le sondage n'est pas encore terminé");
    } else {
      navigate(`/polls/${poll.id}/results`);
    }
  };

  const openEdit = (poll) => {
    if (poll.status === "Ended") {
      alert("Impossible de modifier un sondage terminé.");
      return;
    }
    setEditPoll(poll);
    setShowModal(true);
  };

  return (
    <LayoutDashboard>
      <div className="p-4 md:p-6 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Mes Sondages</h1>

        {/* ✅ DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Question</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Créé le</th>
                <th className="p-3">Se termine le</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {polls.map((poll) => (
                <tr key={poll.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{poll.question}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        poll.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {poll.status}
                    </span>
                  </td>

                  <td className="p-3 whitespace-nowrap">{poll.createdOn}</td>
                  <td className="p-3 whitespace-nowrap">{poll.endsOn}</td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-3">
                      <button
                        className={`flex items-center gap-1 ${
                          poll.status === "Ended"
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                        onClick={() => openEdit(poll)}
                      >
                        <Edit size={16} /> Éditer
                      </button>

                      <button
                        className="flex items-center gap-1 text-red-500 hover:text-red-700"
                        onClick={() => deletePoll(poll.id)}
                      >
                        <Trash2 size={16} /> Supprimer
                      </button>

                      <button
                        className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                        onClick={() => resultPolls(poll)}
                      >
                        <BarChart size={16} /> Résultats
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ MOBILE CARDS */}
        <div className="md:hidden space-y-3">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-gray-900 leading-snug">
                  {poll.question}
                </p>

                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                    poll.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {poll.status}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Créé :</span>{" "}
                  <span className="whitespace-nowrap">{poll.createdOn}</span>
                </p>
                <p>
                  <span className="font-medium">Fin :</span>{" "}
                  <span className="whitespace-nowrap">{poll.endsOn}</span>
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`px-3 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 ${
                    poll.status === "Ended"
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-blue-700 border-blue-200 hover:bg-blue-50"
                  }`}
                  onClick={() => openEdit(poll)}
                >
                  <Edit size={16} /> Éditer
                </button>

                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={() => deletePoll(poll.id)}
                >
                  <Trash2 size={16} /> Supprimer
                </button>

                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => resultPolls(poll)}
                >
                  <BarChart size={16} /> Résultats
                </button>
              </div>
            </div>
          ))}
        </div>

        {polls.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            Vous n'avez pas encore créé de sondage.
          </p>
        )}
      </div>

      {/* ✅ MODAL EDIT */}
      {showModal && editPoll && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Modifier le sondage</h2>

            <input
              className="w-full p-2 border rounded mb-3"
              value={editPoll.question || ""}
              onChange={(e) =>
                setEditPoll({ ...editPoll, question: e.target.value })
              }
            />

            <select
              className="w-full p-2 border rounded mb-3"
              value={editPoll.category || "other"}
              onChange={(e) =>
                setEditPoll({ ...editPoll, category: e.target.value })
              }
            >
              <option value="tech">Technologie</option>
              <option value="sports">Sports</option>
              <option value="music">Musique</option>
              <option value="education">Éducation</option>
              <option value="food">Nourriture</option>
              <option value="other">Autre</option>
            </select>

            <input
              type="date"
              className="w-full p-2 border rounded mb-3"
              value={(editPoll.endsOn || "").slice(0, 10)}
              onChange={(e) =>
                setEditPoll({ ...editPoll, endsOn: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => {
                  setShowModal(false);
                  setEditPoll(null);
                }}
              >
                Annuler
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={updatePoll}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutDashboard>
  );
}
