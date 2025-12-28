import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function SideBar({ selected, setSelected }) {
  const [open, setOpen] = useState(false);

  const categories = [
    { value: "tech", label: "Technologie" },
    { value: "sports", label: "Sports" },
    { value: "music", label: "Musique" },
    { value: "movies", label: "Films & Séries" },
    { value: "games", label: "Jeux vidéo" },
    { value: "education", label: "Éducation" },
    { value: "food", label: "Nourriture" },
    { value: "other", label: "Autre" },
  ];

  // Optionnel : fermer avec ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const itemClass = (value) =>
    `cursor-pointer p-2 rounded-lg font-medium transition ${
      selected === value ? "bg-blue-500 text-white shadow" : "hover:bg-gray-200"
    }`;

  return (
    <>
      {/* Bouton toggle (mobile seulement) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden fixed left-4 top-[4.5rem] z-[60] bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition"
        aria-label="Toggle sidebar"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[55]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`
          fixed md:static top-16 left-0 w-64
          h-[calc(100vh-4rem)] md:h-auto
          bg-white border-r shadow-xl md:shadow-none
          p-5 overflow-y-auto z-[60] md:z-auto
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <h2 className="text-xl font-bold mb-4">Filtrer par catégorie</h2>

        <ul className="space-y-3 pb-6">
          <li
            className={itemClass("All")}
            onClick={() => {
              setSelected("All");
              setOpen(false);
            }}
          >
            Tous
          </li>

          {categories.map((cat) => (
            <li
              key={cat.value}
              className={itemClass(cat.value)}
              onClick={() => {
                setSelected(cat.value);
                setOpen(false);
              }}
            >
              {cat.label}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
