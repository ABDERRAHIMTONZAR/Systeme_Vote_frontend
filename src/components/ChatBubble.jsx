import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import axios from "axios";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour 👋 Comment puis-je t’aider aujourd’hui ?" }
  ]);

  const [votedPolls, setVotedPolls] = useState([]);
  const token = localStorage.getItem("token");

  // Charger les sondages votés
  useEffect(() => {
    const fetchVoted = async () => {
      try {
        const res = await axios.get("http://localhost:3001/sondage/voted", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVotedPolls(res.data);
      } catch (err) {
        console.error("Erreur chargement votés :", err);
      }
    };
    fetchVoted();
  }, []);

  const sendBotReply = (reply) => {
    setMessages((prev) => [...prev, { from: "bot", text: reply }]);
  };

  const checkResults = () => {
    const finished = votedPolls.some(poll => poll.Etat === "finished");

    if (finished) {
      sendBotReply(
        "Le sondage où tu as voté est terminé 🎉 Tu peux voir les résultats dans *Mes Voted Polls*."
      );
    } else {
      sendBotReply(
        "Ton sondage n’est pas encore terminé ⏳ Tu pourras voir les résultats après la fin."
      );
    }
  };

  // Simulation d’envoi d’un email pour "Autre question"
  const sendSupportMessage = async () => {
    sendBotReply("Merci pour ta question ! 📩 Un message a été envoyé au support. Tu recevras une réponse rapidement.");

  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-16 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition z-50"
      >
        <FaRobot size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-32 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-50"
          >
            <div className="bg-blue-600 text-white p-3 font-semibold text-lg">
              Votify Assistant 🤖
            </div>

            <div className="p-3 h-64 overflow-y-auto space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[85%] ${
                    m.from === "bot"
                      ? "bg-blue-100 text-blue-900 self-start"
                      : "bg-gray-200 text-gray-900 self-end ml-auto"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="p-3 border-t grid grid-cols-1 gap-2 bg-gray-50">

              <button
                onClick={() =>
                  sendBotReply(
                    "Pour créer un sondage 📝 :\n1️⃣ Clique sur ton *Compte* en haut.\n2️⃣ Ouvre le *Sidebar*.\n3️⃣ Choisis *Créer Sondage*.\n4️⃣ Remplis ta question et tes options.\nEt voilà ✔️"
                  )
                }
                className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                Comment créer un sondage ?
              </button>


              <button
                onClick={() =>
                  sendBotReply(
                    "Pour voter 🗳️ :\n1️⃣ Va dans la page *Active Polls*.\n2️⃣ Clique sur *Vote Now*.\n3️⃣ Choisis l’option qui te convient.\n4️⃣ Clique sur *Valider*.\nTon vote est enregistré ✔️"
                  )
                }
                className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                Comment voter ?
              </button>

              <button
                onClick={checkResults}
                className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                Voir si mes résultats sont prêts
              </button>

              <button
                onClick={sendSupportMessage}
                className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                J’ai une autre question
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
