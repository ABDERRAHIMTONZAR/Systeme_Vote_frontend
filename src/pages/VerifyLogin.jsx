import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VotifyLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate=useNavigate()
  const handleLogin = () => {
    setIsLoading(true);
    // Simulation de processus de connexion
    setTimeout(() => {
      setIsLoading(false);
      // Ici, vous ajouteriez votre logique de connexion réelle
      navigate("/login")
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden relative">
      {/* Animation de fond avec particules */}
      <BackgroundAnimation />
      
      {/* Conteneur principal */}
      <div className="relative z-10 w-full max-w-md px-6 py-12 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        {/* En-tête */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Votify
          </h1>
          <p className="text-purple-200 text-lg font-medium">
            Plateforme de vote sécurisée
          </p>
          <p className="text-gray-300 mt-4 text-sm max-w-xs mx-auto">
            Connectez-vous pour participer aux votes et sondages en temps réel
          </p>
        </div>
        
        {/* Bouton de connexion */}
        <div className="space-y-6">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                <span>Se connecter avec Votify</span>
              </>
            )}
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm">
            Première fois sur Votify ?{' '}
            <a href="/create" className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Composant pour l'animation de fond
const BackgroundAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Particules animées */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-500/20"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 20 + 10}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      
      {/* Cercles animés supplémentaires */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`circle-${i}`}
          className="absolute rounded-full border-2 border-cyan-300/30"
          style={{
            width: `${Math.random() * 300 + 100}px`,
            height: `${Math.random() * 300 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `pulse ${Math.random() * 15 + 10}s infinite alternate`,
          }}
        />
      ))}
      
      {/* Styles pour les animations */}
      <style jsx="true">{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          33% {
            transform: translateY(-30px) translateX(20px) rotate(120deg);
          }
          66% {
            transform: translateY(20px) translateX(-20px) rotate(240deg);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default VotifyLogin;