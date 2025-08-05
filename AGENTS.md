# WeScape Agent Rules Standard

When writing terminal commands, consider that the user is on a Windows machine 

## 🧪 Testing & TDD
- **TDD First**: scrivi sempre un test che fallisce prima dell'implementazione (Red-Green-Refactor)
- **Test Fixtures**: usa `tests/fixtures/` per dati di test
- **Coverage**: >90% preferibile, ma punta prima alla copertura funzionale delle business rule
- **Supabase Testing**: I test di integrazione verranno eseguiti sull'ambiente Supabase Cloud.
- **n8n Testing**: testa workflows con dati mock prima del deploy

## 🧠 Principi di Progettazione
- **KISS** (Keep It Simple, Stupid)
- **DRY** (Don't Repeat Yourself)
- **YAGNI** (You Ain't Gonna Need It)
- **SOLID principles**
- **Single Responsibility**: ogni funzione o classe ha una sola responsabilità
- **Modularità**: struttura a componenti riusabili, testabili e indipendenti
- **Estensibilità**: progetta pensando a possibili estensioni future
- **Immutabilità**: prediligi strutture dati immutabili quando possibile
- **Real-time First**: progetta considerando la sincronizzazione real-time

## 🧱 Python-Specific (FastAPI + Supabase)
- **Virtual Environments**: Utilizzare sempre un ambiente virtuale (`venv`) per ogni progetto Python. Le dipendenze devono essere installate e gestite all'interno dell'ambiente virtuale.
- **PEP8**: sempre
- **Type Hints**: obbligatori per tutte le funzioni e metodi
- **Docstrings**: chiari, su classi, metodi e funzioni
- **Context Managers**: usa `with` per gestire risorse (file, connessioni HTTP, ecc.)
- **Logging Centralizzato**: con livelli (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- **Supabase Client**: usa sempre il client asincrono con proper error handling
- **FastAPI Dependencies**: usa dependency injection per Supabase client e auth
- **Pydantic V2**: per validazione input/output e modelli Supabase
- **Async/Await**: obbligatorio per tutte le operazioni I/O
- **Error Handling**: intercetta errori Supabase e trasformali in HTTPException
- **Background Tasks**: usa FastAPI BackgroundTasks per operazioni asincrone
- **Supabase RLS**: sempre abilitato, testa le policy in sviluppo

### FastAPI Structure Pattern:
```python
# app/api/v1/endpoint.py
from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase import get_supabase_client
from app.models.schemas import CreateModel, ResponseModel

router = APIRouter()

@router.post("/", response_model=ResponseModel)
async def create_item(
    item: CreateModel,
    supabase = Depends(get_supabase_client),
    current_user = Depends(get_current_user)
):
    try:
        result = await supabase.table("items").insert(item.dict()).execute()
        return ResponseModel(**result.data[0])
    except Exception as e:
        logger.error(f"Error creating item: {e}")
        raise HTTPException(status_code=400, detail="Creation failed")
```

## 🤖 n8n Workflow Rules
- **Naming Convention**: `webhook-{agent-name}` per webhook triggers
- **Error Handling**: sempre includere nodi di error handling
- **Data Validation**: valida input nei primi nodi del workflow
- **Logging**: usa Set nodes per logging intermedio
- **Modularity**: spezza workflow complessi in sub-workflows
- **Secrets**: usa n8n credentials, mai hardcode API keys
- **Response Format**: standardizza il formato di risposta JSON
- **Timeout**: imposta timeout appropriati per chiamate esterne
- **Retry Logic**: implementa retry per operazioni critiche

### n8n Workflow Structure:
```json
{
  "nodes": [
    {"name": "Webhook", "type": "webhook"},
    {"name": "Validate Input", "type": "set"},
    {"name": "Process Data", "type": "function"},
    {"name": "Error Handler", "type": "if"},
    {"name": "Success Response", "type": "respond"},
    {"name": "Error Response", "type": "respond"}
  ]
}
```

## ⚙️ Tooling e Automazione
- **Makefile** con target: `build`, `run`, `test`, `lint`, `format`, `clean`, `supabase-start`, `supabase-stop`, `n8n-start`
- **Automated Formatting**: `black` per Python, `prettier` per TS
- **Linting**: `flake8`, `pylint` per Python, `eslint` per TS
- **Pre-commit Hooks**: formattazione e linting automatici
- **SQL Script Generation**: Generazione di script SQL per la creazione e modifica delle tabelle del database. L'esecuzione di tali script è manuale.
- **Docker Compose**: per ambiente di sviluppo (n8n).

### Makefile Example:
```makefile
.PHONY: dev-start dev-stop test

dev-start:
	supabase start
	docker-compose up -d n8n
	uvicorn app.main:app --reload

dev-stop:
	supabase stop
	docker-compose down

test:
	pytest tests/ -v --cov=app
```

## 🌐 Frontend Rules (React + Vite + Supabase)
- **React 18** con TypeScript obbligatorio
- **Vite**: per build e dev server
- **Functional Components + Hooks**: no class components
- **Folder by Feature**: organizza per funzionalità, non per tipo
- **Zustand**: per state management globale
- **React Query**: per server state e caching
- **Supabase Client**: configurato con TypeScript types
- **Real-time Subscriptions**: gestite con custom hooks
- **Error Boundaries**: gestione globale degli errori
- **Loading States**: skeleton UI per tutte le operazioni async
- **Optimistic Updates**: per migliore UX
- **Type Safety**: genera types da Supabase schema

### Supabase Integration Pattern:```typescript
// hooks/useSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*');
      if (error) throw error;
      return data;
    }
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trip: CreateTripData) => {
      const { data, error } = await supabase
        .from('trips')
        .insert(trip)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });
};
```

### Real-time Subscription Pattern:
```typescript
// hooks/useRealtimeTrip.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useRealtimeTrip = (tripId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `trip_id=eq.${tripId}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);
};
```

## 🔄 Real-time & Collaboration
- **Optimistic Updates**: applica cambiamenti localmente prima della conferma server
- **Conflict Resolution**: implementa strategia last-write-wins con timestamps
- **Presence System**: traccia utenti attivi con Supabase Presence
- **Debounced Saves**: evita troppi update durante editing
- **Version History**: salva versioni per rollback
- **Real-time Cursors**: mostra posizione altri utenti (opzionale)

### Optimistic Update Pattern:
```typescript
const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCard,
    onMutate: async (newCard) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cards'] });
      
      // Snapshot previous value
      const previousCards = queryClient.getQueryData(['cards']);
      
      // Optimistically update
      queryClient.setQueryData(['cards'], (old: Card[]) => 
        old.map(card => card.id === newCard.id ? newCard : card)
      );
      
      return { previousCards };
    },
    onError: (err, newCard, context) => {
      // Rollback on error
      queryClient.setQueryData(['cards'], context?.previousCards);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    }
  });
};
```

## 🛡️ Sicurezza
- **Environment Variables**: mai segreti in codice, usa `.env` files
- **Supabase RLS**: sempre abilitato per tutte le tabelle
- **JWT Validation**: valida token Supabase in FastAPI middleware
- **CORS**: configurato correttamente per domini autorizzati
- **Rate Limiting**: implementa rate limiting su API endpoints
- **Input Validation**: usa Pydantic per validazione server-side
- **n8n Webhooks**: usa webhook signatures per validazione
- **Error Messages**: mai esporre dettagli interni, solo messaggi user-friendly

### Supabase RLS Policy Example:
```sql
-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policy for user access
CREATE POLICY "Users can access own trips" ON trips
  FOR ALL USING (auth.uid() = user_id);

-- Policy for shared trips (future)
CREATE POLICY "Users can access shared trips" ON trips
  FOR SELECT USING (
    auth.uid() = user_id OR 
    id IN (
      SELECT trip_id FROM trip_shares 
      WHERE user_id = auth.uid()
    )
  );```

## 🌍 API Design (FastAPI + Supabase)
- **RESTful**: rispetta metodi HTTP standard
- **Versioning**: sempre `/api/v1/`
- **Async/Await**: obbligatorio per tutte le route
- **Dependency Injection**: usa FastAPI dependencies per auth e DB
- **Error Handling**: HTTPException con status codes appropriati
- **Response Models**: sempre definire Pydantic response models
- **Pagination**: implementa cursor-based pagination per liste
- **Filtering**: usa query parameters per filtri
- **Supabase Integration**: usa PostgREST patterns quando possibile

### API Endpoint Pattern:
```python
@router.get("/trips", response_model=List[TripResponse])
async def get_trips(
    limit: int = Query(10, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    try:
        result = await supabase.table("trips")\
            .select("*")\
            .eq("user_id", current_user.id)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        return [TripResponse(**trip) for trip in result.data]
    except Exception as e:
        logger.error(f"Error fetching trips: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trips")
```

## 📚 Documentazione
- **README**: setup completo con Supabase e n8n
- **API Docs**: FastAPI genera automaticamente OpenAPI
- **Database Schema**: documenta tabelle e relazioni
- **n8n Workflows**: documenta ogni workflow con esempi
- **Environment Setup**: guida completa per sviluppo locale
- **Deployment Guide**: istruzioni per production
- **Troubleshooting**: problemi comuni e soluzioni

### README Structure:
```markdown
# WeScape

## Quick Start
1. `supabase start`
2. `docker-compose up -d n8n`
3. `make dev-start`

## Environment Variables
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `N8N_WEBHOOK_URL`

## Development
- Backend: `uvicorn app.main:app --reload`
- Frontend: `npm run dev`
- Tests: `make test`