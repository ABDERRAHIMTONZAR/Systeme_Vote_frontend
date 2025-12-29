import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Key, ArrowLeft, CheckCircle, RefreshCw, Eye, EyeOff } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preAuthToken, setPreAuthToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Étape 1: Envoyer le code par email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("L'email est requis");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/forgot-password`, 
        { email }
      );
      
      if (response.data.preAuthToken) {
        setPreAuthToken(response.data.preAuthToken);
        setStep(2);
        setSuccess("Code de vérification envoyé à votre email");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  // Étape 2: Vérifier le code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Code invalide (6 chiffres requis)");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/verify-reset-code`, 
        {
          code: otp.trim(),
          preAuthToken,
        }
      );
      
      const { resetToken } = response.data;
      setResetToken(resetToken);
      setStep(3);
      setSuccess("Code vérifié avec succès");
    } catch (err) {
      setError(err.response?.data?.message || "Code incorrect");
    } finally {
      setLoading(false);
    }
  };

  // Étape 3: Réinitialiser le mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+=-]{8,}$/;

    if (!newPassword.trim()) {
      setError("Le nouveau mot de passe est requis");
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setError("Minimum 8 caractères requis");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/users/reset-password`, 
        {
          resetToken,
          newPassword,
        }
      );

      setSuccess("Mot de passe réinitialisé avec succès !");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  // Renvoyer le code
  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/users/2fa/resend`, 
        { preAuthToken }
      );
      setSuccess("Nouveau code envoyé !");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de renvoyer le code");
    } finally {
      setLoading(false);
    }
  };

  // Composant StepIndicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-medium ${
              step >= s 
                ? "bg-blue-600 border-blue-600 text-white" 
                : "bg-white border-gray-300 text-gray-500"
            }`}>
              {s}
            </div>
            <div className="text-xs mt-2 text-gray-600">
              {s === 1 && "Email"}
              {s === 2 && "Code"}
              {s === 3 && "Mot de passe"}
            </div>
          </div>
          {s < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step > s ? "bg-blue-500" : "bg-gray-300"
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-4 py-8 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {step === 1 && "Mot de passe oublié"}
            {step === 2 && "Vérification"}
            {step === 3 && "Nouveau mot de passe"}
          </h1>
          
          <p className="text-gray-600 text-sm">
            {step === 1 && "Entrez votre email pour recevoir un code"}
            {step === 2 && "Entrez le code reçu par email"}
            {step === 3 && "Créez votre nouveau mot de passe"}
          </p>
        </div>

        {/* Indicateur de progression amélioré */}
        <StepIndicator />

        {/* Formulaire selon l'étape */}
        <form onSubmit={
          step === 1 ? handleSendCode :
          step === 2 ? handleVerifyCode :
          handleResetPassword
        } className="space-y-6">
          
          {/* Étape 1: Email */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="exemple@email.com"
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Nous vous enverrons un code de vérification à cette adresse email.
              </div>
            </div>
          )}

          {/* Étape 2: Code OTP */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Code de vérification (6 chiffres)
                </label>
                <div className="relative">
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="123456"
                  />
                </div>
                
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-600">
                    Code envoyé à <span className="font-medium">{email}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Retour
                </button>
                
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 flex items-center transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Renvoyer le code
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Nouveau mot de passe */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Minimum 8 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Retapez votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {newPassword && confirmPassword && (
                  <p className={`text-sm mt-2 flex items-center ${
                    newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Les mots de passe correspondent
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 mr-1 flex items-center justify-center">✗</div>
                        Les mots de passe ne correspondent pas
                      </>
                    )}
                  </p>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                Assurez-vous que votre mot de passe comporte au moins 8 caractères.
              </div>
            </div>
          )}

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
                  <span className="text-red-600 text-sm">!</span>
                </div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-700 text-sm">{success}</p>
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
                {step === 1 && "Envoi en cours..."}
                {step === 2 && "Vérification..."}
                {step === 3 && "Réinitialisation..."}
              </>
            ) : (
              <>
                {step === 1 && "Envoyer le code"}
                {step === 2 && "Vérifier le code"}
                {step === 3 && "Réinitialiser le mot de passe"}
              </>
            )}
          </button>

          {/* Lien vers la connexion */}
          <div className="text-center pt-4 border-t border-gray-200">
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}