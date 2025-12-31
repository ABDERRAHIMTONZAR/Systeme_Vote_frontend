
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
    } catch { }
  }, [messages]);

  const endRef = useRef(null);
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

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
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/sondage/voted`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

    const safePolls = Array.isArray(votedPolls) ? votedPolls : [];

    // ✅ finished / Finished / FINISHED ...
    const finishedPolls = safePolls.filter((p) =>
      String(p?.Etat || "").toLowerCase().trim() === "finished"
    );

    if (finishedPolls.length === 0) {
      sendBotReply("Aucun sondage terminé pour le moment.");
      return;
    }

    // ✅ petit helper pour éviter les lignes énormes
    const truncate = (str, max = 60) => {
      const s = String(str ?? "");
      return s.length > max ? s.slice(0, max - 1) + "…" : s;
    };

    const list = finishedPolls
      .slice(0, 6)
      .map((p, index) => {
        const id =
          p?.Id_Sondage ?? p?.id_sondage ?? p?.idSondage ?? p?.IdSondage;

        const name = p?.question ?? p?.Question ?? `Sondage #${id ?? "?"}`;

        return `${index + 1}. ${truncate(name)}`;
      })
      .join("\n");

    sendBotReply(
      `Sondages terminés (${finishedPolls.length} au total) :\n${list}\n\nℹ️ Seuls 6 sondages sont affichés ici.\n👉 Consulte « Sondages votés » pour voir tous les résultats détaillés.`
    );
  };

  const resetChat = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { }
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
                fixed inset-0
                md:inset-auto md:bottom-24 md:right-6
                w-full md:w-80
                h-[100dvh] md:h-auto
                md:max-h-[75vh]
                bg-white
                rounded-none md:rounded-xl
                shadow-2xl border
                flex flex-col
                z-[9999]
                min-h-0
              "
            >
              <div className="bg-blue-600 text-white p-3 flex justify-between items-center shrink-0">
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

              <div className="flex-1 min-h-0 p-3 overflow-y-auto space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg max-w-[85%] whitespace-pre-line break-words break-all overflow-hidden ${m.from === "bot"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-200 ml-auto"
                      }`}
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              <div className="p-3 border-t bg-gray-50 grid gap-2 shrink-0">
                <button
                  onClick={() =>
                    sendBotReply("Compte → Sidebar → Créer sondage")
                  }
                  className="bg-blue-600 text-white py-2 rounded"
                >
                  Créer un sondage
                </button>

                <button
                  onClick={() =>
                    sendBotReply("Va dans sondage actifs → Vote Now")
                  }
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
