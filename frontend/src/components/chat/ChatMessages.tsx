import React, { useEffect, useRef, useState } from 'react';
import { type ChatMessage as ChatMessageType, useChatStore } from '../../stores/chatStore';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  MessageSquare, 
  User, 
  Bot, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Sparkles,
  MapPin,
  Utensils,
  Activity,
  Bed,
  Car
} from 'lucide-react';

interface ChatMessagesProps {
  className?: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ className = '' }) => {
  const { 
    messages, 
    isLoading, 
    currentTyping, 
    autoScroll,
    pendingNodeIds,
    lastAIAction 
  } = useChatStore();
  
  const { isDark } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }
  }, [messages, isLoading, autoScroll]);

  // Get icon for message type
  const getMessageIcon = (message: ChatMessageType) => {
    switch (message.type) {
      case 'user':
        return <User size={16} className="text-blue-400" />;
      case 'assistant':
        return <Bot size={16} className="text-purple-400" />;
      case 'system':
        return <Sparkles size={16} className="text-green-400" />;
      default:
        return <MessageSquare size={16} className="text-gray-400" />;
    }
  };

  // Get status icon for message
  const getStatusIcon = (message: ChatMessageType) => {
    const status = message.metadata?.status;
    
    switch (status) {
      case 'sending':
        return <Clock size={12} className="text-yellow-400 animate-spin" />;
      case 'processing':
        return <Clock size={12} className="text-blue-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle size={12} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={12} className="text-red-400" />;
      default:
        return null;
    }
  };

  // Get node type icon
  const getNodeTypeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'destination':
        return <MapPin size={14} className="text-blue-400" />;
      case 'restaurant':
        return <Utensils size={14} className="text-orange-400" />;
      case 'activity':
        return <Activity size={14} className="text-green-400" />;
      case 'hotel':
        return <Bed size={14} className="text-purple-400" />;
      case 'transport':
        return <Car size={14} className="text-indigo-400" />;
      default:
        return <Sparkles size={14} className="text-gray-400" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    
    if (diffInMinutes < 1) {
      return 'Ora';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m fa`;
    } else {
      return timestamp.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div 
      className={`flex-1 overflow-hidden flex flex-col ${className}`}
      data-testid="chat-messages"
    >
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message, index) => (
            <MessageBubble 
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
              getMessageIcon={getMessageIcon}
              getStatusIcon={getStatusIcon}
              getNodeTypeIcon={getNodeTypeIcon}
              formatTimestamp={formatTimestamp}
            />
          ))
        )}
        
        {/* Typing Indicator */}
        {(isLoading || currentTyping) && (
          <TypingIndicator content={currentTyping} />
        )}
        
        {/* Pending Nodes Indicator */}
        {pendingNodeIds.length > 0 && (
          <PendingNodesIndicator nodeIds={pendingNodeIds} />
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scroll to bottom button */}
      {messages.length > 3 && (
        <ScrollToBottomButton 
          containerRef={messagesContainerRef}
          targetRef={messagesEndRef}
        />
      )}
    </div>
  );
};

// Empty state component
const EmptyState: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center text-gray-400 max-w-xs">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
        <Bot size={32} className="text-blue-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Ciao! Sono Mona 👋</h3>
      <p className="text-sm text-gray-400 mb-4">
        La tua assistente AI per la pianificazione viaggi. Dimmi cosa vorresti fare!
      </p>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <span>💡</span>
          <span>Prova: "Trova ristoranti vegani a Roma"</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <span>🎯</span>
          <span>Oppure: "Cosa vedere al Colosseo?"</span>
        </div>
      </div>
    </div>
  </div>
);

// Message bubble component
interface MessageBubbleProps {
  message: ChatMessageType;
  isLast: boolean;
  getMessageIcon: (message: ChatMessageType) => React.ReactNode;
  getStatusIcon: (message: ChatMessageType) => React.ReactNode;
  getNodeTypeIcon: (nodeType: string) => React.ReactNode;
  formatTimestamp: (timestamp: Date) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLast,
  getMessageIcon,
  getStatusIcon,
  getNodeTypeIcon,
  formatTimestamp
}) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const hasError = message.metadata?.status === 'error';

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      data-testid="chat-message"
      data-message-type={message.type}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
        {/* Message container */}
        <div
          className={`
            relative p-3 rounded-xl text-sm shadow-lg
            ${isUser 
              ? 'bg-blue-600 text-white ml-4' 
              : isSystem
              ? 'bg-green-600/20 text-green-400 border border-green-600/30'
              : 'bg-gray-700/60 text-gray-100 border border-gray-600/30'
            }
            ${hasError ? 'border-red-500/50 bg-red-500/10' : ''}
            transition-all duration-200
            ${isLast ? 'animate-slide-up' : ''}
          `}
        >
          {/* Message header for assistant messages */}
          {!isUser && (
            <div className="flex items-center space-x-2 mb-2">
              {getMessageIcon(message)}
              <span className="text-xs font-medium">
                {message.type === 'assistant' ? 'Mona' : 'Sistema'}
              </span>
            </div>
          )}
          
          {/* Message content */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Nodes created indicator */}
          {message.metadata?.nodesCreated && message.metadata.nodesCreated.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-600/30">
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Sparkles size={12} className="text-yellow-400" />
                <span>
                  {message.metadata.nodesCreated.length} nod{message.metadata.nodesCreated.length === 1 ? 'o creato' : 'i creati'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {message.metadata.nodesCreated.slice(0, 3).map((nodeId, index) => (
                  <div 
                    key={nodeId}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-600/30 rounded-md"
                  >
                    {getNodeTypeIcon('activity')}
                    <span className="text-xs">Nodo {index + 1}</span>
                  </div>
                ))}
                {message.metadata.nodesCreated.length > 3 && (
                  <div className="px-2 py-1 bg-gray-600/30 rounded-md">
                    <span className="text-xs">+{message.metadata.nodesCreated.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Message footer */}
          <div className={`flex items-center justify-between mt-2 pt-2 ${
            isUser ? 'border-t border-blue-500/30' : 'border-t border-gray-600/30'
          }`}>
            <span className="text-xs opacity-70">
              {formatTimestamp(message.timestamp)}
            </span>
            
            <div className="flex items-center space-x-1">
              {getStatusIcon(message)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Avatar for assistant messages */}
      {!isUser && (
        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${isUser ? 'order-2 ml-3' : 'order-1 mr-3'}`}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-medium">M</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Typing indicator component
interface TypingIndicatorProps {
  content?: string | null;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ content }) => (
  <div 
    className="flex justify-start"
    data-testid="typing-indicator"
  >
    <div className="flex items-center space-x-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
        <span className="text-white text-xs font-medium">M</span>
      </div>
      
      {/* Typing bubble */}
      <div className="bg-gray-700/60 border border-gray-600/30 p-3 rounded-xl max-w-[80%]">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <span className="text-xs text-gray-400">
            {content || 'Mona sta scrivendo...'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Pending nodes indicator
interface PendingNodesIndicatorProps {
  nodeIds: string[];
}

const PendingNodesIndicator: React.FC<PendingNodesIndicatorProps> = ({ nodeIds }) => (
  <div className="flex justify-center my-4">
    <div className="bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-lg">
      <div className="flex items-center space-x-2 text-sm text-blue-400">
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span>Creando {nodeIds.length} nod{nodeIds.length === 1 ? 'o' : 'i'} nel canvas...</span>
      </div>
    </div>
  </div>
);

// Scroll to bottom button
interface ScrollToBottomButtonProps {
  containerRef: React.RefObject<HTMLDivElement>;
  targetRef: React.RefObject<HTMLDivElement>;
}

const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ 
  containerRef, 
  targetRef 
}) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const scrollToBottom = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!showButton) return null;

  return (
    <button
      onClick={scrollToBottom}
      className="
        absolute bottom-20 right-6 z-10
        w-10 h-10 rounded-full
        bg-blue-600 hover:bg-blue-700
        text-white shadow-lg
        flex items-center justify-center
        transition-all duration-200
        animate-fade-in
      "
      aria-label="Scorri verso il basso"
    >
      ↓
    </button>
  );
};

export default ChatMessages;