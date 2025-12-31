import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";


function Modal({ open, type = "info", title, message, onClose, onConfirm, confirmText = "OK" }) {
  if (!open) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  const isWarn = type === "warn";

  const icon = isSuccess ? (
    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
      <Check className="w-7 h-7 text-green-600" />
    </div>
  ) : isError ? (
    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
      <X className="w-7 h-7 text-red-600" />
    </div>
  ) : (
    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
      <span className="text-2xl">⚠️</span>
    </div>
  );

  const buttonClass = isSuccess
    ? "bg-green-600 hover:bg-green-700"
    : isError
    ? "bg-red-600 hover:bg-red-700"
    : "bg-amber-600 hover:bg-amber-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-[fadeIn_.2s_ease-out]">
        <div className="flex flex-col items-center text-center">
          {icon}
          <h2 className="mt-4 text-xl font-bold text-gray-800">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>

          <div className="mt-6 w-full flex gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition"
              >
                Fermer
              </button>
            )}

            <button
              onClick={onConfirm || onClose}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${buttonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateAccount() {
  const navigate = useNavigate();

  const [error, setError] = useState({
    messageNom: "",
    messagePrenom: "",
    messageEmail: "",
    messagePassword: "",
    messageConfirmPassword: "",
    messageServer: "",
  });

  const [info, setInfo] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [modal, setModal] = useState({
    open: false,
    type: "info", 
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "OK",
    showClose: true,
  });

  const openModal = ({ type, title, message, onConfirm, confirmText = "OK", showClose = true }) => {
    setModal({ open: true, type, title, message, onConfirm, confirmText, showClose });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const evaluatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (value) => {
    setInfo((prev) => ({ ...prev, password: value }));
    setPasswordStrength(evaluatePasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+=-]{8,}$/;

    setError({
      messageNom: "",
      messagePrenom: "",
      messageEmail: "",
      messagePassword: "",
      messageConfirmPassword: "",
      messageServer: "",
    });

    if (info.nom.trim() === "") {
      setError((prev) => ({ ...prev, messageNom: "Le nom est requis" }));
      setIsLoading(false);
      return;
    }

    if (info.prenom.trim() === "") {
      setError((prev) => ({ ...prev, messagePrenom: "Le prénom est requis" }));
      setIsLoading(false);
      return;
    }

    if (info.email.trim() === "") {
      setError((prev) => ({ ...prev, messageEmail: "L'email est requis" }));
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(info.email)) {
      setError((prev) => ({ ...prev, messageEmail: "Format email incorrect" }));
      setIsLoading(false);
      return;
    }

    if (info.password.trim() === "") {
      setError((prev) => ({ ...prev, messagePassword: "Le mot de passe est requis" }));
      setIsLoading(false);
      return;
    }

    if (info.confirmPassword.trim() === "") {
      setError((prev) => ({ ...prev, messageConfirmPassword: "La confirmation est requise" }));
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(info.password)) {
      setError((prev) => ({ ...prev, messagePassword: "Minimum 8 caractères" }));
      setIsLoading(false);
      return;
    }

    if (info.password !== info.confirmPassword) {
      setError((prev) => ({ ...prev, messageConfirmPassword: "Les mots de passe ne correspondent pas" }));
      setIsLoading(false);
      return;
    }

    try {
      const API = process.env.REACT_APP_API_URL || "http://localhost:3001";
      const result = await axios.post(`${API}/users/create`, info);

      if (result.status === 201) {
        openModal({
          type: "success",
          title: "Compte créé 🎉",
          message: result.data?.message || "Votre compte a été créé avec succès.",
          confirmText: "Aller à la connexion",
          showClose: false,
          onConfirm: () => {
            closeModal();
            navigate("/");
          },
        });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de la création du compte";
      setError((prev) => ({ ...prev, messageServer: msg }));

      openModal({
        type: "error",
        title: "Erreur",
        message: msg,
        confirmText: "Compris",
        showClose: false,
        onConfirm: () => closeModal(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthText = (strength) => {
    const texts = ["Très faible", "Faible", "Moyen", "Bon", "Très bon"];
    return texts[strength] || "Non évalué";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-green-500";
    return "bg-emerald-500";
  };

  const getStrengthTextColor = () => {
    if (passwordStrength <= 1) return "text-red-600";
    if (passwordStrength === 2) return "text-yellow-600";
    if (passwordStrength === 3) return "text-green-600";
    return "text-emerald-600";
  };

  return (
    <>
      <Modal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={modal.showClose ? closeModal : null}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
      />

      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Rejoignez Votify</h1>
            <p className="text-gray-600 text-sm">Créez votre compte et commencez à voter dès maintenant</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      error.messageNom ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onChange={(e) => setInfo((prev) => ({ ...prev, nom: e.target.value }))}
                    placeholder="Dupont"
                  />
                </div>
                {error.messageNom && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <X className="w-3 h-3 mr-1" />
                    {error.messageNom}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      error.messagePrenom ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onChange={(e) => setInfo((prev) => ({ ...prev, prenom: e.target.value }))}
                    placeholder="Jean"
                  />
                </div>
                {error.messagePrenom && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <X className="w-3 h-3 mr-1" />
                    {error.messagePrenom}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    error.messageEmail ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onChange={(e) => setInfo((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="jean.dupont@email.com"
                />
              </div>
              {error.messageEmail && (
                <div className="flex items-center text-red-600 text-xs mt-1">
                  <X className="w-3 h-3 mr-1" />
                  {error.messageEmail}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    error.messagePassword ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {info.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Sécurité</span>
                    <span className={`text-xs font-medium ${getStrengthTextColor()}`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-500`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {error.messagePassword && (
                <div className="flex items-center text-red-600 text-xs mt-1">
                  <X className="w-3 h-3 mr-1" />
                  {error.messagePassword}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    error.messageConfirmPassword ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onChange={(e) => setInfo((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Retapez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {info.password && info.confirmPassword && (
                <div
                  className={`flex items-center text-sm ${
                    info.password === info.confirmPassword ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {info.password === info.confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Les mots de passe correspondent
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Les mots de passe ne correspondent pas
                    </>
                  )}
                </div>
              )}

              {error.messageConfirmPassword && (
                <div className="flex items-center text-red-600 text-xs mt-1">
                  <X className="w-3 h-3 mr-1" />
                  {error.messageConfirmPassword}
                </div>
              )}
            </div>

            {error.messageServer && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-700 text-sm">{error.messageServer}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Créer mon compte
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm mb-3">Déjà membre de Votify ?</p>
              <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
