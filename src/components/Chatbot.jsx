import Chatbot from "react-chatbot-kit";
import config from "../chatbot/config";
import MessageParser from "../chatbot/MessageParser";
import ActionProvider from "../chatbot/ActionProvider";

export default function VotifyChat() {
  return (
    <div className="fixed bottom-16 right-6 z-50">
      <Chatbot 
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
}
