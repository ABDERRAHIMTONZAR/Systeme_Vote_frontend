import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import LayoutDashboard from "../components/layout/LayoutDashboard";
import { 
  UserCircle, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Shield,
  User,
  Key,
  Eye,
  EyeOff,
  Save
} from "lucide-react";

// Composant InputField amélioré
const InputField = ({ 
  icon: Icon, 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  extraClass = "",
  showPasswordToggle = false,
  onTogglePassword = null
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type={showPasswordToggle && showPassword ? "text" : type}
          className={`w-full border-2 border-gray-200 px-4 py-3 pl-12 pr-10 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${extraClass}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => {
              setShowPassword(!showPassword);
              onTogglePassword?.();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

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
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/user`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
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

  // Calcul de la force du mot de passe
  useEffect(() => {
    if (!user.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (user.password.length >= 6) strength += 25;
    if (user.password.length >= 8) strength += 25;
    if (/[A-Z]/.test(user.password)) strength += 25;
    if (/[0-9]/.test(user.password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [user.password]);

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

      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/user/update`, data, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setMessage({ text: "✅ Profil mis à jour avec succès", type: "success" });
      if (activeTab === "security") {
        setUser(prev => ({ 
          ...prev, 
          password: "", 
          confirmPassword: "" 
        }));
      }
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      setMessage({ text: "❌ Erreur lors de la mise à jour", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { 
      id: "personal", 
      label: "Informations personnelles", 
      icon: UserCircle,
      color: "bg-blue-100 border-blue-200",
      activeColor: "bg-blue-600 border-blue-700 text-white"
    },
    { 
      id: "security", 
      label: "Sécurité", 
      icon: Shield,
      color: "bg-purple-100 border-purple-200",
      activeColor: "bg-purple-600 border-purple-700 text-white"
    },
  ];

  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return "bg-green-500";
    if (passwordStrength >= 50) return "bg-yellow-500";
    if (passwordStrength >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength >= 75) return "text-green-600";
    if (passwordStrength >= 50) return "text-yellow-600";
    if (passwordStrength >= 25) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <LayoutDashboard>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Mon Profil</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Gérez vos informations personnelles et la sécurité de votre compte
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Navigation par onglets */}
            <div className="flex flex-col sm:flex-row border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? `${tab.activeColor}`
                      : `bg-white text-gray-700 hover:bg-gray-50 border-b-2 ${activeTab === tab.id ? 'border-blue-600' : 'border-transparent'}`
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeTab === tab.id
                      ? "bg-white/20"
                      : "bg-gray-100"
                  }`}>
                    <tab.icon className={`h-4 w-4 ${
                      activeTab === tab.id ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Contenu du formulaire */}
            <div className="p-6 md:p-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de vos informations...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-6">
                  {/* En-tête de section */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {activeTab === "personal" ? 
                        <User className="h-5 w-5 text-blue-600" /> : 
                        <Key className="h-5 w-5 text-purple-600" />
                      }
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {activeTab === "personal" ? "Informations personnelles" : "Sécurité du compte"}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {activeTab === "personal" ? "Mettez à jour vos coordonnées" : "Protégez votre espace personnel"}
                      </p>
                    </div>
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
                          label="Adresse email" 
                          type="email" 
                          value={user.email}
                          onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="votre@email.com" 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Avertissement */}
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-yellow-600 text-sm">!</span>
                          </div>
                          <p className="text-sm text-yellow-700">Laissez vide pour ne pas modifier le mot de passe</p>
                        </div>
                      </div>

                      <InputField 
                        icon={Lock} 
                        label="Nouveau mot de passe" 
                        type="password" 
                        value={user.password}
                        onChange={(e) => setUser(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Minimum 6 caractères"
                        showPasswordToggle={true}
                      />

                      {/* Indicateur de force du mot de passe */}
                      {user.password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Force du mot de passe</span>
                            <span className={`text-sm font-medium ${getPasswordStrengthText()}`}>
                              {passwordStrength >= 75 ? "Fort" : passwordStrength >= 50 ? "Moyen" : "Faible"}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getPasswordStrengthColor()} rounded-full transition-all duration-500`}
                              style={{ width: `${passwordStrength}%` }}
                            ></div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            <span className={`flex items-center gap-1 ${user.password.length >= 6 ? 'text-green-600' : ''}`}>
                              {user.password.length >= 6 ? '✓' : '○'} 6+ caractères
                            </span>
                            <span className={`flex items-center gap-1 ${user.password.length >= 8 ? 'text-green-600' : ''}`}>
                              {user.password.length >= 8 ? '✓' : '○'} 8+ caractères
                            </span>
                            <span className={`flex items-center gap-1 ${/[A-Z]/.test(user.password) ? 'text-green-600' : ''}`}>
                              {/[A-Z]/.test(user.password) ? '✓' : '○'} Majuscule
                            </span>
                            <span className={`flex items-center gap-1 ${/[0-9]/.test(user.password) ? 'text-green-600' : ''}`}>
                              {/[0-9]/.test(user.password) ? '✓' : '○'} Chiffre
                            </span>
                          </div>
                        </div>
                      )}

                      <InputField 
                        icon={Lock} 
                        label="Confirmer le mot de passe" 
                        type="password" 
                        value={user.confirmPassword}
                        onChange={(e) => setUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Retapez votre mot de passe"
                        extraClass={user.confirmPassword && user.password !== user.confirmPassword ? 'border-red-500' : ''}
                        showPasswordToggle={true}
                      />

                      {/* Indicateur de correspondance */}
                      {user.confirmPassword && (
                        <div className={`flex items-center gap-2 ${user.password === user.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                          {user.password === user.confirmPassword ? (
                            <>
                              <CheckCircle className="h-5 w-5" />
                              <span className="text-sm">Les mots de passe correspondent</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5" />
                              <span className="text-sm">Les mots de passe ne correspondent pas</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message d'état */}
                  {message.text && (
                    <div className={`p-4 rounded-lg border flex items-center gap-3 ${
                      message.type === "success" 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}>
                      {message.type === "success" ? 
                        <CheckCircle className="h-6 w-6 text-green-600" /> : 
                        <XCircle className="h-6 w-6 text-red-600" />
                      }
                      <div>
                        <p className={`font-medium ${message.type === "success" ? "text-green-800" : "text-red-800"}`}>
                          {message.text}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {message.type === "success" 
                            ? "Vos modifications ont été enregistrées avec succès." 
                            : "Veuillez vérifier les informations saisies."
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bouton de soumission */}
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`group px-8 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-3 ${
                        isLoading 
                          ? "bg-blue-400 cursor-not-allowed" 
                          : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Enregistrement en cours...
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                            <Save className="h-4 w-4 text-white" />
                          </div>
                          Sauvegarder les modifications
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Votre compte est sécurisé</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Modifications en temps réel</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                Toutes vos données sont chiffrées et protégées
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}