import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateAccount() {
  const navigate = useNavigate();

  const [error, setError] = useState({
    messageNom: "",
    messagePrenom: "",
    messageEmail: "",
    messagePassword: "",
    messageConfirmPassword: "",
    messageServer: ""
  });

  const [info, setInfo] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);

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
      messageServer: ""
    });

    if (info.nom.trim() === "") {
      setError(prev => ({ ...prev, messageNom: "Le nom est requis" }));
      setIsLoading(false);
      return;
    }

    if (info.prenom.trim() === "") {
      setError(prev => ({ ...prev, messagePrenom: "Le prénom est requis" }));
      setIsLoading(false);
      return;
    }

    if (info.email.trim() === "") {
      setError(prev => ({ ...prev, messageEmail: "L'email est requis" }));
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(info.email)) {
      setError(prev => ({ ...prev, messageEmail: "Format email incorrect" }));
      setIsLoading(false);
      return;
    }

    if (info.password.trim() === "") {
      setError(prev => ({ ...prev, messagePassword: "Le mot de passe est requis" }));
      setIsLoading(false);
      return;
    }

    if (info.confirmPassword.trim() === "") {
      setError(prev => ({ ...prev, messageConfirmPassword: "La confirmation est requise" }));
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(info.password)) {
      setError(prev => ({ ...prev, messagePassword: "Minimum 8 caractères" }));
      setIsLoading(false);
      return;
    }

    if (info.password !== info.confirmPassword) {
      setError(prev => ({ ...prev, messageConfirmPassword: "Les mots de passe ne correspondent pas" }));
      setIsLoading(false);
      return;
    }

    try {
      let result = await axios.post(`${process.env.REACT_APP_API_URL}/users/create`, info);

      if (result.status === 201) {
        alert(result.data.message);
        navigate("/");
      }

    } catch(error) {
      setError(prev => ({
        ...prev,
        messageServer: error?.response?.data?.message
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Créer un compte dans Votify
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Rejoignez-nous dès aujourd'hui
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error.messageNom ? 'border-red-500' : 'border-gray-200'
                }`}
                onChange={(e) => setInfo(prev => ({ ...prev, nom: e.target.value }))}
                placeholder="Votre nom"
              />
              {error.messageNom && <p className="text-red-500 text-xs mt-1">{error.messageNom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error.messagePrenom ? 'border-red-500' : 'border-gray-200'
                }`}
                onChange={(e) => setInfo(prev => ({ ...prev, prenom: e.target.value }))}
                placeholder="Votre prénom"
              />
              {error.messagePrenom && <p className="text-red-500 text-xs mt-1">{error.messagePrenom}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error.messageEmail ? 'border-red-500' : 'border-gray-200'
              }`}
              onChange={(e) => setInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemple.com"
            />
            {error.messageEmail && <p className="text-red-500 text-xs mt-1">{error.messageEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error.messagePassword ? 'border-red-500' : 'border-gray-200'
              }`}
              onChange={(e) => setInfo(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Minimum 8 caractères"
            />
            {error.messagePassword && <p className="text-red-500 text-xs mt-1">{error.messagePassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error.messageConfirmPassword ? 'border-red-500' : 'border-gray-200'
              }`}
              onChange={(e) => setInfo(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirmez votre mot de passe"
            />
            {error.messageConfirmPassword && <p className="text-red-500 text-xs mt-1">{error.messageConfirmPassword}</p>}
          </div>

          {error.messageServer && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm text-center">{error.messageServer}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02]'
            } text-white shadow-lg`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                Création en cours...
              </div>
            ) : (
              "Créer mon compte"
            )}
          </button>

          <div className="text-center pt-4">
            <span className="text-gray-600 text-sm">Déjà un compte ? </span>
            <Link 
              to="/" 
              className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors duration-200"
            >
              Se connecter
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}