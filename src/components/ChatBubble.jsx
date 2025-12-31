import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaTimes } from "react-icons/fa";
import axios from "axios";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const STORAGE_KEY = "votify_chat_history";
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : [{ from: "bot", text: "Bonjour Comment puis-je t'aider?" }];
    } catch {
      return [{ from: "bot", text: "Bonjour Comment puis-je t'aider?" }];
    }
  });

  const [votedPolls, setVotedPolls] = useState([]);
  const [loadingVoted, setLoadingVoted] = useState(false);

  const token = localStorage.getItem("token");
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const endRef = useRef(null);
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendBotReply = (text) => {
    setMessages((prev) => [...prev, { from: "bot", text }]);
  };

  const fetchVotedPolls = async () => {
    if (!token) {
      setVotedPolls([]);
      return;
    }

    setLoadingVoted(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/sondage/voted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVotedPolls(res.data || []);
    } catch (e) {
      setVotedPolls([]);
      sendBotReply("Impossible de charger tes sondages votés pour le moment.");
    } finally {
      setLoadingVoted(false);
    }
  };

  useEffect(() => {
    fetchVotedPolls();
  }, [token]);

  const checkResults = () => {
    if (!token) {
      sendBotReply("Connecte-toi d'abord pour voir tes résultats.");
      return;
    }

    if (loadingVoted) {
      sendBotReply("Je vérifie tes sondages votés...");
      return;
    }

    const finishedPolls = votedPolls.filter((p) => p?.Etat === "finished");

    if (finishedPolls.length === 0) {
      sendBotReply("Aucun sondage terminé pour le moment.");
      return;
    }

    const list = finishedPolls
      .slice(0, 6) 
      .map((p, index) => {
        const id =
          p?.Id_Sondage ?? p?.id_sondage ?? p?.idSondage ?? p?.IdSondage;

        const name =
          p?.question ?? p?.Question ?? `Sondage #${id ?? "?"}`;

        return `${index + 1}. ${name}`;
      })
      .join("\n");

    sendBotReply(
      `Sondages terminés (${finishedPolls.length}) :\n${list}\n\n=> Consulte « Mes Voted Polls » pour voir les résultats détaillés.`
    );
  };

  const resetChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([{ from: "bot", text: "Bonjour Comment puis-je t'aider?" }]);
  };

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="
          fixed bottom-4 right-4
          md:bottom-6 md:right-6
          bg-blue-600 text-white
          p-4 rounded-full shadow-xl
          hover:bg-blue-700 transition
          z-[9999]
        "
        aria-label="Ouvrir / fermer le chat"
      >
        {open ? <FaTimes size={22} /> : <FaRobot size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
            />

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
              <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
                <span>Votify Assistant</span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={resetChat}
                    className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
                    title="Réinitialiser"
                  >
                    Reset
                  </button>

                  <button onClick={() => setOpen(false)} aria-label="Fermer">
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg max-w-[85%] whitespace-pre-line ${
                      m.from === "bot"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-200 ml-auto"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              <div className="p-3 border-t bg-gray-50 grid gap-2">
                <button
                  onClick={() =>
                    sendBotReply("Compte → Sidebar → Créer sondage")
                  }
                  className="bg-blue-600 text-white py-2 rounded"
                >
                  Créer un sondage
                </button>

                <button
                  onClick={() => sendBotReply("Va dans sondage actifs → Vote Now")}
                  className="bg-blue-600 text-white py-2 rounded"
                >
                  Comment voter
                </button>

                <button
                  onClick={checkResults}
                  className="bg-blue-600 text-white py-2 rounded disabled:opacity-60"
                  disabled={!token}
                  title={!token ? "Connecte-toi pour voir tes résultats" : ""}
                >
                  {loadingVoted ? "Chargement..." : "Mes résultats"}
                </button>

                <button
                  onClick={() => sendBotReply("Message envoyé au support")}
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
