import React, { useEffect, useRef } from 'react';
import { useChatStore, useChatKeyboardShortcuts } from '../../stores/chatStore';
import { useTheme } from '../../contexts/ThemeContext';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatSidebarProps {
  className?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ className = '' }) => {
  const {
    isOpen,
    toggleChat,
    openChat,
    closeChat,
    messages,
    isLoading,
    startNewConversation,
    canvasContext
  } = useChatStore();
  
  const { isDark } = useTheme();
  const { handleKeyDown } = useChatKeyboardShortcuts();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Initialize conversation on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startNewConversation();
    }
  }, [isOpen, messages.length, startNewConversation]);

  // Keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Click outside to close (optional)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        // Don't close when clicking on the toggle button
        const toggleButton = document.querySelector('[data-testid="chat-toggle-button"]');
        if (toggleButton && toggleButton.contains(event.target as Node)) {
          return;
        }
        // closeChat(); // Uncomment if you want click-outside-to-close behavior
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Chat Toggle Button - Floating */}
      <button
        data-testid="chat-toggle-button"
        onClick={toggleChat}
        className={`
          fixed right-6 bottom-6 z-50 
          w-14 h-14 rounded-full 
          glass-effect shadow-lg
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          hover:scale-110 hover:shadow-xl
          group
          ${isOpen ? 'translate-x-0' : 'translate-x-0'}
          ${isDark ? 'text-white' : 'text-gray-900'}
        `}
        aria-label={isOpen ? 'Chiudi chat con Mona' : 'Apri chat con Mona'}
      >
        <MessageSquare 
          size={24} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-12' : 'rotate-0'}`}
        />
        
        {/* Notification dot for new messages */}
        {!isOpen && messages.some(m => m.type === 'assistant' && !m.metadata?.read) && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        
        {/* Tooltip */}
        <div className={`
          absolute right-full mr-3 px-2 py-1 text-xs rounded
          bg-gray-900 text-white
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          whitespace-nowrap
          pointer-events-none
        `}>
          Chat con Mona (Ctrl+M)
        </div>
      </button>

      {/* Chat Sidebar */}
      <div
        ref={sidebarRef}
        data-testid="chat-sidebar"
        className={`
          fixed right-0 top-0 h-full z-40
          w-96 max-w-[90vw]
          glass-effect border-l border-gray-700/30
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
          ${className}
        `}
        role="complementary"
        aria-label="Chat con Mona"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">M</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Mona</h3>
              <p className="text-xs text-gray-400">
                {canvasContext.tripId ? 'Assistente AI per il tuo viaggio' : 'Assistente AI'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Minimize button (future feature) */}
            <button
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Riduci a icona"
              disabled
            >
              <Minimize2 size={16} className="text-gray-400" />
            </button>
            
            {/* Close button */}
            <button
              onClick={closeChat}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Chiudi chat"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Context Info */}
        {canvasContext.tripId && (
          <div className="px-4 py-2 bg-blue-500/10 border-b border-gray-700/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400">
                📍 Canvas attivo: {canvasContext.existingNodes.length} nodi
              </span>
              <span className="text-gray-500">
                Zoom: {Math.round(canvasContext.viewport.zoom * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <ChatMessages />

        {/* Input Area */}
        <div className="border-t border-gray-700/30 p-4">
          <ChatInput />
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Premi Ctrl+M per aprire/chiudere • Esc per chiudere
          </p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={closeChat}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default ChatSidebar;