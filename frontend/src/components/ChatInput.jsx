import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSendMessage, onTyping }) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleChange = (e) => {
        setMessage(e.target.value);

        // Handle typing indicator
        if (!isTyping) {
            setIsTyping(true);
            onTyping(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onTyping(false);
        }, 1000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
            setIsTyping(false);
            onTyping(false);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    const handleKeyDown = (e) => {
        // Send on Enter, new line on Shift+Enter
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
            <div className="flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    style={{ maxHeight: '120px' }}
                />
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`p-3 rounded-full transition-all ${message.trim()
                            ? 'bg-rose-600 text-white hover:bg-rose-700 hover:scale-105'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    <Send size={20} />
                </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
                Press Enter to send, Shift+Enter for new line
            </p>
        </form>
    );
};

export default ChatInput;
