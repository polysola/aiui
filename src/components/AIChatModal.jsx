import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Image, X, Send, RotateCcw, StopCircle, Copy, Check } from 'lucide-react';
import backgroundImage from '../assets/background.jpg';
import { TypeAnimation } from 'react-type-animation';

const AIChatModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('chat');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [controller, setController] = useState(null);
    const [copied, setCopied] = useState(false);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    const API_URL = 'https://apixrp.vercel.app';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setLoading(false);
        }
    };

    const regenerateResponse = async () => {
        if (messages.length > 0) {
            const lastUserMessage = messages.find(msg => msg.role === 'user');
            if (lastUserMessage) {
                await handleSubmit(lastUserMessage.content);
            }
        }
    };

    const copyToClipboard = async (content) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleSubmit = async (customInput) => {
        const messageToSend = customInput || input;
        if (!messageToSend.trim()) return;

        const userMessage = {
            role: 'user',
            content: messageToSend
        };

        setMessages(prev => [...prev, userMessage]);
        if (!customInput) setInput('');
        setLoading(true);

        // Create new AbortController
        abortControllerRef.current = new AbortController();

        try {
            const endpoint = activeTab === 'chat' ? '/api/chat' : '/api/generate-image';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageToSend,
                    prompt: messageToSend
                }),
                signal: abortControllerRef.current.signal
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
            if (error.name === 'AbortError') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Generation was stopped.',
                    type: 'error'
                }]);
            } else {
                console.error('Error:', error);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, something went wrong. Please try again.',
                    type: 'error'
                }]);
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop với gradient và blur */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

            {/* Container chính với border gradient */}
            <div className="relative w-[900px] max-h-[80vh] rounded-[2rem] p-[1px] bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30">
                {/* Border glow effect */}
                <div className="absolute inset-0 rounded-[2rem] blur-md bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30" />

                {/* Main content container */}
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gradient-to-b from-black/80 via-black/50 to-black/80 backdrop-blur-xl">
                    {/* Background với overlay */}
                    <div className="absolute inset-0">
                        <img
                            src={backgroundImage}
                            alt="background"
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black/40 to-black/60 backdrop-blur-md" />
                    </div>

                    {/* Content */}
                    <div className="relative">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-lg">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === 'chat'
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg shadow-purple-500/30'
                                        : 'text-gray-300 hover:bg-white/10 backdrop-blur-lg'
                                        }`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-sm font-medium">Chat</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('image')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === 'image'
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg shadow-purple-500/30'
                                        : 'text-gray-300 hover:bg-white/10 backdrop-blur-lg'
                                        }`}
                                >
                                    <Image className="w-4 h-4" />
                                    <span className="text-sm font-medium">Image</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {messages.length > 0 && (
                                    <button
                                        onClick={regenerateResponse}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                        title="Regenerate response"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="h-[400px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent/30">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] backdrop-blur-lg group relative ${message.role === 'user'
                                        ? 'bg-gradient-to-r from-purple-600/80 to-purple-400/80 shadow-lg shadow-purple-500/20'
                                        : 'bg-white/10'
                                        } rounded-2xl p-4`}
                                    >
                                        {message.type === 'image' ? (
                                            <img
                                                src={message.content}
                                                alt="AI Generated"
                                                className="rounded-lg max-w-full"
                                            />
                                        ) : (
                                            <>
                                                <p className="text-white text-sm">
                                                    {message.role === 'assistant' && !message.type === 'error' ? (
                                                        <TypeAnimation
                                                            sequence={[message.content]}
                                                            wrapper="span"
                                                            speed={50}
                                                        />
                                                    ) : (
                                                        message.content
                                                    )}
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(message.content)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {copied ? (
                                                        <Check className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                            {loading && (
                                <div className="flex items-center justify-center">
                                    <div className="bg-black/40 backdrop-blur-xl px-6 py-3 rounded-full 
                                                border border-purple-500/20 shadow-lg shadow-purple-500/10
                                                bg-gradient-to-r from-purple-900/50 to-purple-600/50">
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
                                            <button
                                                onClick={stopGeneration}
                                                className="ml-2 text-gray-400 hover:text-white transition-colors"
                                                title="Stop generation"
                                            >
                                                <StopCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-white/10 bg-gradient-to-r from-black/60 via-purple-900/20 to-black/60 backdrop-blur-xl">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                    className="flex-1 bg-black/40 text-white rounded-full px-6 py-3 
                                             border border-purple-500/20
                                             focus:outline-none focus:ring-2 focus:ring-purple-500/50
                                             placeholder-gray-400 backdrop-blur-xl"
                                    placeholder={activeTab === 'chat' ? "Type your message..." : "Describe the image you want..."}
                                />
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-purple-600 to-purple-400 
                                             hover:from-purple-500 hover:to-purple-300
                                             text-white rounded-full p-3 
                                             transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                             shadow-lg shadow-purple-500/20
                                             hover:shadow-purple-500/30 hover:scale-105"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatModal;