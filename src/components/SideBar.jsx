import React, { useState } from "react";
import { Menu, X, Filter, ChevronRight, Check } from "lucide-react";

export default function SideBar({ selected, setSelected }) {
  const [open, setOpen] = useState(false);

  const categories = [
    { value: "tech", label: "Technologie", icon: "💻" },
    { value: "sports", label: "Sports", icon: "⚽" },
    { value: "music", label: "Musique", icon: "🎵" },
    { value: "movies", label: "Films & Séries", icon: "🎬" },
    { value: "games", label: "Jeux vidéo", icon: "🎮" },
    { value: "education", label: "Éducation", icon: "📚" },
    { value: "food", label: "Nourriture", icon: "🍕" },
    { value: "other", label: "Autre", icon: "🌟" }
  ];

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-20 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
        aria-label={open ? "Fermer le filtre" : "Ouvrir le filtre"}
      >
        {open ? <X size={24} /> : <Filter size={24} />}
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:sticky lg:top-16 left-0 w-full max-w-xs lg:max-w-none
          bg-white border-r border-gray-200 shadow-2xl lg:shadow-none
          h-screen lg:h-[calc(100vh-4rem)] z-50
          p-5 lg:p-6 overflow-y-auto
          transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:w-64
        `}
      >
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Filter className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Catégories</h2>
              <p className="text-gray-600 text-sm">Filtrer les sondages</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Filter className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Catégories</h2>
            <p className="text-gray-600 text-sm">Filtrer les sondages</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Statut du filtre
          </h3>
          
          <div
            className={`cursor-pointer p-3 rounded-lg transition-all duration-300 flex items-center justify-between group ${
              selected === "All"
                ? "bg-blue-50 border-l-4 border-blue-600"
                : "hover:bg-gray-50"
            }`}
            onClick={() => {
              setSelected("All");
              setOpen(false);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelected("All");
                setOpen(false);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selected === "All" 
                  ? "bg-blue-600" 
                  : "bg-blue-100"
              }`}>
                <span className={`font-bold ${selected === "All" ? 'text-white' : 'text-blue-600'}`}>All</span>
              </div>
              <div>
                <div className="font-medium text-gray-800">Tous les sondages</div>
                <div className="text-sm text-gray-500">
                  {selected === "All" ? "Filtre actif" : "Afficher tout"}
                </div>
              </div>
            </div>
            {selected === "All" && (
              <div className="p-1 bg-blue-600 rounded-full">
                <Check size={16} className="text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Par catégorie
          </h3>
          
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.value}
                className={`cursor-pointer p-3 rounded-lg transition-all duration-300 flex items-center justify-between group ${
                  selected === cat.value
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSelected(cat.value);
                  setOpen(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelected(cat.value);
                    setOpen(false);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    selected === cat.value 
                      ? "bg-blue-100" 
                      : "bg-gray-100"
                  }`}>
                    {cat.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-800 truncate">{cat.label}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {selected === cat.value ? "Sélectionné" : "Cliquez pour filtrer"}
                    </div>
                  </div>
                </div>
                <div className={`transform transition-transform duration-300 ${
                  selected === cat.value ? "scale-100" : "scale-0 group-hover:scale-100"
                }`}>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Filtre actif</span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                {selected === "All" ? "Tous" : categories.find(c => c.value === selected)?.label}
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {selected === "All" 
                ? "Affichage de tous les sondages" 
                : `Filtré par "${categories.find(c => c.value === selected)?.label}"`
              }
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}