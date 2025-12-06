import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        
        <h1 className="text-8xl font-bold text-blue-600">404</h1>

        <h2 className="text-3xl font-semibold mt-4">
          Oups ! Page introuvable 😢
        </h2>

        <p className="text-gray-600 mt-2 max-w-md">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retour à l'accueil
        </button>
      </div>

      <Footer />
    </div>
  );
}
