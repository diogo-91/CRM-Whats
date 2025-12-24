import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Contact } from '../types';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, CheckCheck, Bot, X, Trash2, ArrowLeft } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { generateResponseSuggestion } from '../services/geminiService';

interface Message {
    id: string;
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'document';
    sender: 'me' | 'them';
    time: string;
    status: 'sent' | 'delivered' | 'read';
}

interface ChatInterfaceProps {
    selectedContact: Contact | null;
    onSelectContact: (contact: Contact | null) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedContact, onSelectContact }) => {
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [inputText, setInputText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    // New Features State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [messageSearchTerm, setMessageSearchTerm] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
                    const allContacts = data.flatMap((col: any) => col.items);
                    setContacts(allContacts);
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        if (token) {
            fetchContacts();
            const interval = setInterval(() => {
                fetchContacts();
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [token, API_URL]);


    // Fetch Messages logic
    useEffect(() => {
        if (!selectedContact) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`${API_URL}/api/contacts/${selectedContact.id}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const uiMessages: Message[] = data.map((msg: any) => ({
                        id: msg.id,
                        text: msg.content,
                        mediaUrl: msg.mediaUrl,
                        mediaType: msg.mediaType,
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
    }, [selectedContact, token]);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMsg: any) => {
            try {
                const contactId = newMsg.contactId;

                // 1. Update Messages Chat View
                setMessages(prev => {
                    const contactMessages = prev[contactId] || [];
                    if (contactMessages.some(m => m.id === newMsg.id)) return prev;

                    const uiMsg: Message = {
                        id: newMsg.id,
                        text: newMsg.content,
                        mediaUrl: newMsg.mediaUrl,
                        mediaType: newMsg.mediaType,
                        sender: newMsg.fromMe ? 'me' : 'them',
                        time: new Date(newMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: 'read'
                    };

                    return { ...prev, [contactId]: [...contactMessages, uiMsg] };
                });

                // 2. Update Contacts List (Sidebar)
                setContacts(prev => {
                    const contactIndex = prev.findIndex(c => c.id === contactId);
                    if (contactIndex === -1) return prev;

                    const updatedContact = { ...prev[contactIndex] };
                    updatedContact.lastMessagePreview = newMsg.content;
                    updatedContact.lastMessageTime = new Date(newMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    if (selectedContact?.id !== contactId) {
                        updatedContact.unreadCount = (updatedContact.unreadCount || 0) + 1;
                    }

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
    }, [socket, selectedContact]);

    const handleSendMessage = async () => {
        console.log('[ChatInterface] handleSendMessage chamado');
        console.log('[ChatInterface] inputText:', inputText);
        console.log('[ChatInterface] selectedContact:', selectedContact);

        if (!inputText.trim() || !selectedContact) {
            console.log('[ChatInterface] Mensagem vazia ou sem contato selecionado');
            return;
        }

        try {
            const payload = { contactId: selectedContact.id, content: inputText };
            const textToSend = inputText;
            setInputText('');
            setAiSuggestion(null);

            console.log('[ChatInterface] Enviando para API:', payload);
            console.log('[ChatInterface] API_URL:', API_URL);

            const response = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            console.log('[ChatInterface] Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('[ChatInterface] Erro ao enviar:', errorData);
                alert('Erro ao enviar mensagem. Verifique o console.');
                setInputText(textToSend);
            } else {
                console.log('[ChatInterface] Mensagem enviada com sucesso!');
            }

        } catch (error) {
            console.error('[ChatInterface] Erro ao enviar mensagem:', error);
            alert('Erro ao enviar mensagem: ' + error);
        }
    };


    const handleGenerateAi = async () => {
        if (!selectedContact) return;

        const chatHistory = messages[selectedContact.id] || [];
        const lastMsg = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].text : "Olá";

        setIsTyping(true);
        const suggestion = await generateResponseSuggestion(selectedContact.name, lastMsg);
        setAiSuggestion(suggestion);
        setInputText(suggestion);
        setIsTyping(false);
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        setMessageSearchTerm('');
    };

    const currentMessages = messages[selectedContact?.id || ''] || [];
    const displayedMessages = isSearchOpen && messageSearchTerm
        ? currentMessages.filter(msg => msg.text && msg.text.toLowerCase().includes(messageSearchTerm.toLowerCase()))
        : currentMessages;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedContact) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await uploadRes.json();
            if (data.url) {
                const type = file.type.startsWith('image/') ? 'image' :
                    file.type.startsWith('video/') ? 'video' :
                        file.type.startsWith('audio/') ? 'audio' : 'document';

                const payload = {
                    contactId: selectedContact.id,
                    content: '',
                    mediaUrl: data.url,
                    mediaType: type
                };

                await fetch(`${API_URL}/api/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });

                const formData = new FormData();
                formData.append('file', audioFile);

                try {
                    const uploadRes = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
                    const data = await uploadRes.json();
                    if (data.url) {
                        await fetch(`${API_URL}/api/messages`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ contactId: selectedContact?.id, mediaUrl: data.url, mediaType: 'audio' })
                        });
                    }
                } catch (err) { console.error(err); }

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Erro ao acessar microfone. Verifique as permissões.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-full bg-white border-t border-gray-200">
            {/* Sidebar List - Hidden on mobile if contact selected */}
            <div className={`
                ${selectedContact ? 'hidden md:flex' : 'flex'} 
                w-full md:w-[350px] flex-col border-r border-gray-200 bg-white
            `}>
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
                            onClick={async () => {
                                onSelectContact(contact);
                                setContacts(prev => prev.map(c =>
                                    c.id === contact.id ? { ...c, unreadCount: 0 } : c
                                ));
                                try {
                                    await fetch(`${API_URL}/api/contacts/${contact.id}/read`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                } catch (err) {
                                    // ignore error
                                }
                            }}
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

            {/* Chat Area - Hidden on mobile if NO contact selected */}
            <div className={`
                ${!selectedContact ? 'hidden md:flex' : 'flex'}
                flex-1 flex-col bg-[#efeae2] relative
            `}>
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 bg-[#F0F2F5] px-4 flex items-center justify-between border-b border-gray-200 z-10 relative md:top-0 top-14">
                            <div className="flex items-center">
                                {/* Back Button Mobile */}
                                <button
                                    onClick={() => onSelectContact(null)}
                                    className="md:hidden mr-2 text-gray-500"
                                >
                                    <ArrowLeft size={24} />
                                </button>

                                <div className="flex items-center cursor-pointer">
                                    <img src={selectedContact.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                    <div className="ml-3">
                                        <h2 className="text-gray-900 font-medium text-sm">{selectedContact.name}</h2>
                                        <p className="text-xs text-gray-500">
                                            {isTyping ? <span className="text-green-600 font-bold">digitando...</span> : selectedContact.status === 'online' ? 'Online' : 'Visto por último hoje às 10:23'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 text-gray-500 relative">
                                {isSearchOpen ? (
                                    <div className="flex items-center bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-200 animate-in slide-in-from-right-5">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Buscar..."
                                            className="w-40 text-sm border-none focus:outline-none"
                                            value={messageSearchTerm}
                                            onChange={(e) => setMessageSearchTerm(e.target.value)}
                                        />
                                        <X size={16} className="cursor-pointer ml-1 hover:text-red-500" onClick={toggleSearch} />
                                    </div>
                                ) : (
                                    <Search size={20} className="cursor-pointer hover:text-gray-700" onClick={toggleSearch} />
                                )}

                                <div className="relative">
                                    <MoreVertical size={20} className="cursor-pointer hover:text-gray-700" onClick={() => setShowMenu(!showMenu)} />
                                    {showMenu && (
                                        <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 w-48 border border-gray-100 z-50">
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => { setMessages(prev => ({ ...prev, [selectedContact.id]: [] })); setShowMenu(false); }}>
                                                <Trash2 size={16} /> Limpar conversa
                                            </button>
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                <Bot size={16} /> Gerar resumo IA
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chat Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.4] pointer-events-none bg-repeat" style={{ backgroundImage: 'url("https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg")', backgroundSize: '400px' }}></div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar z-0 relative md:pt-6 pt-20">
                            {displayedMessages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-lg px-2 py-1 shadow-sm text-sm relative group ${msg.sender === 'me' ? 'bg-[#D9FDD3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                        {msg.mediaUrl ? (
                                            <div className="mb-0">
                                                {msg.mediaType === 'image' && (
                                                    <img src={msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${API_URL}${msg.mediaUrl}`} alt="Mídia" className="rounded-lg max-w-full max-h-[300px] object-cover cursor-pointer hover:opacity-95" onClick={() => window.open(msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${API_URL}${msg.mediaUrl}`)} />
                                                )}
                                                {msg.mediaType === 'video' && (
                                                    <video controls className="rounded-lg max-w-full max-h-[300px]" src={msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${API_URL}${msg.mediaUrl}`} />
                                                )}
                                                {msg.mediaType === 'audio' && (
                                                    <audio controls className="w-[240px] h-10 mt-1" src={msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${API_URL}${msg.mediaUrl}`} />
                                                )}
                                                {msg.mediaType === 'document' && (
                                                    <div className="flex items-center gap-3 bg-black/5 p-3 rounded-lg cursor-pointer hover:bg-black/10 transition-colors" onClick={() => window.open(msg.mediaUrl.startsWith('http') ? msg.mediaUrl : `${API_URL}${msg.mediaUrl}`)}>
                                                        <div className="bg-red-100 p-2 rounded text-red-500">
                                                            <Paperclip size={20} />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <span className="truncate block font-medium text-gray-700">Documento</span>
                                                            <span className="text-xs text-gray-500 uppercase">{msg.mediaUrl?.split('.').pop()}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {msg.text && (msg.text !== 'Mídia enviada' && msg.text !== 'Áudio enviado') && <p className="text-gray-800 pt-1 pb-4 px-1">{msg.text}</p>}
                                            </div>
                                        ) : (
                                            <p className="text-gray-800 leading-relaxed pb-2 pr-12 pl-1 pt-1">{msg.text}</p>
                                        )}
                                        <div className="absolute bottom-1 right-2 flex items-center space-x-1">
                                            <span className="text-[9px] text-gray-500 -mb-0.5">{msg.time}</span>
                                            {msg.sender === 'me' && (
                                                <span className="text-blue-500">
                                                    <CheckCheck size={12} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-[#F0F2F5] px-4 py-2 flex items-center z-10 relative">
                            {showEmojiPicker && (
                                <div className="absolute bottom-16 left-4 z-50 shadow-2xl">
                                    <EmojiPicker onEmojiClick={(emojiData) => { setInputText(prev => prev + emojiData.emoji); setShowEmojiPicker(false); }} />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                            />

                            {isRecording ? (
                                <div className="flex-1 flex items-center justify-between bg-white rounded-lg px-4 py-2 text-red-500 animate-pulse">
                                    <div className="flex items-center gap-2">
                                        <Mic size={20} className="animate-bounce" />
                                        <span className="font-medium">{formatTime(recordingTime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setIsRecording(false); if (mediaRecorderRef.current) mediaRecorderRef.current.stop(); if (timerRef.current) clearInterval(timerRef.current); }} className="text-gray-500 hover:text-gray-700 text-xs uppercase cursor-pointer">Cancelar</button>
                                        <button onClick={stopRecording} className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors cursor-pointer">
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex space-x-3 text-gray-500 mr-2">
                                        <Smile size={24} className={`cursor-pointer transition-colors ${showEmojiPicker ? 'text-[#00A884]' : 'hover:text-gray-700'}`} onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                                        <Paperclip size={24} className="cursor-pointer hover:text-gray-700" onClick={() => fileInputRef.current?.click()} />
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
                                            <button onClick={startRecording} className="cursor-pointer hover:text-red-500 transition-colors" title="Gravar áudio">
                                                <Mic size={24} />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 bg-[#F0F2F5] border-b-[6px] border-[#25D366] flex-col items-center justify-center text-center p-10">
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
        </div>
    );
};

export default ChatInterface;
