import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../components/Loader";

export default function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState("CREDENTIALS"); // "CREDENTIALS" | "OTP"
  const [preAuthToken, setPreAuthToken] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState({
    messageEmail: "",
    messagePassword: "",
    messageOtp: "",
    messageServer: "",
  });

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({ email: "", password: "" });

  async function validerInfo(e) {
    e.preventDefault();

    // reset errors
    setError({ messageEmail: "", messagePassword: "", messageOtp: "", messageServer: "" });

    // si on est à l'étape OTP → on vérifie le code
    if (step === "OTP") {
      if (!/^\d{6}$/.test(otp.trim())) {
        setError((prev) => ({ ...prev, messageOtp: "Code invalide (6 chiffres)" }));
        return;
      }

      try {
        setLoading(true);
        const res = await axios.post("http://localhost:3001/users/2fa/verify", {
          code: otp.trim(),
          preAuthToken,
        });

        localStorage.setItem("token", res.data.token);
        navigate("/polls");
      } catch (err) {
        setError((prev) => ({
          ...prev,
          messageServer:
            err.response?.data?.message || err.message || "Erreur serveur",
        }));
      } finally {
        setLoading(false);
      }
      return;
    }

    // sinon étape credentials (ton code existant)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+=-]{8,}$/;

    if (info.email.trim() === "") {
      setError((prev) => ({ ...prev, messageEmail: "L'email est requis" }));
      return;
    }
    if (!emailRegex.test(info.email)) {
      setError((prev) => ({ ...prev, messageEmail: "Format d'email invalide" }));
      return;
    }
    if (info.password.trim() === "") {
      setError((prev) => ({ ...prev, messagePassword: "Le mot de passe est requis" }));
      return;
    }
    if (!passwordRegex.test(info.password)) {
      setError((prev) => ({ ...prev, messagePassword: "8 caractères minimum requis" }));
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post("http://localhost:3001/users/login", info);

      // ✅ cas 1: pas de 2FA → token direct
      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        navigate("/polls");
        return;
      }

      // ✅ cas 2: 2FA activé → on passe à l'étape OTP
      if (result.data?.requires2fa && result.data?.preAuthToken) {
        setPreAuthToken(result.data.preAuthToken);
        setStep("OTP");
        return;
      }

      setError((prev) => ({ ...prev, messageServer: "Réponse serveur inattendue" }));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        messageServer:
          err.response?.data?.message || err.message || "Erreur de connexion au serveur",
      }));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError((prev) => ({ ...prev, messageServer: "" }));
    try {
      setLoading(true);
      await axios.post("http://localhost:3001/users/2fa/resend", { preAuthToken });
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
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === "OTP" ? "Vérification 2 étapes" : "Bienvenue sur Votify"}
            </h1>
            <p className="text-gray-500 text-sm">
              {step === "OTP"
                ? "Entrez le code reçu par email (6 chiffres)"
                : "Connectez-vous à votre espace personnel"}
            </p>
          </div>

          <form className="space-y-6" onSubmit={validerInfo}>
            {step === "CREDENTIALS" ? (
              <>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    placeholder="exemple@email.com"
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      error.messageEmail ? "border-red-500" : "border-gray-200"
                    }`}
                    onChange={(e) => setInfo((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  {error.messageEmail && (
                    <p className="text-red-500 text-xs mt-2">{error.messageEmail}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      error.messagePassword ? "border-red-500" : "border-gray-200"
                    }`}
                    onChange={(e) => setInfo((prev) => ({ ...prev, password: e.target.value }))}
                  />
                  {error.messagePassword && (
                    <p className="text-red-500 text-xs mt-2">{error.messagePassword}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* OTP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code de vérification (6 chiffres)
                  </label>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      error.messageOtp ? "border-red-500" : "border-gray-200"
                    }`}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                  {error.messageOtp && (
                    <p className="text-red-500 text-xs mt-2">{error.messageOtp}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("CREDENTIALS");
                      setOtp("");
                      setPreAuthToken("");
                      setError({ messageEmail: "", messagePassword: "", messageOtp: "", messageServer: "" });
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Retour
                  </button>

                  <button
                    type="button"
                    onClick={resendCode}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </>
            )}

            {error.messageServer && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm text-center">{error.messageServer}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              {step === "OTP" ? "Vérifier" : "Se connecter"}
            </button>

            {step === "CREDENTIALS" && (
              <div className="text-center pt-4">
                <span className="text-gray-600 text-sm">Nouveau sur Votify ? </span>
                <Link to="/create" className="text-blue-600 font-medium text-sm hover:text-blue-700">
                  Créer un compte
                </Link>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
