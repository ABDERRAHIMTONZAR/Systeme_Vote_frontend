import { useEffect, useState } from "react";
import axios from "axios";
import LayoutDashboard from "../components/layout/LayoutDashboard";

export default function ProfilePage() {
  const [user, setUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log(res)
        setUser({
          nom: res.data.Nom || "",
          prenom: res.data.Prenom || "",
          email: res.data.Email || "",
          password: "",
          confirmPassword: "",
        });
      })
      .catch(() => setMessage("Erreur lors du chargement du profil"));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Vérification mot de passe si renseigné
    if (user.password && user.password !== user.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3001/user/update",
        {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          password: user.password ? user.password : undefined, // ne pas envoyer si vide
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Profil mis à jour avec succès !");
      // Réinitialiser les champs mot de passe
      setUser((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      setMessage("Erreur lors de la mise à jour");
    }
  };

  return (
    <LayoutDashboard>
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-lg border">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Modifier votre profil
        </h2>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* NOM */}
          <div>
            <label className="block font-semibold text-gray-700">Nom</label>
            <input
              type="text"
              className="w-full border px-4 py-3 rounded-lg"
              value={user.nom}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, nom: e.target.value }))
              }
            />
          </div>

          {/* PRENOM */}
          <div>
            <label className="block font-semibold text-gray-700">Prénom</label>
            <input
              type="text"
              className="w-full border px-4 py-3 rounded-lg"
              value={user.prenom}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, prenom: e.target.value }))
              }
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block font-semibold text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border px-4 py-3 rounded-lg"
              value={user.email}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block font-semibold text-gray-700">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              className="w-full border px-4 py-3 rounded-lg"
              placeholder="Laisser vide pour ne pas changer"
              value={user.password}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block font-semibold text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              className="w-full border px-4 py-3 rounded-lg"
              value={user.confirmPassword}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full text-lg font-semibold hover:bg-blue-700"
          >
            Sauvegarder
          </button>

          {message && (
            <p className="text-center mt-3 text-blue-700 font-medium">{message}</p>
          )}
        </form>
      </div>
    </LayoutDashboard>
  );
}
