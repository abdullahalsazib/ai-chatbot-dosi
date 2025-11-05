/**
 * Session sidebar component
 */

'use client';

import { deleteSession } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SessionSidebar() {
    const sessions = useStore((state) => state.sessions);
    const sessionsLoading = useStore((state) => state.sessionsLoading);
    const currentSessionId = useStore((state) => state.currentSessionId);
    const loadSessions = useStore((state) => state.loadSessions);
    const setCurrentSession = useStore((state) => state.setCurrentSession);
    const createNewSession = useStore((state) => state.createNewSession);
    const clearMessages = useStore((state) => state.clearMessages);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Delete session "${sessionId}"?`)) return;

        try {
            await deleteSession(sessionId);
            toast.success('Session deleted');
            if (sessionId === currentSessionId) {
                createNewSession();
            }
            loadSessions();
        } catch (error) {
            toast.error(`Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={createNewSession}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Create new session"
                >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    New Session
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                        No sessions yet
                    </div>
                ) : (
                    <div className="space-y-1">
                        {sessions.map((session) => (
                            <div
                                key={session.session_id}
                                onClick={() => {
                                    if (session.session_id !== currentSessionId) {
                                        setCurrentSession(session.session_id);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && session.session_id !== currentSessionId) {
                                        e.preventDefault();
                                        setCurrentSession(session.session_id);
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={`Switch to session ${session.session_id === 'default' ? 'Default' : session.session_id}`}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${session.session_id === currentSessionId
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {session.session_id === 'default' ? 'Default' : session.session_id}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {session.message_count} messages
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteSession(session.session_id, e)}
                                    className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                    aria-label={`Delete session ${session.session_id === 'default' ? 'Default' : session.session_id}`}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                Current: {currentSessionId === 'default' ? 'Default' : currentSessionId}
            </div>
        </div>
    );
}

