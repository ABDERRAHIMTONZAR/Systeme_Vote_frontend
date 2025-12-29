import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { 
  Edit, 
  Trash2, 
  BarChart, 
  Calendar,
  Tag,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Filter,
  Search,
  AlertCircle,
  ChevronRight,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import LayoutDashboard from "../components/layout/LayoutDashboard";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

export default function MyPolls() {
  const [polls, setPolls] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editPoll, setEditPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();
  const lockRef = useRef(false);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process}/dashboard/my-polls`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPolls(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

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
          End_time: (editPoll.endsOn || "").slice(0, 10),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Sondage mis à jour avec succès !");
      setShowModal(false);
      setEditPoll(null);
      await fetchPolls();
    } catch (error) {
      console.error(error);
      alert("❌ Erreur lors de la mise à jour.");
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

      alert("✅ Sondage supprimé avec succès !");
      await fetchPolls();
    } catch (error) {
      console.error(error);
      alert("❌ Erreur lors de la suppression.");
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
      alert("❌ Impossible de modifier un sondage terminé.");
      return;
    }
    setEditPoll(poll);
    setShowModal(true);
  };

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = searchTerm === "" || 
      poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "active" && poll.status === "Active") ||
      (filterStatus === "ended" && poll.status === "Ended");
    
    return matchesSearch && matchesFilter;
  });

  // Skeleton loader
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="flex items-center gap-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Stats
  const stats = {
    total: polls.length,
    active: polls.filter(p => p.status === "Active").length,
    ended: polls.filter(p => p.status === "Ended").length,
    popular: polls.filter(p => p.voters > 10).length
  };

  const getCategoryColor = (category) => {
    const colors = {
      tech: "bg-blue-100 text-blue-700",
      sports: "bg-green-100 text-green-700",
      music: "bg-purple-100 text-purple-700",
      movies: "bg-red-100 text-red-700",
      education: "bg-amber-100 text-amber-700",
      food: "bg-rose-100 text-rose-700",
      other: "bg-gray-100 text-gray-700"
    };
    return colors[category] || colors.other;
  };

  const getStatusColor = (status) => {
    return status === "Active" 
      ? "bg-green-100 text-green-700 border border-green-200" 
      : "bg-gray-100 text-gray-700 border border-gray-200";
  };

  return (
    <LayoutDashboard>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Mes sondages</h1>
              <p className="text-gray-600">Gérez et suivez tous vos sondages créés</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un sondage..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button
                onClick={fetchPolls}
                className="p-2 border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition flex items-center gap-2"
                title="Actualiser"
                disabled={loading}
              >
                <Zap className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          

          {/* Filtres */}
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filtres</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "active", "ended"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === status
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" && "Tous"}
                  {status === "active" && "Actifs"}
                  {status === "ended" && "Terminés"}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>
                {filteredPolls.length} sondage{filteredPolls.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Mis à jour en temps réel
              </span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {filteredPolls.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="p-6 text-left text-sm font-semibold text-gray-700">Question</th>
                          <th className="p-6 text-left text-sm font-semibold text-gray-700">Statut</th>
                          <th className="p-6 text-left text-sm font-semibold text-gray-700">Catégorie</th>
                          <th className="p-6 text-left text-sm font-semibold text-gray-700">Dates</th>
                          <th className="p-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredPolls.map((poll) => (
                          <tr key={poll.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                            <td className="p-6">
                              <div className="max-w-md">
                                <p className="text-gray-800 font-medium">
                                  {poll.question}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Users className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-600">{poll.voters || 0} votants</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-6">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor(poll.status)}`}>
                                <div className={`w-2 h-2 rounded-full ${poll.status === "Active" ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                <span className="text-sm font-medium">
                                  {poll.status === "Active" ? "Actif" : "Terminé"}
                                </span>
                              </div>
                            </td>

                            <td className="p-6">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getCategoryColor(poll.category)}`}>
                                <Tag className="h-3 w-3" />
                                <span className="text-sm capitalize">{poll.category || "other"}</span>
                              </div>
                            </td>

                            <td className="p-6">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-3 w-3 text-gray-500" />
                                  <span className="text-gray-700">Créé: {poll.createdOn}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-3 w-3 text-amber-500" />
                                  <span className="text-amber-700">Fin: {poll.endsOn}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-6">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEdit(poll)}
                                  disabled={poll.status === "Ended"}
                                  className={`p-2 rounded-lg transition-all ${poll.status === "Ended"
                                    ? "opacity-50 cursor-not-allowed text-gray-400"
                                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  }`}
                                  title="Modifier"
                                >
                                  <Edit size={18} />
                                </button>

                                <button
                                  onClick={() => deletePoll(poll.id)}
                                  className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 size={18} />
                                </button>

                                <button
                                  onClick={() => resultPolls(poll)}
                                  className="p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition-all"
                                  title="Résultats"
                                >
                                  <BarChart size={18} />
                                </button>

                                <button
                                  onClick={() => navigate(`/polls/${poll.id}/vote`)}
                                  className="p-2 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all"
                                  title="Voir"
                                >
                                  <Eye size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {filteredPolls.map((poll) => (
                    <div
                      key={poll.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`px-3 py-1 rounded-lg ${getCategoryColor(poll.category)}`}>
                              <Tag className="h-3 w-3 inline mr-1" />
                              <span className="text-xs font-medium capitalize">{poll.category || "other"}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full ${getStatusColor(poll.status)}`}>
                              <div className={`w-2 h-2 rounded-full ${poll.status === "Active" ? 'bg-green-500' : 'bg-gray-500'} inline mr-1`}></div>
                              <span className="text-xs font-medium">
                                {poll.status === "Active" ? "Actif" : "Terminé"}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-800 font-medium mb-3">
                            {poll.question}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{poll.createdOn}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="text-amber-600">Fin: {poll.endsOn}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{poll.voters || 0} votants</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => openEdit(poll)}
                          disabled={poll.status === "Ended"}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                            poll.status === "Ended"
                              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-500"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                          }`}
                        >
                          <Edit size={16} />
                          <span className="text-sm font-medium">Modifier</span>
                        </button>

                        <button
                          onClick={() => deletePoll(poll.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"
                        >
                          <Trash2 size={16} />
                          <span className="text-sm font-medium">Supprimer</span>
                        </button>

                        <button
                          onClick={() => resultPolls(poll)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-all"
                        >
                          <BarChart size={16} />
                          <span className="text-sm font-medium">Résultats</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-300">
                  <AlertCircle className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {searchTerm || filterStatus !== "all" ? "Aucun résultat" : "Aucun sondage créé"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {searchTerm 
                    ? `Aucun sondage ne correspond à "${searchTerm}"`
                    : filterStatus !== "all"
                    ? `Aucun sondage ${filterStatus === "active" ? "actif" : "terminé"}`
                    : "Vous n'avez pas encore créé de sondage. Commencez maintenant !"
                  }
                </p>
                {(searchTerm || filterStatus !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 font-medium"
                  >
                    Afficher tous les sondages
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal d'édition */}
      {showModal && editPoll && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Modifier le sondage</h2>
                  <p className="text-sm text-gray-600">Mettez à jour les informations</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                  <textarea
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    value={editPoll.question || ""}
                    onChange={(e) => setEditPoll({ ...editPoll, question: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={editPoll.category || "other"}
                    onChange={(e) => setEditPoll({ ...editPoll, category: e.target.value })}
                  >
                    <option value="tech">Technologie</option>
                    <option value="sports">Sports</option>
                    <option value="music">Musique</option>
                    <option value="movies">Films & Séries</option>
                    <option value="education">Éducation</option>
                    <option value="food">Nourriture</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                  <input
                    type="date"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={(editPoll.endsOn || "").slice(0, 10)}
                    onChange={(e) => setEditPoll({ ...editPoll, endsOn: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all"
                  onClick={() => {
                    setShowModal(false);
                    setEditPoll(null);
                  }}
                >
                  Annuler
                </button>

                <button
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow"
                  onClick={updatePoll}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutDashboard>
  );
}