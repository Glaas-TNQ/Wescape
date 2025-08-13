import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore, useChatKeyboardShortcuts } from '../../stores/chatStore';
import { useTheme } from '../../contexts/ThemeContext';
import { MessageSquare, X } from 'lucide-react';
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
  
  // Resize and drag functionality
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(384); // default 96 (24rem) -> 384px
  const [position, setPosition] = useState(() => {
    // Start at right side of screen
    const startX = typeof window !== 'undefined' ? window.innerWidth - 384 - 16 : 800; // width + margin
    return { x: startX, y: 96 };
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const resizeRef = useRef<HTMLDivElement>(null);

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

  // Drag handlers
  const startDragging = useCallback((e: React.MouseEvent) => {
    if (isResizing) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [isResizing, position]);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const drag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate new position
    const newX = Math.max(16, Math.min(e.clientX - dragStart.x, viewportWidth - width - 16));
    const newY = Math.max(16, Math.min(e.clientY - dragStart.y, viewportHeight - 450)); // min height consideration
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart, width]);

  // Resize handlers
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const viewportWidth = window.innerWidth;
    
    // Calculate new width (resize from left edge)
    const newWidth = Math.max(320, Math.min(e.clientX - position.x, 600));
    setWidth(newWidth);
  }, [isResizing, position.x]);

  // Mouse event listeners for resizing and dragging
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else if (isDragging) {
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDragging);
      document.body.style.cursor = 'move';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDragging);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, isDragging, resize, stopResizing, drag, stopDragging]);

  // Click outside to close (optional)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen &&
        !isResizing &&
        !isDragging
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
  }, [isOpen, isResizing, isDragging]);

  return (
    <>
      {/* Chat Toggle Button - Posizionato nella bottom bar */}
      <button
        data-testid="chat-toggle-button"
        onClick={toggleChat}
        className={`
          fixed bottom-6 right-6 z-50 
          w-14 h-14 rounded-full 
          bg-gradient-to-r from-blue-500 to-purple-600
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/25
          group text-white
          ${isOpen ? 'scale-95 shadow-lg shadow-blue-500/20' : 'shadow-xl shadow-blue-500/30'}
        `}
        aria-label={isOpen ? 'Chiudi chat con Mona' : 'Apri chat con Mona'}
      >
        <MessageSquare 
          size={20} 
          className={`transition-all duration-300 ${isOpen ? 'scale-90 rotate-12' : 'scale-100 rotate-0'}`}
        />
        
        {/* Notification dot for new messages */}
        {!isOpen && messages.some(m => m.type === 'assistant' && !m.metadata?.read) && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
        )}
        
        {/* Tooltip migliorato */}
        <div className={`
          absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2
          px-3 py-2 text-xs rounded-lg
          bg-gray-900 text-white border border-gray-700
          opacity-0 group-hover:opacity-100
          transition-all duration-200
          whitespace-nowrap pointer-events-none
          shadow-lg
        `}>
          Chat con Mona (Ctrl+M)
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
        </div>
      </button>

      {/* Chat Overlay - Sovrapposto al canvas senza deformarlo */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          style={{ pointerEvents: 'none' }}
        >
          <div
            ref={sidebarRef}
            data-testid="chat-sidebar"
            className={`
              absolute z-40
              backdrop-blur-xl bg-gray-900/95 border border-gray-700/50 rounded-2xl
              transform transition-all duration-500 ease-out
              flex flex-col shadow-2xl relative
              ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-x-full'}
              ${className}
              ${isResizing || isDragging ? 'transition-none' : ''}
            `}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              height: 'calc(100vh - 8rem)', // Altezza maggiore per più spazio
              width: `${width}px`,
              maxWidth: 'calc(100vw - 2rem)',
              pointerEvents: 'auto', // Riabilita pointer events per la sidebar
              maxHeight: '700px', // Limite massimo aumentato
              minHeight: '450px' // Limite minimo aumentato
            }}
            role="complementary"
            aria-label="Chat con Mona"
            aria-hidden={!isOpen}
          >
            {/* Resize handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-50 flex items-center justify-center group"
              onMouseDown={startResizing}
              style={{ left: '-8px' }}
            >
              <div className="w-1 h-8 bg-gray-600/50 rounded-full group-hover:bg-gray-500 transition-colors" />
            </div>
            {/* Header migliorato - draggable */}
            <div 
              className="flex items-center justify-between p-4 border-b border-gray-700/40 cursor-move"
              onMouseDown={startDragging}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">M</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Mona</h3>
                  <p className="text-xs text-gray-400">
                    {canvasContext.tripId ? 'Assistente AI per il tuo viaggio' : 'Assistente AI'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                {/* Close button - più prominente */}
                <button
                  onClick={closeChat}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="p-2 rounded-full hover:bg-red-500/10 transition-all duration-200 hover:scale-110 group"
                  aria-label="Chiudi chat"
                >
                  <X size={16} className="text-gray-400 group-hover:text-red-400" />
                </button>
              </div>
            </div>

            {/* Context Info - Design migliorato */}
            {canvasContext.tripId && (
              <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-300">
                      Canvas attivo: {canvasContext.existingNodes.length} elementi
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono bg-gray-800/50 px-2 py-1 rounded">
                    {Math.round(canvasContext.viewport.zoom * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Messages Container */}
            <ChatMessages />

            {/* Input Area - Design migliorato */}
            <div className="border-t border-gray-700/40 p-4 bg-gradient-to-t from-gray-900/70 to-transparent">
              <ChatInput />
              
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;