
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../App';
import { getAIResponse } from '../services/geminiService';

const AIPathChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([
    { role: 'model', content: `أهلاً بكِ يا ${user?.name.split(' ')[0]}، أنا رفيقتكِ 'نستلي'. أنا هنا لأسمعكِ وأدعمكِ في أي وقت. كيف حالكِ اليوم؟` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const response = await getAIResponse(user, userMsg, messages);
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-pink-500 text-white rounded-tr-none' 
                : 'glass bg-white text-gray-800 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass bg-white p-4 rounded-3xl rounded-tl-none flex gap-1 items-center">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-4 glass p-2 rounded-3xl flex items-center gap-2 border border-white">
        <input 
          type="text"
          className="flex-1 bg-transparent p-3 outline-none text-gray-700"
          placeholder="تكلمي معي..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50"
        >
          <i className="fa-solid fa-paper-plane transform -rotate-45"></i>
        </button>
      </div>
    </div>
  );
};

export default AIPathChat;
