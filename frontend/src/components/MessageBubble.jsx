import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MessageBubble = ({ message, onDelete }) => {
    const { user } = useAuth();
    const [showActions, setShowActions] = useState(false);
    const isOwnMessage = message.sender.id === user?.id;

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            onDelete(message.id);
        }
    };

    return (
        <div
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar for received messages */}
                {!isOwnMessage && (
                    <div className="flex-shrink-0 mb-1">
                        {message.sender.avatar ? (
                            <img
                                src={message.sender.avatar}
                                alt={message.sender.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                                {message.sender.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                )}

                {/* Message content */}
                <div className="flex flex-col">
                    <div
                        className={`px-4 py-2 rounded-2xl ${isOwnMessage
                                ? 'bg-rose-600 text-white rounded-br-sm'
                                : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                            }`}
                    >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>

                    <div className={`flex items-center gap-2 mt-1 px-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>

                        {isOwnMessage && showActions && (
                            <button
                                onClick={handleDelete}
                                className="text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete message"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
