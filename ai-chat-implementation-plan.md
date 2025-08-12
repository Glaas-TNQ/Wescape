# AI Chat "Mona" - Piano Implementazione Dettagliato

## 🎯 Overview
Integrazione di una chat AI contestuale nel canvas di WeScape che permette agli utenti di generare nodi automaticamente tramite conversazioni in linguaggio naturale.

**Esempio**: "Voglio mangiare vegano intorno al colosseo" → L'AI genera automaticamente card di ristoranti vegani nella zona del Colosseo

## 🏗️ Architettura Tecnica

### Flusso Dati
```
Frontend (Chat UI) 
    ↓ POST /api/chat/send
Backend (FastAPI)
    ↓ HTTP Webhook 
n8n Workflow
    ↓ MCP Tools
AI Agent (con accesso a WeScape MCP Server)
    ↓ Database Operations
Supabase
    ↓ Real-time Subscriptions
Frontend (Canvas Update)
```

### Stack Tecnologico
- **Frontend**: React 18 + TypeScript + Zustand + React Query
- **Backend**: FastAPI + Supabase client
- **AI Pipeline**: n8n + AI Agent + MCP Server tools
- **Real-time**: Supabase subscriptions
- **Testing**: Playwright per E2E e usabilità

## 📱 Design UX/UI

### Chat Sidebar - Specifiche
- **Posizione**: Lato destro del canvas, overlay non invasivo
- **Dimensioni**: 
  - Desktop: 380px larghezza, altezza full viewport
  - Mobile: Bottom sheet 70vh altezza
- **Stati**: Collassata (40px tab), Espansa (380px)
- **Animazioni**: Slide smooth 300ms, spring easing

### Layout Components
```
┌─────────────────────────────────────────┐
│ TripCanvas                              │
│  ┌─────────────────────────┐ ┌─────────┐│
│  │                         │ │  Chat   ││
│  │      Canvas Nodes       │ │ Sidebar ││
│  │                         │ │         ││
│  │                         │ │ [Mona]  ││
│  │                         │ │         ││
│  │                         │ │ Input   ││
│  └─────────────────────────┘ └─────────┘│
└─────────────────────────────────────────┘
```

### Interaction Design
1. **Chat Toggle**: Floating button + Keyboard shortcut (Ctrl+M)
2. **Message Flow**: User message → Typing indicator → AI response → Node creation animation
3. **Visual Feedback**: Highlight nodi creati, animazione pulse, success toast
4. **Context Awareness**: Mostra info canvas corrente nell'header chat

## 🔧 Implementazione Frontend

### 1. Store Zustand - `chatStore.ts`
```typescript
interface ChatState {
  // UI State
  isOpen: boolean
  isLoading: boolean
  
  // Messages
  messages: ChatMessage[]
  currentTyping: string | null
  
  // Context
  currentTripId: string | null
  canvasContext: CanvasContext
  
  // Actions
  sendMessage: (message: string) => void
  toggleChat: () => void
  setCanvasContext: (context: CanvasContext) => void
  addMessage: (message: ChatMessage) => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    nodesCreated?: string[]
    action?: 'create_nodes' | 'modify_nodes'
  }
}

interface CanvasContext {
  tripId: string
  viewport: { x: number, y: number, zoom: number }
  existingNodes: CanvasNode[]
  selectedNodes: string[]
}
```

### 2. Chat Components Architecture

#### ChatSidebar (`components/chat/ChatSidebar.tsx`)
```typescript
interface ChatSidebarProps {
  className?: string
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ className }) => {
  const { isOpen, toggleChat } = useChatStore()
  
  return (
    <div className={cn(
      "fixed right-0 top-0 h-full z-50 transition-transform duration-300",
      isOpen ? "translate-x-0" : "translate-x-[340px]",
      className
    )}>
      {/* Chat Toggle Button */}
      {/* Chat Header */}
      {/* Chat Messages */}
      {/* Chat Input */}
    </div>
  )
}
```

#### ChatMessages (`components/chat/ChatMessages.tsx`)
```typescript
interface ChatMessagesProps {
  messages: ChatMessage[]
  isLoading: boolean
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <TypingIndicator />}
    </div>
  )
}
```

#### ChatInput (`components/chat/ChatInput.tsx`)
```typescript
interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('')
  
  // Auto-complete suggestions
  const suggestions = [
    "Trova ristoranti vegani vicino a...",
    "Suggerisci attività per bambini a...",
    "Hotel 4 stelle economici in zona...",
    "Come spostarsi da ... a ...?"
  ]
  
  return (
    <div className="p-4 border-t">
      {/* Suggestions Pills */}
      {/* Input Field */}
      {/* Send Button */}
    </div>
  )
}
```

### 3. Integration con Canvas

#### Context Provider Update
```typescript
// contexts/CanvasContext.tsx
const CanvasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setCanvasContext } = useChatStore()
  
  useEffect(() => {
    // Update chat context quando canvas cambia
    setCanvasContext({
      tripId: currentTripId,
      viewport: reactFlowInstance?.getViewport(),
      existingNodes: nodes,
      selectedNodes: selectedNodes.map(n => n.id)
    })
  }, [tripId, nodes, selectedNodes, viewport])
  
  return (
    <CanvasContext.Provider value={...}>
      {children}
    </CanvasContext.Provider>
  )
}
```

## 🔌 Backend API Design

### Endpoint Chat
```python
# app/routers/chat.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from app.models.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.core.auth import get_current_user

router = APIRouter()

@router.post("/api/chat/send", response_model=ChatResponse)
async def send_chat_message(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    chat_service = Depends(ChatService)
):
    """
    Invia messaggio chat e triggera AI workflow
    """
    try:
        # Validazione permessi trip
        await chat_service.validate_trip_access(request.trip_id, current_user.id)
        
        # Log conversazione
        conversation_id = await chat_service.log_message(
            user_id=current_user.id,
            trip_id=request.trip_id,
            message=request.message,
            context=request.canvas_context
        )
        
        # Trigger async n8n webhook
        background_tasks.add_task(
            chat_service.trigger_ai_workflow,
            conversation_id=conversation_id,
            message=request.message,
            context=request.canvas_context
        )
        
        return ChatResponse(
            conversation_id=conversation_id,
            status="processing",
            message="Mona sta elaborando la tua richiesta..."
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Errore nell'elaborazione")
```

### Models
```python
# app/models/chat.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class CanvasContext(BaseModel):
    trip_id: str
    viewport: Dict[str, float]  # {x, y, zoom}
    existing_nodes: List[Dict[str, Any]]
    selected_nodes: List[str]

class ChatRequest(BaseModel):
    message: str
    trip_id: str
    canvas_context: CanvasContext

class ChatResponse(BaseModel):
    conversation_id: str
    status: str  # "processing" | "completed" | "error"
    message: Optional[str] = None
    nodes_created: Optional[List[str]] = None
```

### Chat Service
```python
# app/services/chat_service.py
import httpx
from app.core.config import settings

class ChatService:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        
    async def trigger_ai_workflow(self, conversation_id: str, message: str, context: CanvasContext):
        """Trigger n8n webhook con contesto completo"""
        webhook_url = settings.N8N_CHAT_WEBHOOK_URL
        
        payload = {
            "conversation_id": conversation_id,
            "user_message": message,
            "canvas_context": context.dict(),
            "callback_url": f"{settings.API_URL}/api/chat/webhook/response"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=payload)
            response.raise_for_status()
    
    async def log_message(self, user_id: str, trip_id: str, message: str, context: CanvasContext) -> str:
        """Log messaggio in database"""
        result = await self.supabase.table("chat_conversations").insert({
            "user_id": user_id,
            "trip_id": trip_id,
            "message": message,
            "context": context.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }).execute()
        
        return result.data[0]["id"]
```

## 🤖 n8n Workflow Design

### Webhook Input
```json
{
  "conversation_id": "uuid",
  "user_message": "Voglio mangiare vegano intorno al colosseo",
  "canvas_context": {
    "trip_id": "uuid",
    "viewport": {"x": 100, "y": 200, "zoom": 1},
    "existing_nodes": [...],
    "selected_nodes": [...]
  },
  "callback_url": "https://api.wescape.com/chat/webhook/response"
}
```

### AI Processing Steps
1. **Parse Intent**: Estrai tipo richiesta (restaurant, activity, hotel, transport)
2. **Location Extraction**: Identifica location da messaggio + contesto canvas
3. **Search & Filter**: Usa API esterne (Google Places, Yelp, TripAdvisor)
4. **Node Generation**: Crea nodi con posizionamento intelligente
5. **Database Insert**: Usa MCP tools per inserire in Supabase
6. **Callback**: Notifica frontend con risultati

### MCP Server Tools
```javascript
// WeScape MCP Server tools for n8n
const tools = {
  createCanvasNode: async (tripId, nodeData, position) => {
    // Insert node in Supabase cards table
    // Return node ID
  },
  
  getCanvasNodes: async (tripId) => {
    // Fetch existing nodes for context
  },
  
  updateCanvasLayout: async (tripId, nodeIds) => {
    // Auto-arrange new nodes intelligently
  },
  
  searchPlaces: async (query, location, type) => {
    // Search external APIs
    // Return structured place data
  }
}
```

## 🧪 Test Strategy con Playwright

### User Journey Tests

#### Test 1: Basic Chat Interaction
```typescript
// tests/e2e/chat-basic-interaction.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Chat Basic Interaction', () => {
  test('should open and close chat sidebar', async ({ page }) => {
    await page.goto('/trip/test-trip-id')
    
    // Chat inizialmente chiusa
    await expect(page.locator('[data-testid="chat-sidebar"]')).not.toBeVisible()
    
    // Click floating button per aprire
    await page.locator('[data-testid="chat-toggle-button"]').click()
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible()
    
    // Test keyboard shortcut Ctrl+M
    await page.keyboard.press('Control+m')
    await expect(page.locator('[data-testid="chat-sidebar"]')).not.toBeVisible()
  })
  
  test('should send message and show loading state', async ({ page }) => {
    await page.goto('/trip/test-trip-id')
    await page.locator('[data-testid="chat-toggle-button"]').click()
    
    // Type message
    const input = page.locator('[data-testid="chat-input"]')
    await input.fill('Trova ristoranti vegani vicino al Colosseo')
    await input.press('Enter')
    
    // Verify message appears
    await expect(page.locator('[data-testid="user-message"]').last()).toContainText('Trova ristoranti vegani')
    
    // Verify loading state
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible()
  })
})
```

#### Test 2: Node Creation Flow
```typescript
// tests/e2e/chat-node-creation.spec.ts
test.describe('AI Node Creation', () => {
  test('should create restaurant nodes from chat message', async ({ page }) => {
    // Mock n8n webhook response
    await page.route('/api/chat/send', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversation_id: 'test-conv-id',
          status: 'processing',
          message: 'Mona sta cercando ristoranti vegani...'
        })
      })
    })
    
    // Mock Supabase real-time update per nuovi nodi
    await page.evaluate(() => {
      window.mockSupabaseUpdate = {
        table: 'cards',
        eventType: 'INSERT',
        new: {
          id: 'new-restaurant-node-1',
          type: 'restaurant',
          data: {
            name: 'Ristorante Vegano Roma',
            cuisine: 'Vegan',
            location: 'Via del Colosseo, 1'
          },
          position: { x: 200, y: 300 }
        }
      }
    })
    
    await page.goto('/trip/test-trip-id')
    await page.locator('[data-testid="chat-toggle-button"]').click()
    
    // Send message
    await page.locator('[data-testid="chat-input"]').fill('Trova ristoranti vegani vicino al Colosseo')
    await page.locator('[data-testid="send-button"]').click()
    
    // Wait for AI response and node creation
    await expect(page.locator('[data-testid="ai-message"]').last()).toContainText('Ho trovato')
    
    // Verify new node appears on canvas
    await expect(page.locator('[data-node-id="new-restaurant-node-1"]')).toBeVisible()
    
    // Verify node highlight animation
    await expect(page.locator('[data-node-id="new-restaurant-node-1"]')).toHaveClass(/animate-pulse/)
  })
})
```

#### Test 3: Context Awareness
```typescript
// tests/e2e/chat-context-awareness.spec.ts
test.describe('Chat Context Awareness', () => {
  test('should include viewport context in chat requests', async ({ page }) => {
    let chatRequest: any
    
    await page.route('/api/chat/send', async route => {
      chatRequest = await route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ conversation_id: 'test', status: 'processing' })
      })
    })
    
    await page.goto('/trip/test-trip-id')
    
    // Pan canvas to specific position
    await page.locator('[data-testid="trip-canvas"]').hover()
    await page.mouse.down()
    await page.mouse.move(100, 100)
    await page.mouse.up()
    
    // Open chat and send message
    await page.locator('[data-testid="chat-toggle-button"]').click()
    await page.locator('[data-testid="chat-input"]').fill('Aggiungi un hotel qui')
    await page.locator('[data-testid="send-button"]').click()
    
    // Verify context includes viewport position
    expect(chatRequest.canvas_context.viewport).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      zoom: expect.any(Number)
    })
    
    // Verify existing nodes context
    expect(chatRequest.canvas_context.existing_nodes).toEqual(expect.any(Array))
  })
})
```

### Usability Tests

#### Test 4: Responsive Behavior
```typescript
// tests/e2e/chat-responsive.spec.ts
test.describe('Chat Responsive Design', () => {
  test('should adapt to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/trip/test-trip-id')
    
    // Chat should be bottom sheet on mobile
    await page.locator('[data-testid="chat-toggle-button"]').click()
    
    const chatSidebar = page.locator('[data-testid="chat-sidebar"]')
    await expect(chatSidebar).toHaveCSS('position', 'fixed')
    
    // Should take 70% of viewport height
    const boundingBox = await chatSidebar.boundingBox()
    expect(boundingBox?.height).toBeCloseTo(667 * 0.7, 20)
  })
})
```

#### Test 5: Accessibility
```typescript
// tests/e2e/chat-accessibility.spec.ts
test.describe('Chat Accessibility', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/trip/test-trip-id')
    
    // Tab navigation
    await page.keyboard.press('Tab') // Focus su canvas
    await page.keyboard.press('Tab') // Focus su chat toggle
    await page.keyboard.press('Enter') // Open chat
    
    await expect(page.locator('[data-testid="chat-sidebar"]')).toBeVisible()
    
    // Focus should move to input
    await expect(page.locator('[data-testid="chat-input"]')).toBeFocused()
    
    // Escape should close chat
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="chat-sidebar"]')).not.toBeVisible()
  })
  
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/trip/test-trip-id')
    await page.locator('[data-testid="chat-toggle-button"]').click()
    
    // Verify ARIA attributes
    await expect(page.locator('[data-testid="chat-sidebar"]')).toHaveAttribute('role', 'complementary')
    await expect(page.locator('[data-testid="chat-input"]')).toHaveAttribute('aria-label', 'Messaggio per Mona')
    await expect(page.locator('[data-testid="send-button"]')).toHaveAttribute('aria-label', 'Invia messaggio')
  })
})
```

#### Test 6: Performance & Error Handling
```typescript
// tests/e2e/chat-performance.spec.ts
test.describe('Chat Performance & Errors', () => {
  test('should handle API timeout gracefully', async ({ page }) => {
    // Mock slow API response
    await page.route('/api/chat/send', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000))
      await route.fulfill({ status: 408 })
    })
    
    await page.goto('/trip/test-trip-id')
    await page.locator('[data-testid="chat-toggle-button"]').click()
    await page.locator('[data-testid="chat-input"]').fill('Test message')
    await page.locator('[data-testid="send-button"]').click()
    
    // Should show error message after timeout
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Timeout')
  })
  
  test('should limit message history for performance', async ({ page }) => {
    await page.goto('/trip/test-trip-id')
    await page.locator('[data-testid="chat-toggle-button"]').click()
    
    // Send multiple messages to test history limit
    for (let i = 0; i < 100; i++) {
      await page.locator('[data-testid="chat-input"]').fill(`Message ${i}`)
      await page.locator('[data-testid="send-button"]').click()
      await page.waitForTimeout(100)
    }
    
    // Should only show last 50 messages
    const messages = page.locator('[data-testid="chat-message"]')
    expect(await messages.count()).toBeLessThanOrEqual(50)
  })
})
```

## 📊 Metriche & Monitoring

### Frontend Analytics
```typescript
// Track chat usage
interface ChatAnalytics {
  chatOpened: (tripId: string) => void
  messagesSent: (tripId: string, messageCount: number) => void
  nodesCreated: (tripId: string, nodeTypes: string[]) => void
  errorOccurred: (error: string, context: any) => void
}
```

### Performance Targets
- **Chat open/close**: < 300ms
- **Message send**: < 100ms (acknowledge immediato)
- **Node creation**: < 5s (end-to-end da messaggio a nodi visibili)
- **Memory usage**: < 10MB per sessione chat

## 🚀 Deployment & Configuration

### Environment Variables
```bash
# Frontend (.env)
VITE_N8N_WEBHOOK_URL=https://n8n.wescape.com/webhook/chat
VITE_CHAT_MAX_MESSAGES=50
VITE_CHAT_TIMEOUT_MS=30000

# Backend (.env)
N8N_CHAT_WEBHOOK_URL=https://n8n.wescape.com/webhook/chat
CHAT_RATE_LIMIT_PER_MINUTE=10
```

### Feature Flags
```typescript
// For gradual rollout
interface FeatureFlags {
  aiChatEnabled: boolean
  aiChatBetaUsers: string[]
  nodeCreationEnabled: boolean
  contextAwarenessEnabled: boolean
}
```

## 📈 Roadmap Post-MVP

### Fase 2: Advanced Features
- **Multi-language support**: Chat in più lingue
- **Voice input**: Speech-to-text integration
- **Smart suggestions**: Basate su cronologia e preferenze
- **Collaborative chat**: Chat condivisa in team trips

### Fase 3: AI Enhancements
- **Visual node creation**: Upload immagini → genera nodi
- **Itinerary optimization**: "Ottimizza il mio itinerario"
- **Budget planning**: "Quanto costa questo viaggio?"
- **Real-time collaboration**: Multiple users, single chat

### Fase 4: Analytics & Insights
- **Usage analytics**: Metriche dettagliate utilizzo chat
- **User feedback**: Rating AI responses
- **A/B testing**: Test diverse UI approaches
- **Conversation insights**: Analisi pattern conversazioni

---

*Questo documento verrà aggiornato durante l'implementazione con dettagli tecnici aggiuntivi e feedback dai test.*