import React from "react";
import { ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function AboutVotify() {
  return (
    <section className="w-full max-w-3xl mx-auto mt-8">
      <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                À propos de <span className="text-blue-600">Votify</span>
              </h2>
              <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
                Votify est une plateforme moderne de sondages en temps réel.
                Créez, votez et visualisez les résultats instantanément, dans une
                expérience simple, rapide et sécurisée.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Feature
              icon={<Zap className="h-4 w-4 text-slate-700" />}
              title="Temps réel"
              desc="Votes + résultats instantanés"
            />
            <Feature
              icon={<BarChart3 className="h-4 w-4 text-slate-700" />}
              title="Clair"
              desc="Interface clean et lisible"
            />
            <Feature
              icon={<ShieldCheck className="h-4 w-4 text-slate-700" />}
              title="Sécurisé"
              desc="Accès protégé & données fiables"
            />
          </div>

          {/* Optionnel: petits liens footer */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">
              ✅ Création rapide
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">
              ✅ Vote simple
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">
              ✅ Résultats immédiats
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-100">
          {icon}
        </div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      <p className="mt-2 text-xs sm:text-sm text-slate-600">{desc}</p>
    </div>
  );
}
