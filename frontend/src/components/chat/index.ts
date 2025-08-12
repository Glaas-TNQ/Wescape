// Chat components export file
export { default as ChatSidebar } from './ChatSidebar';
export { default as ChatMessages } from './ChatMessages';
export { default as ChatInput } from './ChatInput';

// Re-export store and types for convenience
export { useChatStore, useChatKeyboardShortcuts } from '../../stores/chatStore';
export type { 
  ChatMessage, 
  CanvasContext, 
  ChatState, 
  ChatStore 
} from '../../stores/chatStore';