import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_DATA } from '../constants';
import { Contact } from '../types';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, Check, CheckCheck, Bot } from 'lucide-react';
import { generateResponseSuggestion } from '../services/geminiService';

// Flatten contacts for the list
// const ALL_CONTACTS = INITIAL_DATA.flatMap(col => col.items);

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'them';
    time: string;
    status: 'sent' | 'delivered' | 'read';
}

interface ChatInterfaceProps {
    selectedContact: Contact | null;
    onSelectContact: (contact: Contact | null) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedContact, onSelectContact }) => {
    // const [selectedContact, setSelectedContact] = useState<Contact | null>(null); // Lifted to App
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [contacts, setContacts] = useState<Contact[]>([]); // Dynamic contacts state
    const [inputText, setInputText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedContact]);

    const { token, socket } = useAuth();
    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;

    // Load initial contacts
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch(`${API_URL}/api/kanban`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Flatten columns to contacts list and sort by last message (implied by order or timestamp if available)
                    const allContacts = data.flatMap((col: any) => col.items);
                    setContacts(allContacts);
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };
        if (token) fetchContacts();
    }, [token, API_URL]);


    // Fetch Messages logic
    useEffect(() => {
        if (!selectedContact) return;

        console.log('Carregando mensagens para contato:', selectedContact.id);

        const fetchMessages = async () => {
            try {
                const response = await fetch(`${API_URL}/api/contacts/${selectedContact.id}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('Mensagens carregadas do banco:', data);
                    // Map DB messages to UI format
                    const uiMessages: Message[] = data.map((msg: any) => ({
                        id: msg.id,
                        text: msg.content,
                        sender: msg.fromMe ? 'me' : 'them',
                        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: 'read'
                    }));
                    setMessages(prev => ({ ...prev, [selectedContact.id]: uiMessages }));
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        setAiSuggestion(null);
    }, [selectedContact, token]); // Add token dependency

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMsg: any) => {
            console.log('Mensagem recebida via socket:', newMsg);
            try {
                const contactId = newMsg.contactId;

                // 1. Update Messages Chat View
                setMessages(prev => {
                    const contactMessages = prev[contactId] || [];
                    if (contactMessages.some(m => m.id === newMsg.id)) return prev;

                    const uiMsg: Message = {
                        id: newMsg.id,
                        text: newMsg.content,
                        sender: newMsg.fromMe ? 'me' : 'them',
                        time: new Date(newMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: 'read'
                    };

                    return { ...prev, [contactId]: [...contactMessages, uiMsg] };
                });

                // 2. Update Contacts List (Sidebar)
                setContacts(prev => {
                    const contactIndex = prev.findIndex(c => c.id === contactId);
                    if (contactIndex === -1) return prev; // Se não achar, talvez devesse buscar novamente?

                    const updatedContact = { ...prev[contactIndex] };
                    updatedContact.lastMessagePreview = newMsg.content;
                    updatedContact.lastMessageTime = new Date(newMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    if (selectedContact?.id !== contactId) {
                        updatedContact.unreadCount = (updatedContact.unreadCount || 0) + 1;
                    }

                    // Remove current and unshift to top
                    const newContacts = [...prev];
                    newContacts.splice(contactIndex, 1);
                    newContacts.unshift(updatedContact);

                    return newContacts;
                });

            } catch (error) {
                console.error('Erro ao processar mensagem:', error);
            }
        };

        socket.on('message:new', handleNewMessage);
        return () => {
            socket.off('message:new', handleNewMessage);
        };
    }, [socket, selectedContact]); // Added selectedContact to dep array for unread count logic

    const handleSendMessage = async () => {
        if (!inputText.trim() || !selectedContact) return;

        try {
            const payload = { contactId: selectedContact.id, content: inputText };

            // Optimistic update
            // (Optional, can wait for socket to avoid duplicate logic complexity, but lets keep it simple for now)
            // Actually, let's wait for the API response or socket to confirm. 
            // But for UX, clearing input immediately is good.

            const textToSend = inputText;
            setInputText('');
            setAiSuggestion(null);

            const response = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error('Failed to send message');
                // Revert or show error (simplified here)
                setInputText(textToSend);
            }

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };


    const handleGenerateAi = async () => {
        if (!selectedContact) return;

        const chatHistory = messages[selectedContact.id] || [];
        const lastMsg = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].text : "Olá";

        setIsTyping(true);
        const suggestion = await generateResponseSuggestion(selectedContact.name, lastMsg);
        setAiSuggestion(suggestion);
        setInputText(suggestion); // Auto-fill input
        setIsTyping(false);
    };

    return (
        <div className="flex h-full bg-white border-t border-gray-200">
            {/* Sidebar List */}
            <div className="w-[350px] flex flex-col border-r border-gray-200 bg-white">
                <div className="h-16 bg-[#F0F2F5] flex items-center justify-between px-4 border-b border-gray-200">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Pesquisar conversa"
                            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-white border border-gray-100 text-sm focus:outline-none focus:border-emerald-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredContacts.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => onSelectContact(contact)}
                            className={`flex items-center px-3 py-3 cursor-pointer hover:bg-[#F5F6F6] border-b border-gray-100 transition-colors ${selectedContact?.id === contact.id ? 'bg-[#F0F2F5]' : ''}`}
                        >
                            <div className="relative flex-shrink-0">
                                <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                                {contact.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                            </div>
                            <div className="ml-3 flex-1 overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-medium text-gray-900 truncate">{contact.name}</h3>
                                    <span className="text-xs text-gray-400">{contact.lastMessageTime}</span>
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                    <p className="text-sm text-gray-500 truncate w-4/5">
                                        {contact.lastMessagePreview || contact.phone}
                                    </p>
                                    {contact.unreadCount > 0 && (
                                        <span className="bg-[#25D366] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{contact.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            {selectedContact ? (
                <div className="flex-1 flex flex-col bg-[#efeae2] relative">
                    {/* Chat Header */}
                    <div className="h-16 bg-[#F0F2F5] px-4 flex items-center justify-between border-b border-gray-200 z-10">
                        <div className="flex items-center cursor-pointer">
                            <img src={selectedContact.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                            <div className="ml-3">
                                <h2 className="text-gray-900 font-medium text-sm">{selectedContact.name}</h2>
                                <p className="text-xs text-gray-500">
                                    {isTyping ? <span className="text-green-600 font-bold">digitando...</span> : selectedContact.status === 'online' ? 'Online' : 'Visto por último hoje às 10:23'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-500">
                            <Search size={20} className="cursor-pointer" />
                            <MoreVertical size={20} className="cursor-pointer" />
                        </div>
                    </div>

                    {/* Chat Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar z-0 relative">
                        {(messages[selectedContact.id] || []).map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[60%] rounded-lg px-3 py-1.5 shadow-sm text-sm relative group ${msg.sender === 'me' ? 'bg-[#D9FDD3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                    <p className="text-gray-800 leading-relaxed pb-3">{msg.text}</p>
                                    <div className="absolute bottom-1 right-2 flex items-center space-x-1">
                                        <span className="text-[10px] text-gray-500">{msg.time}</span>
                                        {msg.sender === 'me' && (
                                            <span className="text-blue-500">
                                                <CheckCheck size={14} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-[#F0F2F5] px-4 py-2 flex items-center z-10">
                        <div className="flex space-x-3 text-gray-500 mr-2">
                            <Smile size={24} className="cursor-pointer hover:text-gray-700" />
                            <Paperclip size={24} className="cursor-pointer hover:text-gray-700" />
                        </div>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Mensagem"
                                className="w-full py-2.5 px-4 rounded-lg border-none focus:outline-none text-sm placeholder-gray-500"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            {/* AI Button inside input */}
                            <button
                                onClick={handleGenerateAi}
                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${aiSuggestion ? 'text-purple-600 bg-purple-100' : 'text-gray-400 hover:text-purple-500'}`}
                                title="Gerar resposta com IA"
                            >
                                <Bot size={18} />
                            </button>
                        </div>

                        <div className="flex space-x-3 text-gray-500 ml-2 items-center">
                            {inputText ? (
                                <button onClick={handleSendMessage} className="text-[#00A884]">
                                    <Send size={24} />
                                </button>
                            ) : (
                                <Mic size={24} className="cursor-pointer hover:text-gray-700" />
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-[#F0F2F5] border-b-[6px] border-[#25D366] flex flex-col items-center justify-center text-center p-10">
                    <div className="bg-white rounded-full p-8 shadow-sm mb-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/2044px-WhatsApp.svg.png" className="w-24 h-24 opacity-50" alt="ZapFlow" />
                    </div>
                    <h1 className="text-3xl font-light text-gray-700 mb-4">ZapFlow Web</h1>
                    <p className="text-sm text-gray-500 max-w-md">
                        Envie e receba mensagens sem precisar manter seu celular conectado. <br />
                        Use o ZapFlow em até 4 aparelhos e 1 celular ao mesmo tempo.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
