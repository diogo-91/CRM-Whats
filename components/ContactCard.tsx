import React, { useState } from 'react';
import { Contact } from '../types';
import { MoreHorizontal, User, Tag as TagIcon, Bot, Copy, Check } from 'lucide-react';
import { generateResponseSuggestion } from '../services/geminiService';

interface ContactCardProps {
  contact: Contact;
  onDragStart: () => void;
  onClick: (contact: Contact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onDragStart, onClick }) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAiAssist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (suggestion) {
      setSuggestion(null);
      setCopied(false);
      return;
    }

    setLoading(true);
    const result = await generateResponseSuggestion(contact.name, contact.lastMessagePreview || "Olá");
    setSuggestion(result);
    setLoading(false);
  };

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        // Set drag image or data if needed, but App state handles logic
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onClick={() => onClick(contact)}
      className="bg-white p-3 rounded-lg shadow-sm border-l-[3px] border-l-transparent hover:border-l-emerald-500 transition-all cursor-grab active:cursor-grabbing group relative mb-2 select-none"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={contact.avatarUrl}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-100 pointer-events-none"
            />
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-gray-700 truncate max-w-[120px] leading-tight">
              {contact.name}
            </h3>
            {contact.lastMessagePreview && (
              <span className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[110px]">{contact.lastMessagePreview}</span>
            )}
            {!contact.lastMessagePreview && (
              <span className="text-[10px] text-gray-400 mt-0.5">{contact.phone}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-400 mb-1">{contact.lastMessageTime}</span>
          {contact.unreadCount > 0 && (
            <div className="bg-[#25D366] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
              {contact.unreadCount}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 border-dashed">
        <div className="flex items-center space-x-1">
          {contact.tags.map((tag, idx) => (
            <div key={idx} className={`w-2 h-2 rounded-full shadow-sm ${tag.color === 'red' ? 'bg-red-500' : tag.color === 'green' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          ))}
          {contact.tags.length === 0 && <span className="text-[9px] text-gray-300 italic">Sem tags</span>}
        </div>

        <div className="flex items-center space-x-1 bg-gray-50 px-2 py-0.5 rounded text-gray-600 border border-gray-100">
          <User size={10} className="text-gray-500" />
          <span className="text-[9px] font-medium">{contact.assignedTo}</span>
        </div>

        <div className="flex items-center">
          <button
            onClick={handleAiAssist}
            className={`p-1.5 rounded-full hover:bg-purple-50 mr-1 transition-all ${loading ? 'animate-pulse bg-purple-100' : ''}`}
            title={suggestion ? "Fechar sugestão" : "Gerar resposta com IA"}
          >
            <Bot size={14} className={suggestion ? "text-purple-600" : "text-gray-400"} />
          </button>
          <MoreHorizontal size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
      </div>

      {/* AI Suggestion Popover */}
      {suggestion && (
        <div className="mt-2 bg-gradient-to-r from-purple-50 to-white p-2 rounded text-[10px] text-purple-900 border border-purple-100 animate-in fade-in slide-in-from-top-1 shadow-inner relative group/ai">
          <div className="flex justify-between items-center mb-1">
            <p className="font-bold flex items-center gap-1 text-[9px] uppercase tracking-wide text-purple-700">
              <Bot size={10} /> Sugestão Gemini
            </p>
            <button
              onClick={(e) => copyToClipboard(e, suggestion)}
              className="p-1 hover:bg-purple-100 rounded text-purple-600 transition-colors"
              title="Copiar texto"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
            </button>
          </div>
          <p className="italic text-gray-700 leading-relaxed pr-4">"{suggestion}"</p>
        </div>
      )}
    </div>
  );
};

export default ContactCard;