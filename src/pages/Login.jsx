import React, { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import Loader from "../components/Loader";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState({
    messageEmail: "",
    messagePassword: "",
    messageServer: ""
  });
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({
    email: "",
    password: ""
  });

  async function validerInfo(e) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+=-]{8,}$/;

    setError({
      messageEmail: "",
      messagePassword: "",
      messageServer: ""
    });

    if (info.email.trim() === "") {
      setError(prev => ({ ...prev, messageEmail: "L'email est requis" }));
      return;
    }
    if(!emailRegex.test(info.email)){
      setError(prev => ({ ...prev, messageEmail: "Format d'email invalide" }));
      return;
    }
    
    if (info.password.trim() === "") {
      setError(prev => ({ ...prev, messagePassword: "Le mot de passe est requis" }));
      return;
    }
    if(!passwordRegex.test(info.password)){
      setError(prev => ({ ...prev, messagePassword: "8 caractères minimum requis" }));
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post("http://localhost:3001/users/login", info);

      if (result.status === 200) {
        localStorage.setItem("token", result.data.token);
        navigate("/polls");
      }

    } catch (error) {
      setError(prev => ({
        ...prev,
        messageServer:
          error.response?.data?.message ||
          error.message ||
          "Erreur de connexion au serveur"
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
              Bienvenue sur Votify
            </h1>
            <p className="text-gray-500 text-sm">
              Connectez-vous à votre espace personnel
            </p>
          </div>

          <form className="space-y-6" onSubmit={validerInfo}>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                placeholder="exemple@email.com"
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error.messageEmail ? 'border-red-500' : 'border-gray-200'
                }`}
                onChange={(e) => setInfo(prev => ({ ...prev, email: e.target.value }))}
              />
              {error.messageEmail && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error.messageEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error.messagePassword ? 'border-red-500' : 'border-gray-200'
                }`}
                onChange={(e) => setInfo(prev => ({ ...prev, password: e.target.value }))}
              />
              {error.messagePassword && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error.messagePassword}
                </p>
              )}
            </div>

            {error.messageServer && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm text-center flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error.messageServer}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              Se connecter
            </button>

            <div className="text-center pt-4">
              <span className="text-gray-600 text-sm">
                Nouveau sur Votify ?{" "}
              </span>
              <Link 
                to="/create" 
                className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors duration-200"
              >
                Créer un compte
              </Link>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}