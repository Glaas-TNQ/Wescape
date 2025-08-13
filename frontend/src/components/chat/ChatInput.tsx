import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useChatStore, chatSuggestions, getContextualSuggestions } from '../../stores/chatStore';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Sparkles,
  MapPin,
  Utensils,
  Activity,
  Bed,
  Car,
  Clock,
  X
} from 'lucide-react';

interface ChatInputProps {
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ className = '' }) => {
  const {
    sendMessage,
    isLoading,
    canvasContext,
    hasError,
    clearError
  } = useChatStore();
  
  const { isDark } = useTheme();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isComposing, setIsComposing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get contextual suggestions
  const contextualSuggestions = getContextualSuggestions(canvasContext);
  const allSuggestions = [
    ...contextualSuggestions,
    ...chatSuggestions.flatMap(category => 
      category.suggestions.slice(0, 2) // Limit suggestions per category
    )
  ].slice(0, 8); // Max 8 suggestions total

  // Filter suggestions based on input
  const filteredSuggestions = input.length > 2 
    ? allSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(input.toLowerCase())
      )
    : allSuggestions;

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Don't show suggestions automatically when typing
    setShowSuggestions(false);
    
    // Clear error when user starts typing
    if (hasError) {
      clearError();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
          // Use selected suggestion
          const selectedSuggestion = filteredSuggestions[selectedSuggestionIndex];
          setInput(selectedSuggestion);
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        } else if (input.trim()) {
          // Send message
          handleSendMessage();
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestionIndex(prev => 
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
        } else {
          setShowSuggestions(true);
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
        
      case 'Tab':
        if (showSuggestions && selectedSuggestionIndex >= 0) {
          e.preventDefault();
          const selectedSuggestion = filteredSuggestions[selectedSuggestionIndex];
          setInput(selectedSuggestion);
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
        break;
    }
  };

  // Handle message sending
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Handle quick action click
  const handleQuickAction = (action: string) => {
    const quickMessages = {
      'restaurants': 'Trova ristoranti buoni in zona',
      'activities': 'Cosa posso fare qui?',
      'hotels': 'Suggerisci alloggi per questa zona',
      'transport': 'Come posso spostarmi?',
      'optimize': 'Ottimizza il mio itinerario'
    };
    
    const message = quickMessages[action as keyof typeof quickMessages];
    if (message) {
      setInput(message);
      inputRef.current?.focus();
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`relative ${className}`}>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/30 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto"
          data-testid="chat-suggestions"
        >
          <div className="p-2">
            <div className="text-xs text-gray-400 mb-2 px-2">Suggerimenti</div>
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  ${index === selectedSuggestionIndex
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'hover:bg-gray-700/50 text-gray-300'
                  }
                `}
                data-testid={`suggestion-${index}`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles size={12} className="text-gray-400" />
                  <span className="truncate">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-end space-x-2">
        {/* Main Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={
              canvasContext.tripId 
                ? "Chiedi a Mona di aiutarti con il tuo viaggio..."
                : "Chiedi a Mona di aiutarti..."
            }
            disabled={isLoading}
            maxLength={500}
            className="
              w-full px-4 py-3.5 text-sm
              bg-gradient-to-r from-gray-800/60 to-gray-700/60 
              border border-gray-500/40 rounded-xl
              text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              focus:border-blue-400/60 focus:bg-gray-700/70
              disabled:opacity-50 disabled:cursor-not-allowed
              pr-12 shadow-inner
              transition-all duration-200
              backdrop-blur-sm
            "
            data-testid="chat-input"
            aria-label="Messaggio per Mona"
            aria-describedby="input-help"
          />
          
          {/* Character count */}
          {input.length > 400 && (
            <div className="absolute -top-6 right-0 text-xs text-gray-400">
              {input.length}/500
            </div>
          )}
          
          {/* Attachment button (future feature) */}
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700/50 rounded transition-colors"
            disabled
            aria-label="Allega file"
          >
            <Paperclip size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Voice input button (future feature) */}
        <button
          className="p-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/30 rounded-xl transition-colors disabled:opacity-50"
          disabled
          aria-label="Messaggio vocale"
        >
          <Mic size={16} className="text-gray-400" />
        </button>

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          className="
            p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700
            text-white rounded-xl
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-105 active:scale-95
            flex items-center justify-center
            min-w-[48px]
          "
          data-testid="send-button"
          aria-label="Invia messaggio"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>


      {/* Error state */}
      {hasError && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2 text-red-400 text-xs">
            <X size={12} />
            <span>Errore nell'invio del messaggio. Riprova.</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300"
            aria-label="Chiudi errore"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

// Quick action button component
interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="
      flex items-center space-x-2 px-4 py-2.5 text-sm font-medium
      bg-gradient-to-r from-gray-700/60 to-gray-600/60 
      hover:from-gray-600/80 hover:to-gray-500/80
      border border-gray-500/30 hover:border-gray-400/50
      rounded-xl transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      hover:scale-105 active:scale-95
      shadow-lg hover:shadow-xl
      min-h-[40px] touch-manipulation
      text-gray-200 hover:text-white
    "
    data-testid={`quick-action-${label.toLowerCase()}`}
  >
    <div className="flex-shrink-0">{icon}</div>
    <span className="whitespace-nowrap">{label}</span>
  </button>
);

export default ChatInput;