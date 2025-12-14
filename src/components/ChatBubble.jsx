import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import axios from "axios";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour 👋 Comment puis-je t’aider ?" }
  ]);

  const [votedPolls, setVotedPolls] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:3001/sondage/voted", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setVotedPolls(res.data))
      .catch(() => {});
  }, []);

  const sendBotReply = (text) => {
    setMessages(prev => [...prev, { from: "bot", text }]);
  };

  const checkResults = () => {
    const finished = votedPolls.some(p => p.Etat === "finished");
    sendBotReply(
      finished
        ? "🎉 Un sondage est terminé. Voir résultats dans *Mes Voted Polls*."
        : "⏳ Aucun sondage terminé pour le moment."
    );
  };

  return (
    <>
      {/* BOUTON */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-4 right-4
          md:bottom-6 md:right-6
          bg-blue-600 text-white
          p-4 rounded-full shadow-xl
          hover:bg-blue-700 transition
          z-[9999]
        "
      >
        <FaRobot size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP MOBILE */}
            <div
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
            />

            {/* CHAT */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="
                fixed bottom-0 right-0
                md:bottom-24 md:right-6
                w-full md:w-80
                h-[90vh] md:h-auto
                bg-white
                rounded-t-xl md:rounded-xl
                shadow-2xl border
                flex flex-col
                z-[9999]
              "
            >
              {/* HEADER */}
              <div className="bg-blue-600 text-white p-3 flex justify-between">
                <span>Votify Assistant 🤖</span>
                <button onClick={() => setOpen(false)}>✕</button>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg max-w-[85%] ${
                      m.from === "bot"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-200 ml-auto"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="p-3 border-t bg-gray-50 grid gap-2">
                <button
                  onClick={() => sendBotReply("📝 Compte → Sidebar → Créer sondage")}
                  className="bg-blue-600 text-white py-2 rounded"
                >
                  Créer un sondage
                </button>

                <button
                  onClick={() => sendBotReply("🗳️ Active Polls → Vote Now")}
                  className="bg-blue-600 text-white py-2 rounded"
                >
                  Comment voter
                </button>

                <button
                  onClick={checkResults}
                  className="bg-blue-600 text-white py-2 rounded"
                >
                  Mes résultats
                </button>

                <button
                  onClick={() => sendBotReply("📩 Message envoyé au support")}
                  className="bg-blue-600 text-white py-2 rounded"
                >
                  Support
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
