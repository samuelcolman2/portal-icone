import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { askGemini } from '../services/geminiService';
import { PaperAirplaneIcon } from './IconComponents';

const GeminiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await askGemini(input);
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      setError('Desculpe, não foi possível obter uma resposta. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };


  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col h-[600px]">
      <div className="flex-grow overflow-y-auto pr-4 -mr-4 mb-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none px-4 py-2">
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-auto flex items-center space-x-2 border-t border-gray-200 dark:border-slate-700 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Pergunte algo sobre a empresa..."
          className="flex-grow p-3 border border-gray-300 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || input.trim() === ''}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default GeminiAssistant;