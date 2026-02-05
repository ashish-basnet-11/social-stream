import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { MessageCircle } from 'lucide-react';

const Chats = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const {
        conversations,
        messages,
        loading,
        typingUsers,
        onlineUsers,
        fetchConversations,
        fetchMessages,
        sendMessage,
        handleTyping,
        deleteMessage
    } = useChat(selectedConversation?.id);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Handle conversation selection from URL
    useEffect(() => {
        if (conversationId && conversations.length > 0) {
            const conversation = conversations.find(c => c.id === parseInt(conversationId));
            if (conversation) {
                setSelectedConversation(conversation);
            }
        }
    }, [conversationId, conversations]);

    // Fetch messages when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation, fetchMessages]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        navigate(`/chats/${conversation.id}`);
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
        navigate('/chats');
    };

    const handleSendMessage = async (content) => {
        if (selectedConversation) {
            await sendMessage(selectedConversation.id, content);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        await deleteMessage(messageId);
    };

    // Check if other user is typing
    const isOtherUserTyping = selectedConversation &&
        typingUsers.has(selectedConversation.otherUser?.id);

    // Check if other user is online
    const isOtherUserOnline = selectedConversation &&
        onlineUsers.has(selectedConversation.otherUser?.id);

    return (

        <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">

            <div className="flex-1 w-full flex flex-col min-h-0 p-4 lg:p-8">
                {/* Header */}
                <div className="mb-6 pl-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-[3px] w-6 bg-rose-600 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-600">Messenger</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
                        Inbox<span className="text-rose-600">.</span>
                    </h1>
                </div>

                <div className="bg-white rounded-[3rem] shadow-[0_30px_90px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-1 overflow-hidden min-h-0 w-full">

                    <div className={`
                            ${isMobile && selectedConversation ? 'hidden' : 'flex'} 
                            w-full lg:w-96 xl:w-[420px] border-r border-slate-100 flex-col bg-white
                        `}>
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Recent</h2>
                            <div className="h-6 w-6 rounded-full bg-rose-50 flex items-center justify-center">
                                <span className="text-rose-600 text-[10px] font-black">{conversations.length}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <ChatList
                                conversations={conversations}
                                selectedConversation={selectedConversation}
                                onSelectConversation={handleSelectConversation}
                                loading={loading}
                            />
                        </div>
                    </div>

                    {/* Chat Window Column */}
                    <div className={`
                            ${isMobile && !selectedConversation ? 'hidden' : 'flex'} 
                            flex-1 flex-col bg-white
                        `}>
                        {selectedConversation ? (
                            <ChatWindow
                                conversation={selectedConversation}
                                messages={messages}
                                onSendMessage={handleSendMessage}
                                onDeleteMessage={handleDeleteMessage}
                                onTyping={handleTyping}
                                isTyping={isOtherUserTyping}
                                isOnline={isOtherUserOnline}
                                onBack={isMobile ? handleBackToList : null}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-slate-50/20">
                                <div className="text-center px-6">
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-[2rem] bg-rose-50/50 flex items-center justify-center rotate-6 border border-rose-100">
                                        <MessageCircle className="text-rose-600 w-10 h-10 -rotate-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 italic uppercase tracking-tight">Select a conversation</h3>
                                    <p className="text-slate-400 text-sm max-w-[260px] mx-auto font-medium">
                                        Choose someone from the left to start a real-time vibe.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Chats;
