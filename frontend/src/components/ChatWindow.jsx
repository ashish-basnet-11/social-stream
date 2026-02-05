import { useRef, useEffect } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatWindow = ({
    conversation,
    messages,
    onSendMessage,
    onDeleteMessage,
    onTyping,
    isTyping,
    isOnline,
    onBack
}) => {
    const messagesEndRef = useRef(null);
    const otherUser = conversation.otherUser;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center gap-3 bg-gradient-to-r from-white to-slate-50">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                )}

                <div className="relative flex-shrink-0">
                    {otherUser?.avatar ? (
                        <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-sm">
                            {otherUser?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full ring-2 ring-white"></span>
                    )}
                </div>

                <div className="flex-1">
                    <h2 className="font-bold text-slate-900">{otherUser?.name}</h2>
                    {isTyping ? (
                        <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                            <span className="animate-pulse">●</span> typing...
                        </p>
                    ) : isOnline ? (
                        <p className="text-xs text-green-600 font-medium">● online</p>
                    ) : (
                        <p className="text-xs text-slate-400">offline</p>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rotate-3">
                                <MessageCircle className="text-slate-400 w-8 h-8 -rotate-3" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No messages yet</p>
                            <p className="text-slate-400 text-xs mt-1">Start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                onDelete={onDeleteMessage}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <ChatInput
                onSendMessage={onSendMessage}
                onTyping={onTyping}
            />
        </div>
    );
};

export default ChatWindow;
