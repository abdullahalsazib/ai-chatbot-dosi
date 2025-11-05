/**
 * Chat window component displaying messages
 */

'use client';

import { useStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
    const messages = useStore((state) => state.messages);
    const isStreaming = useStore((state) => state.isStreaming);
    const isLoading = useStore((state) => state.isLoading);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter out empty messages
    const displayMessages = messages.filter(msg => msg.content.trim() || msg.role === 'user');

    useEffect(() => {
        // Small delay to ensure DOM is updated
        const timeoutId = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, isStreaming]);

    return (
        <div className="flex-1 overflow-y-auto px-6 py-4" role="log" aria-label="Chat messages">
            {displayMessages.length === 0 && !isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                        <p>Send a message to begin chatting with the AI agent.</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    {displayMessages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
                    {isStreaming && (
                        <div className="flex gap-4 mb-6" aria-live="polite" aria-label="AI is typing">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-white animate-spin" aria-hidden="true" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                                <div className="flex gap-1" aria-hidden="true">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    {isLoading && !isStreaming && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-label="Loading" />
                        </div>
                    )}
                    <div ref={messagesEndRef} aria-hidden="true" />
                </div>
            )}
        </div>
    );
}

