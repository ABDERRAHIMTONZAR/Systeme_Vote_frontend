import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState("CREDENTIALS"); // "CREDENTIALS" | "OTP"
  const [preAuthToken, setPreAuthToken] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState({
    messageEmail: "",
    messagePassword: "",
    messageOtp: "",
    messageServer: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function validerInfo(e) {
    e.preventDefault();
    setError({ messageEmail: "", messagePassword: "", messageOtp: "", messageServer: "" });

    // Étape OTP
    if (step === "OTP") {
      if (!/^\d{6}$/.test(otp.trim())) {
        setError((prev) => ({ ...prev, messageOtp: "Code invalide (6 chiffres requis)" }));
        return;
      }

      try {
        setLoading(true);
        const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/users/2fa/verify`, {
          code: otp.trim(),
          preAuthToken,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userEmail", email);
        navigate("/polls");
      } catch (err) {
        setError((prev) => ({
          ...prev,
          messageServer: err.response?.data?.message || "Code incorrect. Veuillez réessayer.",
        }));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Étape Credentials
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+=-]{8,}$/;

    if (!email.trim()) {
      setError((prev) => ({ ...prev, messageEmail: "L'email est requis" }));
      return;
    }
    if (!emailRegex.test(email)) {
      setError((prev) => ({ ...prev, messageEmail: "Format d'email invalide" }));
      return;
    }
    if (!password.trim()) {
      setError((prev) => ({ ...prev, messagePassword: "Le mot de passe est requis" }));
      return;
    }
    if (!passwordRegex.test(password)) {
      setError((prev) => ({ ...prev, messagePassword: "8 caractères minimum requis" }));
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/users/login`, { email, password });

      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("userEmail", email);
        navigate("/polls");
        return;
      }

      if (result.data?.requires2fa && result.data?.preAuthToken) {
        setPreAuthToken(result.data.preAuthToken);
        setStep("OTP");
        return;
      }

      setError((prev) => ({ ...prev, messageServer: "Réponse serveur inattendue" }));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        messageServer: err.response?.data?.message || "Email ou mot de passe incorrect",
      }));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError((prev) => ({ ...prev, messageServer: "" }));
    try {
      setLoading(true);
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/users/2fa/resend`, { preAuthToken });
      setError((prev) => ({ ...prev, messageServer: "Nouveau code envoyé ! Vérifiez vos emails." }));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        messageServer: err.response?.data?.message || "Impossible de renvoyer le code",
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {step === "OTP" ? "Vérification en 2 étapes" : "Connexion à Votify"}
          </h1>
          <p className="text-gray-600 text-sm">
            {step === "OTP"
              ? "Entrez le code à 6 chiffres envoyé à votre adresse email"
              : "Connectez-vous pour participer aux votes"}
          </p>
        </div>

        <form className="space-y-6" onSubmit={validerInfo}>
          {step === "CREDENTIALS" ? (
            <>
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="exemple@email.com"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      error.messageEmail ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error.messageEmail && (
                  <p className="text-red-600 text-sm mt-1">{error.messageEmail}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      error.messagePassword ? "border-red-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </button>
                </div>
                {error.messagePassword && (
                  <p className="text-red-600 text-sm mt-1">{error.messagePassword}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* OTP */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    Code envoyé à <span className="font-medium text-blue-600">{email}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-center">
                    Code de vérification
                  </label>
                  <div className="relative">
                    <input
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      className={`w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                        error.messageOtp ? "border-red-500" : "border-gray-200"
                      }`}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                    {error.messageOtp && (
                      <p className="text-red-600 text-sm mt-2 text-center">{error.messageOtp}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("CREDENTIALS");
                      setOtp("");
                      setPreAuthToken("");
                      setError({ messageEmail: "", messagePassword: "", messageOtp: "", messageServer: "" });
                    }}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour
                  </button>

                  <button
                    type="button"
                    onClick={resendCode}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Renvoyer le code
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Message d'erreur/succès */}
          {error.messageServer && (
            <div className={`rounded-lg p-4 border ${
              error.messageServer.includes("envoyé") 
                ? "bg-green-50 border-green-200 text-green-700" 
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <div className="flex items-center">
                <p className="text-sm">{error.messageServer}</p>
              </div>
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {step === "OTP" ? "Vérification..." : "Connexion..."}
              </>
            ) : (
              <>
                {step === "OTP" ? "Vérifier et continuer" : "Se connecter"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {step === "CREDENTIALS" && (
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm mb-3">
                Nouveau sur Votify ?
              </p>
              <Link 
                to="/create" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
              >
                Créer un compte gratuitement
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}