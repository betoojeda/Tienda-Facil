import React, { useState } from 'react';
import { Sale, Product } from '../types';
import { analyzeBusiness } from '../services/geminiService';
import { Send, Sparkles, Loader2, User, Bot } from 'lucide-react';

interface AIAssistantProps {
  sales: Sale[];
  products: Product[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ sales, products }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu consultor de negocios virtual. Puedo analizar tus ventas, sugerir mejoras para el inventario o darte ideas de marketing. ¿En qué te ayudo hoy?' }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await analyzeBusiness(sales, products, userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Hubo un error al procesar tu solicitud.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="text-indigo-600" />
          Asistente IA
        </h1>
        <p className="text-slate-500">Consulta inteligente sobre tu negocio</p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'}
              `}>
                <div className="flex items-center gap-2 mb-1 opacity-75 text-xs font-bold uppercase tracking-wide">
                  {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                  <span>{msg.role === 'user' ? 'Tú' : 'IA'}</span>
                </div>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span className="text-sm text-slate-500">Analizando datos...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-slate-50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: ¿Qué producto se vende más los viernes?"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Send size={20} />
            </button>
          </form>
          {!process.env.API_KEY && (
             <p className="text-xs text-red-500 mt-2 text-center">
               Nota: Se requiere API Key de Gemini en process.env.API_KEY para que funcione.
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;