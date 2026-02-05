import { formatDistanceToNow } from 'date-fns';

const ChatList = ({ conversations, selectedConversation, onSelectConversation, loading }) => {
    if (loading && conversations.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-slate-500 text-sm">No conversations yet</p>
                    <p className="text-slate-400 text-xs mt-1">
                        Start a chat with your friends!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50">
            {conversations.map((conversation) => {
                const isSelected = selectedConversation?.id === conversation.id;
                const otherUser = conversation.otherUser;
                const lastMessage = conversation.lastMessage;
                const unreadCount = conversation.unreadCount || 0;

                return (
                    <button
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation)}
                        className={`w-full p-4 flex items-start gap-3 transition-all border-b border-slate-100 ${isSelected
                            ? 'bg-gradient-to-r from-rose-50 to-orange-50 border-l-4 border-l-rose-600'
                            : 'hover:bg-white hover:shadow-sm'
                            }`}
                    >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {otherUser?.avatar ? (
                                <img
                                    src={otherUser.avatar}
                                    alt={otherUser.name}
                                    className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                    {otherUser?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-6 w-6 bg-rose-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-bold text-sm truncate ${unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'
                                    }`}>
                                    {otherUser?.name}
                                </h3>
                                {lastMessage && (
                                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                    </span>
                                )}
                            </div>
                            {lastMessage ? (
                                <p className={`text-sm truncate ${unreadCount > 0 ? 'text-slate-700 font-semibold' : 'text-slate-500'
                                    }`}>
                                    {lastMessage.sender?.name === otherUser?.name ? '' : 'You: '}
                                    {lastMessage.content}
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No messages yet</p>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default ChatList;
