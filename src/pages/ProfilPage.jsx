import { useEffect, useState } from "react";
import axios from "axios";
import LayoutDashboard from "../components/layout/LayoutDashboard";
import { UserCircle, Lock, CheckCircle, XCircle, Mail } from "lucide-react";

// Composant InputField défini EN DEHORS du composant principal
const InputField = ({ icon: Icon, label, type = "text", value, onChange, placeholder, extraClass = "" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <input
        type={type}
        className={`w-full border border-gray-300 px-4 py-3 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${extraClass}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <Icon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
    </div>
  </div>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState({ 
    nom: "", 
    prenom: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const userData = res.data;
        setUser({
          nom: userData.Nom || userData.nom || "",
          prenom: userData.Prenom || userData.prenom || "",
          email: userData.Email || userData.email || "",
          password: "",
          confirmPassword: ""
        });
      })
      .catch(() => setMessage({ text: "Erreur lors du chargement", type: "error" }))
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (activeTab === "security") {
      if (user.password && user.password.length < 6) {
        setMessage({ text: "Minimum 6 caractères", type: "error" });
        return;
      }
      if (user.password !== user.confirmPassword) {
        setMessage({ text: "Mots de passe différents", type: "error" });
        return;
      }
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = { 
        nom: user.nom, 
        prenom: user.prenom, 
        email: user.email 
      };
      
      if (user.password.trim() !== "") {
        data.password = user.password;
      }

      await axios.put(`${process.env.REACT_APP_API_URL}/user/update`, data, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setMessage({ text: "Profil mis à jour", type: "success" });
      if (activeTab === "security") {
        setUser(prev => ({ 
          ...prev, 
          password: "", 
          confirmPassword: "" 
        }));
      }
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      setMessage({ text: "Erreur lors de la mise à jour", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Informations personnelles", icon: UserCircle },
    { id: "security", label: "Sécurité", icon: Lock },
  ];

  return (
    <LayoutDashboard>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl p-6">
          <h1 className="text-2xl font-bold text-white">Gestion du profil</h1>
          <p className="text-blue-100">Modifiez vos informations</p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg border border-gray-200">
          <nav className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="p-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {activeTab === "personal" ? "Informations personnelles" : "Sécurité du compte"}
                  </h2>
                  <p className="text-gray-600">
                    {activeTab === "personal" ? "Mettez à jour vos informations" : "Gérez votre mot de passe"}
                  </p>
                </div>

                {activeTab === "personal" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      icon={UserCircle} 
                      label="Prénom" 
                      value={user.prenom}
                      onChange={(e) => setUser(prev => ({ ...prev, prenom: e.target.value }))}
                      placeholder="Votre prénom" 
                    />
                    <InputField 
                      icon={UserCircle} 
                      label="Nom" 
                      value={user.nom}
                      onChange={(e) => setUser(prev => ({ ...prev, nom: e.target.value }))}
                      placeholder="Votre nom" 
                    />
                    <div className="md:col-span-2">
                      <InputField 
                        icon={Mail} 
                        label="Email" 
                        type="email" 
                        value={user.email}
                        onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="votre@email.com" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                      <p className="text-sm text-yellow-700">Laissez vide pour ne pas modifier</p>
                    </div>
                    <InputField 
                      icon={Lock} 
                      label="Nouveau mot de passe" 
                      type="password" 
                      value={user.password}
                      onChange={(e) => setUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 6 caractères"
                    />
                    {user.password && (
                      <p className={`text-sm ${user.password.length >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                        {user.password.length >= 6 ? '✓' : '✗'} 6 caractères minimum
                      </p>
                    )}
                    <InputField 
                      icon={Lock} 
                      label="Confirmer le mot de passe" 
                      type="password" 
                      value={user.confirmPassword}
                      onChange={(e) => setUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Retapez votre mot de passe"
                      extraClass={user.confirmPassword && user.password !== user.confirmPassword ? 'border-red-500' : ''}
                    />
                    {user.confirmPassword && (
                      <p className={`text-sm ${user.password === user.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                        {user.password === user.confirmPassword ? '✓' : '✗'} Correspondance
                      </p>
                    )}
                  </div>
                )}

                {message.text && (
                  <div className={`p-4 rounded-lg flex items-center gap-2 ${
                    message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                  }`}>
                    {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <p className="font-medium">{message.text}</p>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                      isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Sauvegarder
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}