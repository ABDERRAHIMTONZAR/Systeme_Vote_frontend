import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, BarChart } from "lucide-react"; 
import LayoutDashboard from "../components/layout/LayoutDashboard";
import { useNavigate } from "react-router-dom";
export default function MyPolls() {
  const [polls, setPolls] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editPoll, setEditPoll] = useState(null);
     const navigate=useNavigate();
  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/dashboard/my-polls", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolls(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };
const updatePoll = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:3001/dashboard/update/${editPoll.id}`,
      {
        question: editPoll.question,
        Categorie: editPoll.category,
        End_time: editPoll.endsOn
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    alert("Sondage mis à jour !");
    setShowModal(false);
    fetchPolls(); 
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la mise à jour.");
  }
};
 const deletePoll = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const result = window.confirm("Voulez-vous vraiment supprimer ce sondage ?");

    if (!result) {
      alert("Suppression annulée.");
      return;
    }

    await axios.delete(`http://localhost:3001/dashboard/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert("Sondage supprimé !");
    fetchPolls();

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


  return (
    <LayoutDashboard>
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Mes Sondages</h1>

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

              <td className="p-3">{poll.createdOn}</td>
              <td className="p-3">{poll.endsOn}</td>

              <td className="p-3 flex gap-3">
                        <button
            className={`flex items-center gap-1 ${
                poll.status === "Ended"
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-800"
            }`}
            onClick={() => {
                if (poll.status === "Ended") {
                alert("Impossible de modifier un sondage terminé.");
                return;
                }
                setEditPoll(poll);
                setShowModal(true);
        }}
        >
        <Edit size={16} /> Éditer
        </button>
                

                <button
    className={`flex items-center gap-1 ${
         "text-red-500 hover:text-red-700"
    }`}
    onClick={()=>
        deletePoll(poll.id)}
    >
    <Trash2 size={16} /> Supprimer
</button>


                <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                onClick={() => resultPolls(poll)}>
                  <BarChart size={16} /> Résultats
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {polls.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          Vous n'avez pas encore créé de sondage.
        </p>
      )}
      
    </div>
    {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4">Modifier le sondage</h2>

      <input
        className="w-full p-2 border rounded mb-3"
        value={editPoll.question}
        onChange={(e) =>
          setEditPoll({ ...editPoll, question: e.target.value })
        }
      />

      <select
        className="w-full p-2 border rounded mb-3"
        value={editPoll.category}
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
        value={editPoll.endsOn}
        onChange={(e) =>
          setEditPoll({ ...editPoll, endsOn: e.target.value })
        }
      />

      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => setShowModal(false)}
        >
          Annuler
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => updatePoll()}
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
