// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const LandingPage = () => {
  const features = [
    {
      title: "Rapide & Simple",
      description: "Interface intuitive qui permet de créer un sondage en moins d'une minute"
    },
    {
      title: "Sécurité Maximale",
      description: "Système de votes anonymes avec protection des données personnelles"
    },
    {
      title: "Analyses en Direct",
      description: "Visualisez les résultats en temps réel avec des graphiques interactifs"
    },
    {
      title: "Personnalisable",
      description: "Adaptez l'apparence à votre image avec nos outils de personnalisation"
    },
    {
      title: "Mobile First",
      description: "Design optimisé pour une expérience mobile parfaite"
    },
    {
      title: "Assistant IA",
      description: "Chatbot intelligent pour vous guider dans la création de vos sondages"
    }
  ];

  const team = [
    { 
      name: "ABDERRAHIM TONZAR", 
      role: "Développeur Full Stack",
      expertise: "React & Express JS",
      photo: "/AUBA.jpg"  
    },
    { 
      name: "ALI BELOUALI", 
      role: "Développeur Full Stack",
      expertise: "React & Express JS",
      photo: "/ali.jpg"  
    },
  ];

  const missionPoints = [
    {
      icon: "🎯",
      title: "Accessibilité",
      description: "Rendre la création de sondages accessible à tous, sans connaissances techniques"
    },
    {
      icon: "🔍",
      title: "Transparence",
      description: "Fournir des analyses claires et détaillées pour une prise de décision éclairée"
    },
    {
      icon: "🤝",
      title: "Collaboration",
      description: "Faciliter le dialogue et la prise de décision collective au sein des équipes"
    },
    {
      icon: "🚀",
      title: "Innovation",
      description: "Constamment améliorer notre plateforme avec les dernières technologies"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Votify
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium hover:font-semibold">Fonctionnalités</a>
              <a href="#mission" className="text-gray-700 hover:text-blue-600 transition-colors font-medium hover:font-semibold">Mission</a>
              <a href="#team" className="text-gray-700 hover:text-blue-600 transition-colors font-medium hover:font-semibold">Équipe</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30"></div>
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
           
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
              Créez des sondages
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  intelligents
                </span>
                <div className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full -rotate-1"></div>
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              Plateforme web innovante pour créer, analyser et partager des sondages en toute simplicité.
              Développée avec passion pour des décisions éclairées.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: "50+", label: "Sondages créés", desc: "Depuis le lancement" },
                { value: "100%", label: "Gratuit", desc: "Sans limitation" },
                { value: "0 bugs", label: "Stable", desc: "Version beta" },
                { value: "24h", label: "Support", desc: "Réponse rapide" }
              ].map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-semibold text-blue-600 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              NOTRE VISION
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Plus qu'une plateforme,
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                une mission
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nous croyons en la puissance de la démocratie numérique et de la prise de décision collective.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {missionPoints.map((point, index) => (
              <div 
                key={index} 
                className="group relative p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-4">{point.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-gray-600">{point.description}</p>
              </div>
            ))}
          </div>
          
          {/* Citation */}
          <div className="mt-16 max-w-3xl mx-auto p-8 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl border border-blue-100">
            <div className="text-center">
              <div className="text-4xl mb-4">"</div>
              <p className="text-gray-700 text-lg italic mb-6">
                Notre objectif est de démocratiser la prise de décision en ligne en fournissant 
                des outils simples mais puissants pour recueillir et analyser les opinions.
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">L'équipe Votify(Abderrahim et ALi)</div>
                  <div className="text-sm text-gray-600">Fondateurs & Développeurs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-4">
              FONCTIONNALITÉS
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Tout ce dont vous avez besoin
              <br />
              <span className="text-blue-600">en une plateforme</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des outils complets pour chaque étape de votre processus de sondage.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 pt-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-6 pt-6 border-t border-gray-100 group-hover:border-blue-200 transition-colors">

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium mb-4">
              NOTRE ÉQUIPE
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Les passionnés
              <br />
              <span className="text-indigo-600">derrière Votify</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deux développeurs passionnés qui ont décidé de créer la plateforme de sondages qu'ils voulaient utiliser.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div 
                key={index} 
                className="group relative p-8 bg-white rounded-3xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    {/* Avatar avec photo depuis public */}
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                      {member.photo ? (
                        <img 
                          src={member.photo}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center">
                                <span class="text-4xl font-bold text-white">${member.name.charAt(0)}</span>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full border-4 border-white flex items-center justify-center">
                      <span className="text-white text-sm">👨‍💻</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium mb-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {member.role}
                  </div>
                  <p className="text-gray-600 mb-4">{member.expertise}</p>
                  
                  <div className="flex gap-4 mt-4">
                    <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                      React
                    </div>
                    <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium">
                      Express.js
                    </div>
                    <div className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium">
                      MySQL
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA Final */}
          <div className="mt-16 max-w-3xl mx-auto p-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl shadow-xl">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-6">
                Prêt à créer votre premier sondage ?
              </h3>
              <p className="text-blue-100 mb-8 text-lg">
                Rejoignez-nous dès maintenant et découvrez comment Votify peut transformer votre prise de décision.
              </p>
              <Link 
                to="/login" 
                className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 hover:shadow-lg transition-all duration-300"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;