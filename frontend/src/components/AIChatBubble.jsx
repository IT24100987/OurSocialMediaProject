import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { MdChatBubbleOutline, MdClose, MdSend, MdAutoAwesome } from 'react-icons/md';

// 💡 Beginner Note: This component acts like a floating drawer on every page.
// It manages its own state (isOpen) and talks directly to the Claude AI backend.

const AIChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m your SpotOn CMS AI assistant. I can help you with:\n\n• Client management and package inquiries\n• Task tracking and calendar features\n• User roles and permissions\n• Payment and analytics questions\n• System navigation and guidance\n\nHow can I assist you with SpotOn CMS today?' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);
  const clearChat = () => setMessages([{ role: 'assistant', text: 'Chat cleared. I\'m ready to help with any SpotOn CMS questions!' }]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // 1. Add User Message
    const userMsg = prompt.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setPrompt('');
    setIsTyping(true);

    try {
      // 2. Call backend AI endpoint
      const { data } = await api.post('/ai/chat', { prompt: userMsg });
      
      // 3. Add AI Message
      setMessages((prev) => [...prev, { role: 'assistant', text: data.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I encountered an error connecting to my brain! Please try again later.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 🔵 Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl z-40 transform transition-transform flex items-center justify-center ${
          isOpen ? 'scale-0' : 'scale-100 hover:scale-110'
        }`}
      >
        <MdChatBubbleOutline size={28} />
      </button>

      {/* 📝 Chat Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <MdAutoAwesome className="text-yellow-300" size={24} />
            <h2 className="font-bold text-lg tracking-wide">System AI Assistant</h2>
          </div>
          <button onClick={toggleChat} className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors">
            <MdClose size={24} />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border text-slate-700 rounded-tl-none border-slate-200'
                }`}
              >
                {/* Parse basic newlines for better AI formatting */}
                {m.text.split('\n').map((str, i) => <p key={i} className="mb-1">{str}</p>)}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <button onClick={clearChat} className="text-xs text-slate-400 hover:text-slate-600 underline">
              Clear History
            </button>
          </div>
          <form onSubmit={handleSend} className="flex space-x-2">
             <input
                type="text"
                placeholder="Ask about SpotOn CMS features..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             />
             <button
               type="submit"
               disabled={!prompt.trim() || isTyping}
               className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <MdSend size={20} />
             </button>
          </form>
        </div>
      </div>
      
      {/* Overlay to dim background when drawer is open on smaller screens */}
      {isOpen && (
         <div 
           className="fixed inset-0 bg-black bg-opacity-10 z-30 transition-opacity xl:hidden"
           onClick={toggleChat}
         />
      )}
    </>
  );
};

export default AIChatBubble;
