import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Image, X, Send } from 'lucide-react';
import backgroundImage from '../assets/background.jpg';

const AIChatModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('chat');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const API_URL = 'https://apixrp.vercel.app';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        const userMessage = {
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const endpoint = activeTab === 'chat' ? '/api/chat' : '/api/generate-image';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    prompt: input
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const aiMessage = {
                role: 'assistant',
                content: activeTab === 'chat' ? data.response : data.imageUrl,
                type: activeTab
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.',
                type: 'error'
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-[900px] max-h-[80vh] relative overflow-hidden rounded-3xl">
                {/* Background with overlay */}
                <div className="absolute inset-0">
                    <img
                        src={backgroundImage}
                        alt="background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black/40 to-black/60 backdrop-blur-md" />
                </div>

                {/* Content */}
                <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/30 backdrop-blur-md bg-black/20">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === 'chat'
                                    ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/30'
                                    : 'text-gray-300 hover:bg-white/10 backdrop-blur-lg'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-sm font-medium">Chat</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('image')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === 'image'
                                    ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/30'
                                    : 'text-gray-300 hover:bg-white/10 backdrop-blur-lg'
                                    }`}
                            >
                                <Image className="w-4 h-4" />
                                <span className="text-sm font-medium">Image</span>
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] backdrop-blur-lg ${message.role === 'user'
                                    ? 'bg-purple-600/80 shadow-lg shadow-purple-500/20'
                                    : 'bg-white/10'
                                    } rounded-2xl p-4`}>
                                    {message.type === 'image' ? (
                                        <img
                                            src={message.content}
                                            alt="AI Generated"
                                            className="rounded-lg max-w-full"
                                        />
                                    ) : (
                                        <p className="text-white text-sm">{message.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                        {loading && (
                            <div className="flex items-center justify-center">
                                <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full 
                                            border border-purple-500/20 shadow-lg shadow-purple-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 relative">
                                            <div className="absolute inset-0 border-2 border-t-purple-500 border-r-transparent 
                                                        border-b-transparent border-l-transparent rounded-full animate-spin" />
                                            <div className="absolute inset-0 border-2 border-t-transparent border-r-transparent 
                                                        border-b-purple-300/30 border-l-transparent rounded-full animate-spin 
                                                        [animation-duration:1.5s]" />
                                        </div>
                                        <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-purple-200 
                                                      bg-clip-text text-transparent">
                                            AI is generating...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-gray-700/30 backdrop-blur-md bg-black/20">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                className="flex-1 bg-white/10 text-white rounded-full px-6 py-3 
                                         focus:outline-none focus:ring-2 focus:ring-purple-500/50
                                         placeholder-gray-400 backdrop-blur-lg"
                                placeholder={activeTab === 'chat' ? "Type your message..." : "Describe the image you want..."}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-purple-600/80 hover:bg-purple-700/80 text-white rounded-full p-3 
                                         transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                         shadow-lg shadow-purple-500/20 backdrop-blur-lg
                                         hover:shadow-purple-500/30 hover:scale-105"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatModal;