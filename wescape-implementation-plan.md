# WeScape Implementation Plan - Supabase + FastAPI + n8n

## 🎯 Obiettivi del Progetto
- Creare un'applicazione web per la pianificazione di viaggi con AI
- Implementare un sistema di editing collaborativo con versioning
- Orchestrare agenti AI tramite n8n workflows
- Costruire un'interfaccia drag-and-drop stile Figma/Miro

## 🏗️ Architettura Tecnica

### Tech Stack Aggiornato

#### Frontend
```
- Framework: React 18 + TypeScript
- Build Tool: Vite
- Routing: React Router v6
- Styling: Tailwind CSS + Framer Motion
- State Management: Zustand + React Query (Tanstack Query)
- Canvas: React Flow / Konva.js
- Real-time: Supabase Realtime
- Type Safety: TypeScript + Zod
```

#### Backend
```
- Framework: FastAPI (Python)
- Database: Supabase (PostgreSQL + Auth + Storage + Realtime)
- ORM: SQLAlchemy + Alembic
- Workflow Engine: n8n (self-hosted)
- AI Orchestration: n8n workflows + LangChain
- API Documentation: FastAPI automatic OpenAPI
- Background Jobs: Celery + Redis
```

#### Infrastructure
```
- Frontend Hosting: Vercel / Netlify
- Backend Hosting: Railway / Fly.io
- n8n Hosting: Railway / Docker
- Monitoring: Sentry + Supabase Dashboard
- CI/CD: GitHub Actions
```

## 📁 Struttura del Progetto

```
wescape/
├── frontend/                   # React + TypeScript App
│   ├── src/
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── TripCanvas.tsx
│   │   │   │   ├── CardNode.tsx
│   │   │   │   └── ConnectionLine.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ContextualChat.tsx
│   │   │   │   └── ChatMessage.tsx
│   │   │   ├── stations/
│   │   │   │   ├── ProfileStation.tsx
│   │   │   │   └── PreferencesStation.tsx
│   │   │   └── ui/
│   │   ├── hooks/
│   │   │   ├── useSupabase.ts
│   │   │   ├── useRealtimeSync.ts
│   │   │   └── useN8nWorkflow.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   └── api.ts
│   │   ├── stores/
│   │   │   ├── tripStore.ts
│   │   │   └── uiStore.ts
│   │   └── types/
│   │       └── index.ts
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── trips.py
│   │   │   │   ├── cards.py
│   │   │   │   ├── chat.py
│   │   │   │   └── workflows.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── n8n_client.py
│   │   ├── models/
│   │   │   ├── trip.py
│   │   │   ├── card.py
│   │   │   └── version.py
│   │   ├── services/
│   │   │   ├── trip_service.py
│   │   │   ├── ai_service.py
│   │   │   └── workflow_service.py
│   │   └── main.py
│   ├── alembic/
│   └── requirements.txt
├── n8n-workflows/              # n8n Workflow Definitions
│   ├── research-agent/
│   ├── recommendation-agent/
│   ├── budget-optimizer/
│   └── route-planner/
└── docker-compose.yml
```

## 🚀 Fase 1: Setup Iniziale (1 settimana)

### 1.1 Setup Supabase
```sql
-- Supabase SQL Editor: Create tables with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (gestita da Supabase Auth)

-- Trips table
CREATE TABLE trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cards table
CREATE TABLE cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('destination', 'activity', 'restaurant', 'hotel', 'transport', 'note')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  style JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Card versions for history
CREATE TABLE card_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  ai_generated BOOLEAN DEFAULT FALSE,
  prompt TEXT
);

-- Connections between cards
CREATE TABLE connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  to_card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'default',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

-- Realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE connections;
```

### 1.2 Frontend Setup
```bash
# Create React app with Vite
npm create vite@latest wescape-frontend -- --template react-ts
cd wescape-frontend

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-react
npm install @tanstack/react-query zustand
npm install reactflow @react-flow/controls @react-flow/background
npm install tailwindcss framer-motion
npm install axios zod react-hook-form
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Setup Tailwind
npx tailwindcss init -p
```

### 1.3 Supabase Client Configuration
```typescript
// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Realtime helper
export const subscribeToTrip = (
  tripId: string,
  onCardChange: (payload: any) => void,
  onConnectionChange: (payload: any) => void
) => {
  const channel = supabase.channel(`trip-${tripId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cards',
        filter: `trip_id=eq.${tripId}`
      },
      onCardChange
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'connections',
        filter: `trip_id=eq.${tripId}`
      },
      onConnectionChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
```

### 1.4 FastAPI Backend Setup
```python
# backend/requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.1
celery[redis]==5.3.4
supabase==2.0.3
langchain==0.0.340
openai==1.3.5
```

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import trips, cards, chat, workflows
from app.core.config import settings
from app.core.supabase import init_supabase

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_supabase()
    yield
    # Shutdown

app = FastAPI(
    title="WeScape API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(trips.router, prefix="/api/v1/trips", tags=["trips"])
app.include_router(cards.router, prefix="/api/v1/cards", tags=["cards"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
```

## 🤖 Fase 2: n8n Integration (2 settimane)

### 2.1 n8n Workflow Service
```python
# backend/app/core/n8n_client.py
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

class N8NClient:
    def __init__(self):
        self.base_url = settings.N8N_URL
        self.api_key = settings.N8N_API_KEY
        self.headers = {
            "X-N8N-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
    
    async def trigger_workflow(
        self, 
        workflow_id: str, 
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Trigger an n8n workflow via webhook"""
        webhook_url = f"{self.base_url}/webhook/{workflow_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook_url,
                json=data,
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def get_workflow_status(
        self, 
        execution_id: str
    ) -> Dict[str, Any]:
        """Check workflow execution status"""
        url = f"{self.base_url}/executions/{execution_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()

n8n_client = N8NClient()
```

### 2.2 Workflow Service
```python
# backend/app/services/workflow_service.py
from typing import Dict, Any, List
from app.core.n8n_client import n8n_client
from app.models.card import Card, CardType
from app.core.supabase import supabase

class WorkflowService:
    WORKFLOW_MAPPING = {
        "research_destination": "webhook-research-agent",
        "find_activities": "webhook-activity-finder",
        "optimize_route": "webhook-route-optimizer",
        "analyze_budget": "webhook-budget-analyzer",
        "get_recommendations": "webhook-recommendation-engine"
    }
    
    async def process_card_update(
        self,
        card: Card,
        user_prompt: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process card update through appropriate n8n workflow"""
        
        # Determine workflow based on card type and prompt
        workflow_id = self._get_workflow_id(card.type, user_prompt)
        
        # Prepare workflow data
        workflow_data = {
            "cardId": str(card.id),
            "cardType": card.type,
            "currentContent": card.content,
            "userPrompt": user_prompt,
            "tripContext": context,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Trigger workflow
        result = await n8n_client.trigger_workflow(
            workflow_id, 
            workflow_data
        )
        
        # Save version
        await self._save_card_version(
            card_id=card.id,
            content=result.get("updatedContent", {}),
            ai_generated=True,
            prompt=user_prompt
        )
        
        return result
    
    async def research_destination(
        self, 
        destination: str,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Trigger destination research workflow"""
        
        data = {
            "destination": destination,
            "preferences": preferences,
            "researchDepth": "comprehensive"
        }
        
        return await n8n_client.trigger_workflow(
            self.WORKFLOW_MAPPING["research_destination"],
            data
        )
```

### 2.3 n8n Workflow Example (JSON)
```json
{
  "name": "Research Destination Agent",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "webhook-research-agent",
        "responseMode": "responseNode",
        "options": {}
      }
    },
    {
      "name": "Extract Parameters",
      "type": "n8n-nodes-base.set",
      "position": [450, 300],
      "parameters": {
        "values": {
          "string": [
            {
              "name": "destination",
              "value": "={{$json.destination}}"
            }
          ]
        }
      }
    },
    {
      "name": "Search Web",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 200],
      "parameters": {
        "method": "GET",
        "url": "https://api.serpapi.com/search",
        "qs": {
          "q": "={{$json.destination}} travel guide attractions",
          "api_key": "{{$credentials.serpApiKey}}"
        }
      }
    },
    {
      "name": "OpenAI Analysis",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "position": [850, 300],
      "parameters": {
        "model": "gpt-4-turbo-preview",
        "messages": {
          "messageType": "defineBelow",
          "messages": [
            {
              "role": "system",
              "content": "You are a travel expert. Analyze the search results and create a comprehensive destination guide."
            },
            {
              "role": "user",
              "content": "Destination: {{$node['Extract Parameters'].json.destination}}\n\nSearch Results: {{$node['Search Web'].json}}\n\nCreate a structured guide with attractions, best time to visit, local tips."
            }
          ]
        }
      }
    },
    {
      "name": "Format Response",
      "type": "n8n-nodes-base.set",
      "position": [1050, 300],
      "parameters": {
        "values": {
          "object": {
            "updatedContent": {
              "description": "={{$json.choices[0].message.content}}",
              "attractions": "={{$json.parsed_attractions}}",
              "tips": "={{$json.parsed_tips}}",
              "bestTime": "={{$json.parsed_best_time}}"
            }
          }
        }
      }
    },
    {
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1250, 300],
      "parameters": {
        "responseCode": 200,
        "responseData": "={{$json}}"
      }
    }
  ]
}
```

## 💬 Fase 3: Chat Contestuale e Versioning (2 settimane)

### 3.1 React Component per Chat
```typescript
// frontend/src/components/chat/ContextualChat.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkflow } from '@/hooks/useWorkflow';
import { Card, CardVersion } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextualChatProps {
  card: Card;
  onUpdate: (content: any) => void;
  onClose: () => void;
}

export function ContextualChat({ card, onUpdate, onClose }: ContextualChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [versions, setVersions] = useState<CardVersion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { triggerWorkflow } = useWorkflow();

  // Load version history
  useEffect(() => {
    loadVersionHistory();
  }, [card.id]);

  const loadVersionHistory = async () => {
    const { data, error } = await supabase
      .from('card_versions')
      .select('*')
      .eq('card_id', card.id)
      .order('version_number', { ascending: false });
    
    if (data) setVersions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Trigger n8n workflow
      const result = await triggerWorkflow('process_card_update', {
        cardId: card.id,
        cardType: card.type,
        userPrompt: input,
        currentContent: card.content
      });

      // Add AI response
      const aiMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.explanation || 'Ho aggiornato la card come richiesto.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update card content
      if (result.updatedContent) {
        onUpdate(result.updatedContent);
        await loadVersionHistory(); // Reload versions
      }
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const rollbackToVersion = async (version: CardVersion) => {
    try {
      onUpdate(version.content);
      
      // Save rollback as new version
      await supabase.from('card_versions').insert({
        card_id: card.id,
        content: version.content,
        version_number: versions[0].version_number + 1,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        ai_generated: false,
        prompt: `Rollback to version ${version.version_number}`
      });
      
      await loadVersionHistory();
    } catch (error) {
      console.error('Error rolling back:', error);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Modifica {card.type}: {card.title}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Version History */}
      <div className="flex gap-2 p-4 overflow-x-auto border-b border-gray-800">
        <AnimatePresence>
          {versions.map((version, index) => (
            <motion.button
              key={version.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => rollbackToVersion(version)}
              className={`
                px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all
                ${index === 0 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }
              `}
            >
              v{version.version_number}
              {version.ai_generated && ' 🤖'}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                max-w-[80%] p-3 rounded-lg
                ${message.role === 'assistant'
                  ? 'bg-purple-900/20 border border-purple-800/50 mr-auto'
                  : 'bg-gray-800 ml-auto'
                }
              `}
            >
              <p className="text-sm text-white">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-purple-400">
            <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full" />
            <span className="text-sm">Il travel agent sta elaborando...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chiedi modifiche al travel agent..."
            className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 
                     focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                     rounded-full px-6 py-2 font-medium disabled:opacity-50 
                     hover:shadow-lg transition-all"
          >
            Invia
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 3.2 Custom Hook per Workflow
```typescript
// frontend/src/hooks/useWorkflow.ts
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL;

export function useWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const triggerWorkflow = async (
    workflowType: string,
    data: any
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/workflows/trigger`,
        {
          workflow_type: workflowType,
          data
        },
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Workflow error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkWorkflowStatus = async (executionId: string) => {
    const response = await axios.get(
      `${API_URL}/api/v1/workflows/status/${executionId}`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      }
    );

    return response.data;
  };

  return {
    triggerWorkflow,
    checkWorkflowStatus,
    loading,
    error
  };
}
```

## 🎨 Fase 4: Canvas Interattivo (2 settimane)

### 4.1 Trip Canvas Component
```typescript
// frontend/src/components/canvas/TripCanvas.tsx
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import { supabase } from '@/lib/supabase';
import { subscribeToTrip } from '@/lib/supabase';
import CardNode from './CardNode';
import { ContextualChat } from '../chat/ContextualChat';
import { useTripStore } from '@/stores/tripStore';

const nodeTypes = {
  card: CardNode,
};

function TripCanvasInner({ tripId }: { tripId: string }) {
  const reactFlowInstance = useReactFlow();
  const { trip, cards, connections, updateCard, addCard } = useTripStore();
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);

  // Convert cards to nodes
  useEffect(() => {
    const newNodes = cards.map(card => ({
      id: card.id,
      type: 'card',
      position: card.position,
      data: {
        ...card,
        onEdit: () => handleCardEdit(card),
        onDelete: () => handleCardDelete(card.id)
      }
    }));
    setNodes(newNodes);
  }, [cards]);

  // Convert connections to edges
  useEffect(() => {
    const newEdges = connections.map(conn => ({
      id: conn.id,
      source: conn.from_card_id,
      target: conn.to_card_id,
      type: conn.type || 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1' }
    }));
    setEdges(newEdges);
  }, [connections]);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToTrip(
      tripId,
      (payload) => {
        // Handle card changes
        if (payload.eventType === 'INSERT') {
          useTripStore.getState().addCard(payload.new);
        } else if (payload.eventType === 'UPDATE') {
          useTripStore.getState().updateCard(payload.new.id, payload.new);
        } else if (payload.eventType === 'DELETE') {
          useTripStore.getState().removeCard(payload.old.id);
        }
      },
      (payload) => {
        // Handle connection changes
        if (payload.eventType === 'INSERT') {
          useTripStore.getState().addConnection(payload.new);
        } else if (payload.eventType === 'DELETE') {
          useTripStore.getState().removeConnection(payload.old.id);
        }
      }
    );

    return () => unsubscribe();
  }, [tripId]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      
      // Update position in database
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          updateCardPosition(change.id, change.position);
        }
      });
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    async (params) => {
      // Add edge locally
      setEdges((eds) => addEdge(params, eds));
      
      // Save to database
      await supabase.from('connections').insert({
        from_card_id: params.source,
        to_card_id: params.target,
        type: params.type || 'default',
        metadata: {}
      });
    },
    []
  );

  const updateCardPosition = async (cardId: string, position: { x: number; y: number }) => {
    await supabase
      .from('cards')
      .update({ position })
      .eq('id', cardId);
  };

  const handleCardEdit = (card: any) => {
    setSelectedCard(card);
    setShowChat(true);
  };

  const handleCardDelete = async (cardId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa card?')) {
      await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);
    }
  };

  const handleCardUpdate = async (updatedContent: any) => {
    if (!selectedCard) return;
    
    await supabase
      .from('cards')
      .update({ content: updatedContent })
      .eq('id', selectedCard.id);
    
    setShowChat(false);
  };

  const addNewCard = async (type: string) => {
    const viewportCenter = reactFlowInstance.project({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    const newCard = {
      trip_id: tripId,
      type,
      title: `Nuovo ${type}`,
      content: {},
      position: viewportCenter,
      style: {}
    };

    await supabase.from('cards').insert(newCard);
  };

  return (
    <div className="h-full w-full bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gradient-to-br from-gray-900 to-black"
      >
        <Background 
          variant="dots" 
          gap={50} 
          size={1} 
          color="#333"
        />
        <Controls 
          className="bg-gray-800 border border-gray-700"
        />
        <MiniMap 
          className="bg-gray-800 border border-gray-700"
          nodeColor="#6366f1"
        />
        
        {/* Toolbar */}
        <Panel position="top-left" className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2">
          <div className="flex gap-2">
            <button
              onClick={() => addNewCard('destination')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Destinazione"
            >
              📍
            </button>
            <button
              onClick={() => addNewCard('activity')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Attività"
            >
              🎯
            </button>
            <button
              onClick={() => addNewCard('restaurant')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Ristorante"
            >
              🍽️
            </button>
            <button
              onClick={() => addNewCard('hotel')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Hotel"
            >
              🏨
            </button>
            <button
              onClick={() => addNewCard('transport')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Trasporto"
            >
              🚗
            </button>
            <button
              onClick={() => addNewCard('note')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Nota"
            >
              📝
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Contextual Chat Modal */}
      {showChat && selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <ContextualChat
              card={selectedCard}
              onUpdate={handleCardUpdate}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripCanvas({ tripId }: { tripId: string }) {
  return (
    <ReactFlowProvider>
      <TripCanvasInner tripId={tripId} />
    </ReactFlowProvider>
  );
}# WeScape Implementation Plan - Supabase + FastAPI + n8n

## 🎯 Obiettivi del Progetto
- Creare un'applicazione web per la pianificazione di viaggi con AI
- Implementare un sistema di editing collaborativo con versioning
- Orchestrare agenti AI tramite n8n workflows
- Costruire un'interfaccia drag-and-drop stile Figma/Miro

## 🏗️ Architettura Tecnica

### Tech Stack Aggiornato

#### Frontend
```
- Framework: React 18 + TypeScript
- Build Tool: Vite
- Routing: React Router v6
- Styling: Tailwind CSS + Framer Motion
- State Management: Zustand + React Query (Tanstack Query)
- Canvas: React Flow / Konva.js
- Real-time: Supabase Realtime
- Type Safety: TypeScript + Zod
```

#### Backend
```
- Framework: FastAPI (Python)
- Database: Supabase (PostgreSQL + Auth + Storage + Realtime)
- ORM: SQLAlchemy + Alembic
- Workflow Engine: n8n (self-hosted)
- AI Orchestration: n8n workflows + LangChain
- API Documentation: FastAPI automatic OpenAPI
- Background Jobs: Celery + Redis
```

#### Infrastructure
```
- Frontend Hosting: Vercel / Netlify
- Backend Hosting: Railway / Fly.io
- n8n Hosting: Railway / Docker
- Monitoring: Sentry + Supabase Dashboard
- CI/CD: GitHub Actions
```

## 📁 Struttura del Progetto

```
wescape/
├── frontend/                   # React + TypeScript App
│   ├── src/
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── TripCanvas.tsx
│   │   │   │   ├── CardNode.tsx
│   │   │   │   └── ConnectionLine.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ContextualChat.tsx
│   │   │   │   └── ChatMessage.tsx
│   │   │   ├── stations/
│   │   │   │   ├── ProfileStation.tsx
│   │   │   │   └── PreferencesStation.tsx
│   │   │   └── ui/
│   │   ├── hooks/
│   │   │   ├── useSupabase.ts
│   │   │   ├── useRealtimeSync.ts
│   │   │   └── useN8nWorkflow.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   └── api.ts
│   │   ├── stores/
│   │   │   ├── tripStore.ts
│   │   │   └── uiStore.ts
│   │   └── types/
│   │       └── index.ts
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── trips.py
│   │   │   │   ├── cards.py
│   │   │   │   ├── chat.py
│   │   │   │   └── workflows.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── n8n_client.py
│   │   ├── models/
│   │   │   ├── trip.py
│   │   │   ├── card.py
│   │   │   └── version.py
│   │   ├── services/
│   │   │   ├── trip_service.py
│   │   │   ├── ai_service.py
│   │   │   └── workflow_service.py
│   │   └── main.py
│   ├── alembic/
│   └── requirements.txt
├── n8n-workflows/              # n8n Workflow Definitions
│   ├── research-agent/
│   ├── recommendation-agent/
│   ├── budget-optimizer/
│   └── route-planner/
└── docker-compose.yml
```

## 🚀 Fase 1: Setup Iniziale (1 settimana)

### 1.1 Setup Supabase
```sql
-- Supabase SQL Editor: Create tables with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (gestita da Supabase Auth)

-- Trips table
CREATE TABLE trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cards table
CREATE TABLE cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('destination', 'activity', 'restaurant', 'hotel', 'transport', 'note')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  style JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Card versions for history
CREATE TABLE card_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  ai_generated BOOLEAN DEFAULT FALSE,
  prompt TEXT
);

-- Connections between cards
CREATE TABLE connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  to_card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'default',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

-- Realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE connections;
```

### 1.2 Frontend Setup
```bash
# Create React app with Vite
npm create vite@latest wescape-frontend -- --template react-ts
cd wescape-frontend

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-react
npm install @tanstack/react-query zustand
npm install reactflow @react-flow/controls @react-flow/background
npm install tailwindcss framer-motion
npm install axios zod react-hook-form
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Setup Tailwind
npx tailwindcss init -p
```

### 1.3 Supabase Client Configuration
```typescript
// frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Realtime helper
export const subscribeToTrip = (
  tripId: string,
  onCardChange: (payload: any) => void,
  onConnectionChange: (payload: any) => void
) => {
  const channel = supabase.channel(`trip-${tripId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cards',
        filter: `trip_id=eq.${tripId}`
      },
      onCardChange
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'connections',
        filter: `trip_id=eq.${tripId}`
      },
      onConnectionChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
```

### 1.4 FastAPI Backend Setup
```python
# backend/requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.1
celery[redis]==5.3.4
supabase==2.0.3
langchain==0.0.340
openai==1.3.5
```

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import trips, cards, chat, workflows
from app.core.config import settings
from app.core.supabase import init_supabase

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_supabase()
    yield
    # Shutdown

app = FastAPI(
    title="WeScape API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(trips.router, prefix="/api/v1/trips", tags=["trips"])
app.include_router(cards.router, prefix="/api/v1/cards", tags=["cards"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
```

## 🤖 Fase 2: n8n Integration (2 settimane)

### 2.1 n8n Workflow Service
```python
# backend/app/core/n8n_client.py
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

class N8NClient:
    def __init__(self):
        self.base_url = settings.N8N_URL
        self.api_key = settings.N8N_API_KEY
        self.headers = {
            "X-N8N-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
    
    async def trigger_workflow(
        self, 
        workflow_id: str, 
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Trigger an n8n workflow via webhook"""
        webhook_url = f"{self.base_url}/webhook/{workflow_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook_url,
                json=data,
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def get_workflow_status(
        self, 
        execution_id: str
    ) -> Dict[str, Any]:
        """Check workflow execution status"""
        url = f"{self.base_url}/executions/{execution_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()

n8n_client = N8NClient()
```

### 2.2 Workflow Service
```python
# backend/app/services/workflow_service.py
from typing import Dict, Any, List
from app.core.n8n_client import n8n_client
from app.models.card import Card, CardType
from app.core.supabase import supabase

class WorkflowService:
    WORKFLOW_MAPPING = {
        "research_destination": "webhook-research-agent",
        "find_activities": "webhook-activity-finder",
        "optimize_route": "webhook-route-optimizer",
        "analyze_budget": "webhook-budget-analyzer",
        "get_recommendations": "webhook-recommendation-engine"
    }
    
    async def process_card_update(
        self,
        card: Card,
        user_prompt: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process card update through appropriate n8n workflow"""
        
        # Determine workflow based on card type and prompt
        workflow_id = self._get_workflow_id(card.type, user_prompt)
        
        # Prepare workflow data
        workflow_data = {
            "cardId": str(card.id),
            "cardType": card.type,
            "currentContent": card.content,
            "userPrompt": user_prompt,
            "tripContext": context,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Trigger workflow
        result = await n8n_client.trigger_workflow(
            workflow_id, 
            workflow_data
        )
        
        # Save version
        await self._save_card_version(
            card_id=card.id,
            content=result.get("updatedContent", {}),
            ai_generated=True,
            prompt=user_prompt
        )
        
        return result
    
    async def research_destination(
        self, 
        destination: str,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Trigger destination research workflow"""
        
        data = {
            "destination": destination,
            "preferences": preferences,
            "researchDepth": "comprehensive"
        }
        
        return await n8n_client.trigger_workflow(
            self.WORKFLOW_MAPPING["research_destination"],
            data
        )
```

### 2.3 n8n Workflow Example (JSON)
```json
{
  "name": "Research Destination Agent",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "webhook-research-agent",
        "responseMode": "responseNode",
        "options": {}
      }
    },
    {
      "name": "Extract Parameters",
      "type": "n8n-nodes-base.set",
      "position": [450, 300],
      "parameters": {
        "values": {
          "string": [
            {
              "name": "destination",
              "value": "={{$json.destination}}"
            }
          ]
        }
      }
    },
    {
      "name": "Search Web",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 200],
      "parameters": {
        "method": "GET",
        "url": "https://api.serpapi.com/search",
        "qs": {
          "q": "={{$json.destination}} travel guide attractions",
          "api_key": "{{$credentials.serpApiKey}}"
        }
      }
    },
    {
      "name": "OpenAI Analysis",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "position": [850, 300],
      "parameters": {
        "model": "gpt-4-turbo-preview",
        "messages": {
          "messageType": "defineBelow",
          "messages": [
            {
              "role": "system",
              "content": "You are a travel expert. Analyze the search results and create a comprehensive destination guide."
            },
            {
              "role": "user",
              "content": "Destination: {{$node['Extract Parameters'].json.destination}}\n\nSearch Results: {{$node['Search Web'].json}}\n\nCreate a structured guide with attractions, best time to visit, local tips."
            }
          ]
        }
      }
    },
    {
      "name": "Format Response",
      "type": "n8n-nodes-base.set",
      "position": [1050, 300],
      "parameters": {
        "values": {
          "object": {
            "updatedContent": {
              "description": "={{$json.choices[0].message.content}}",
              "attractions": "={{$json.parsed_attractions}}",
              "tips": "={{$json.parsed_tips}}",
              "bestTime": "={{$json.parsed_best_time}}"
            }
          }
        }
      }
    },
    {
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1250, 300],
      "parameters": {
        "responseCode": 200,
        "responseData": "={{$json}}"
      }
    }
  ]
}
```

## 💬 Fase 3: Chat Contestuale e Versioning (2 settimane)

### 3.1 React Component per Chat
```typescript
// frontend/src/components/chat/ContextualChat.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useWorkflow } from '@/hooks/useWorkflow';
import { Card, CardVersion } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextualChatProps {
  card: Card;
  onUpdate: (content: any) => void;
  onClose: () => void;
}

export function ContextualChat({ card, onUpdate, onClose }: ContextualChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [versions, setVersions] = useState<CardVersion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { triggerWorkflow } = useWorkflow();

  // Load version history
  useEffect(() => {
    loadVersionHistory();
  }, [card.id]);

  const loadVersionHistory = async () => {
    const { data, error } = await supabase
      .from('card_versions')
      .select('*')
      .eq('card_id', card.id)
      .order('version_number', { ascending: false });
    
    if (data) setVersions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Trigger n8n workflow
      const result = await triggerWorkflow('process_card_update', {
        cardId: card.id,
        cardType: card.type,
        userPrompt: input,
        currentContent: card.content
      });

      // Add AI response
      const aiMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.explanation || 'Ho aggiornato la card come richiesto.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update card content
      if (result.updatedContent) {
        onUpdate(result.updatedContent);
        await loadVersionHistory(); // Reload versions
      }
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const rollbackToVersion = async (version: CardVersion) => {
    try {
      onUpdate(version.content);
      
      // Save rollback as new version
      await supabase.from('card_versions').insert({
        card_id: card.id,
        content: version.content,
        version_number: versions[0].version_number + 1,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        ai_generated: false,
        prompt: `Rollback to version ${version.version_number}`
      });
      
      await loadVersionHistory();
    } catch (error) {
      console.error('Error rolling back:', error);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Modifica {card.type}: {card.title}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Version History */}
      <div className="flex gap-2 p-4 overflow-x-auto border-b border-gray-800">
        <AnimatePresence>
          {versions.map((version, index) => (
            <motion.button
              key={version.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => rollbackToVersion(version)}
              className={`
                px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all
                ${index === 0 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }
              `}
            >
              v{version.version_number}
              {version.ai_generated && ' 🤖'}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                max-w-[80%] p-3 rounded-lg
                ${message.role === 'assistant'
                  ? 'bg-purple-900/20 border border-purple-800/50 mr-auto'
                  : 'bg-gray-800 ml-auto'
                }
              `}
            >
              <p className="text-sm text-white">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-purple-400">
            <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full" />
            <span className="text-sm">Il travel agent sta elaborando...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chiedi modifiche al travel agent..."
            className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 
                     focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                     rounded-full px-6 py-2 font-medium disabled:opacity-50 
                     hover:shadow-lg transition-all"
          >
            Invia
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 3.2 Custom Hook per Workflow
```typescript
// frontend/src/hooks/useWorkflow.ts
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL;

export function useWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const triggerWorkflow = async (
    workflowType: string,
    data: any
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/workflows/trigger`,
        {
          workflow_type: workflowType,
          data
        },
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Workflow error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkWorkflowStatus = async (executionId: string) => {
    const response = await axios.get(
      `${API_URL}/api/v1/workflows/status/${executionId}`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      }
    );

    return response.data;
  };

  return {
    triggerWorkflow,
    checkWorkflowStatus,
    loading,
    error
  };
}
```

## 🎨 Fase 4: Canvas Interattivo (2 settimane)

### 4.1 Trip Canvas Component
```typescript
// frontend/src/components/canvas/TripCanvas.tsx
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import { supabase } from '@/lib/supabase';
import { subscribeToTrip } from '@/lib/supabase';
import CardNode from './CardNode';
import { ContextualChat } from '../chat/ContextualChat';
import { useTripStore } from '@/stores/tripStore';

const nodeTypes = {
  card: CardNode,
};

function TripCanvasInner({ tripId }: { tripId: string }) {
  const reactFlowInstance = useReactFlow();
  const { trip, cards, connections, updateCard, addCard } = useTripStore();
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);

  // Convert cards to nodes
  useEffect(() => {
    const newNodes = cards.map(card => ({
      id: card.id,
      type: 'card',
      position: card.position,
      data: {
        ...card,
        onEdit: () => handleCardEdit(card),
        onDelete: () => handleCardDelete(card.id)
      }
    }));
    setNodes(newNodes);
  }, [cards]);

  // Convert connections to edges
  useEffect(() => {
    const newEdges = connections.map(conn => ({
      id: conn.id,
      source: conn.from_card_id,
      target: conn.to_card_id,
      type: conn.type || 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1' }
    }));
    setEdges(newEdges);
  }, [connections]);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToTrip(
      tripId,
      (payload) => {
        // Handle card changes
        if (payload.eventType === 'INSERT') {
          useTripStore.getState().addCard(payload.new);
        } else if (payload.eventType === 'UPDATE') {
          useTripStore.getState().updateCard(payload.new.id, payload.new);
        } else if (payload.eventType === 'DELETE') {
          useTripStore.getState().removeCard(payload.old.id);
        }
      },
      (payload) => {
        // Handle connection changes
        if (payload.eventType === 'INSERT') {
          useTripStore.getState().addConnection(payload.new);
        } else if (payload.eventType === 'DELETE') {
          useTripStore.getState().removeConnection(payload.old.id);
        }
      }
    );

    return () => unsubscribe();
  }, [tripId]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      
      // Update position in database
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          updateCardPosition(change.id, change.position);
        }
      });
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    async (params) => {
      // Add edge locally
      setEdges((eds) => addEdge(params, eds));
      
      // Save to database
      await supabase.from('connections').insert({
        from_card_id: params.source,
        to_card_id: params.target,
        type: params.type || 'default',
        metadata: {}
      });
    },
    []
  );

  const updateCardPosition = async (cardId: string, position: { x: number; y: number }) => {
    await supabase
      .from('cards')
      .update({ position })
      .eq('id', cardId);
  };

  const handleCardEdit = (card: any) => {
    setSelectedCard(card);
    setShowChat(true);
  };

  const handleCardDelete = async (cardId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa card?')) {
      await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);
    }
  };

  const handleCardUpdate = async (updatedContent: any) => {
    if (!selectedCard) return;
    
    await supabase
      .from('cards')
      .update({ content: updatedContent })
      .eq('id', selectedCard.id);
    
    setShowChat(false);
  };

  const addNewCard = async (type: string) => {
    const viewportCenter = reactFlowInstance.project({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    const newCard = {
      trip_id: tripId,
      type,
      title: `Nuovo ${type}`,
      content: {},
      position: viewportCenter,
      style: {}
    };

    await supabase.from('cards').insert(newCard);
  };

  return (
    <div className="h-full w-full bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gradient-to-br from-gray-900 to-black"
      >
        <Background 
          variant="dots" 
          gap={50} 
          size={1} 
          color="#333"
        />
        <Controls 
          className="bg-gray-800 border border-gray-700"
        />
        <MiniMap 
          className="bg-gray-800 border border-gray-700"
          nodeColor="#6366f1"
        />
        
        {/* Toolbar */}
        <Panel position="top-left" className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2">
          <div className="flex gap-2">
            <button
              onClick={() => addNewCard('destination')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Destinazione"
            >
              📍
            </button>
            <button
              onClick={() => addNewCard('activity')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Attività"
            >
              🎯
            </button>
            <button
              onClick={() => addNewCard('restaurant')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Ristorante"
            >
              🍽️
            </button>
            <button
              onClick={() => addNewCard('hotel')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Hotel"
            >
              🏨
            </button>
            <button
              onClick={() => addNewCard('transport')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Trasporto"
            >
              🚗
            </button>
            <button
              onClick={() => addNewCard('note')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Aggiungi Nota"
            >
              📝
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Contextual Chat Modal */}
      {showChat && selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <ContextualChat
              card={selectedCard}
              onUpdate={handleCardUpdate}
              onClose={() => setShowChat(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripCanvas({ tripId }: { tripId: string }) {
  return (
    <ReactFlowProvider>
      <TripCanvasInner tripId={tripId} />
    </ReactFlowProvider>
  );
}