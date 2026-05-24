import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, ChevronDown } from 'lucide-react';

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis Nawras, votre assistant voyage expert et passionné. Comment puis-je vous aider à découvrir votre prochaine destination de rêve ? 🌍",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Empêche le scroll du body
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessageText = inputMessage.trim();
    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages
            .filter(m => m.id !== 1)
            .map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            }))
            .concat({ role: 'user', content: userMessageText })
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const data = await response.json();
      const botResponseText = data.choices?.[0]?.message?.content ||
                             "Désolé, je n'ai pas pu obtenir de réponse.";

      const botResponse = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('Chat Error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "Oups ! Je n'arrive pas à contacter mon cerveau de voyage. Une erreur de connexion s'est produite. Veuillez réessayer.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Overlay sombre pour mobile - cliquable pour fermer */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 sm:hidden"
        onClick={onClose}
      />
      
      {/* Container principal - TOUJOURS en popup, jamais plein écran */}
      <div className="
        fixed z-50 flex flex-col
        /* Mobile : popup centré, pas plein écran ! */
        inset-x-2 bottom-2 top-[10vh]
        /* SM+ : popup classique en bas à droite */
        sm:inset-auto sm:bottom-4 sm:right-4 sm:top-auto
        sm:w-[380px] md:w-[400px]
        sm:h-[500px] md:h-[550px]
        /* Hauteur max pour ne jamais dépasser l'écran */
        max-h-[85vh]
        /* Styles */
        bg-white rounded-2xl shadow-2xl
        border border-[#e0dcd4]
        overflow-hidden
      ">
        {/* Header - bouton fermeture TOUJOURS visible */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-[#e0dcd4] bg-gradient-to-r from-[#2d7a5a] to-[#1a4a36] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#2d7a5a]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Nawras</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-[10px] text-white/90">En ligne</span>
              </div>
            </div>
          </div>
          
          {/* Bouton fermeture bien visible */}
          <button 
            onClick={onClose}
            className="text-white/90 hover:text-white hover:bg-white/20 transition-all p-2 rounded-full"
            aria-label="Fermer le chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-[#f7f5f0] min-h-0">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[90%] sm:max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                  message.sender === 'user' ? 'bg-[#e0dcd4] text-[#6b8f7b]' : 'bg-[#2d7a5a] text-white font-bold'
                }`}>
                  {message.sender === 'user' ? <User className="w-3 h-3" /> : 'V'}
                </div>
                <div className={`p-2.5 sm:p-3 rounded-2xl text-sm leading-relaxed ${
                  message.sender === 'user'
                    ? 'bg-[#2d7a5a] text-white rounded-tr-none'
                    : 'bg-white text-[#1a4a36] rounded-tl-none border border-[#e0dcd4]'
                }`}>
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className={`text-[9px] mt-1 opacity-60 ${message.sender === 'user' ? 'text-white/80' : 'text-[#6b8f7b]'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-[#e0dcd4] flex items-center justify-center">
                <Bot className="w-3 h-3 text-[#2d7a5a]" />
              </div>
              <div className="bg-white border border-[#e0dcd4] p-2.5 sm:p-3 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#6b8f7b] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#6b8f7b] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-[#6b8f7b] rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-[#e0dcd4] flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Où voulez-vous aller ?"
              className="flex-1 bg-[#f7f5f0] border border-[#e0dcd4] rounded-full py-2.5 px-4 text-sm text-[#1a4a36] placeholder-[#6b8f7b] focus:outline-none focus:border-[#2d7a5a] focus:ring-2 focus:ring-[#2d7a5a]/20 transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="bg-[#2d7a5a] text-white p-2.5 rounded-full hover:bg-[#1a4a36] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Chatbot;

