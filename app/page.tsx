/**
 * Main chat page
 */

'use client';

import ChatInput from '@/components/ChatInput';
import ChatWindow from '@/components/ChatWindow';
import HealthStatus from '@/components/HealthStatus';
import SessionSidebar from '@/components/SessionSidebar';
import SettingsPanel from '@/components/SettingsPanel';
import { useStore } from '@/lib/store';
import { Settings } from 'lucide-react';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const settingsOpen = useStore((state) => state.settingsOpen);
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const loadSessions = useStore((state) => state.loadSessions);
  const loadSession = useStore((state) => state.loadSession);
  const currentSessionId = useStore((state) => state.currentSessionId);

  useEffect(() => {
    loadSessions();
    loadSession(currentSessionId);
  }, [loadSessions, loadSession, currentSessionId]);

  return (
    <div className="flex h-screen bg-white dark:bg-black overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
          },
        }}
      />

      {/* Session Sidebar */}
      <SessionSidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-lg sm:text-xl font-semibold truncate">AI MCP Agent</h1>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <HealthStatus />
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Chat Window */}
        <ChatWindow />

        {/* Chat Input */}
        <ChatInput />
      </div>

      {/* Settings Panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
