# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Development Commands

### Windows-Specific Setup
Since this project runs on Windows, use these commands:

#### Python Virtual Environment (Backend)
```bash
# Create virtual environment
python -m venv venv
# Activate (Windows Command Prompt)
venv\Scripts\activate
# Activate (PowerShell)
venv\Scripts\Activate.ps1
# Install dependencies
pip install -r requirements.txt
```

#### Development Server Commands
```bash
# Backend (from backend/ directory)
uvicorn app.main:app --reload

# Frontend (from frontend/ directory)
npm run dev          # Development server (Vite)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

#### Testing Commands
```bash
# Frontend tests (when implemented)
cd frontend
npm test                    # Run tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# Backend tests (when implemented)
cd backend
pytest tests/ -v --cov=app # Run tests with coverage
```

## Development Workflow Requirements

### DevJournal.md Management
**MANDATORY**: Before starting any development task, follow this workflow:

1. **Task Definition**: Clearly define the atomic task boundaries and reasoning
2. **DevJournal Check**: Verify if `DevJournal.md` exists in the root directory
3. **Create DevJournal**: If it doesn't exist, create it with the standard template
4. **Agent Assessment**: Evaluate if a specialized agent from `.claude/agents/` can better handle the task
5. **Agent Delegation**: If appropriate, delegate to the specialized agent
6. **Task Execution**: Complete the task with proper documentation
7. **DevJournal Update**: After task completion, update DevJournal.md with:
   - Task description and reasoning
   - Files modified (with approximate line numbers)
   - Key changes made (high-level, not line-by-line)
   - Completion status and any issues encountered

### DevJournal.md Structure
When creating or updating DevJournal.md, use this format:

```markdown
# Development Journal

## [YYYY-MM-DD] Task: [Task Description]
**Status**: [In Progress/Completed/Blocked]
**Agent**: [Claude/Specialized Agent Name]

### Reasoning
Brief explanation of the approach and decisions made.

### Files Modified
- `path/to/file.ext` (lines ~XX-XX): Description of changes
- `path/to/another/file.ext` (lines ~XX): Description of changes

### Key Changes
- High-level summary of what was implemented
- Any architectural decisions made
- Dependencies added/removed

### Issues/Notes
- Any problems encountered
- Future improvements needed
- Related tasks

---
```

### Task Workflow
1. Always start with reasoning and planning
2. Check if task should be delegated to specialized agents in `.claude/agents/`
3. Document everything in DevJournal.md for human operator visibility
4. Focus on atomic, well-defined tasks
5. Update DevJournal.md immediately after task completion

## Code Development Rules

### Windows Environment Considerations
- When writing terminal commands, consider that the user is on a Windows machine
- Use tools (Read, Edit, Write) before suggesting terminal commands
- Use backslashes for file paths when appropriate

### Testing & TDD Requirements
- **TDD First**: Always write a failing test before implementation (Red-Green-Refactor)
- **Test Fixtures**: Use `tests/fixtures/` for test data
- **Coverage**: >90% preferable, focus on functional coverage of business rules
- **Supabase Testing**: Integration tests will run on Supabase Cloud environment

### Sequential Thinking
When asked to think through complex problems, use the "sequentialthinking" MCP server if available. If not available, inform the user that the sequentialthinking MCP server is not accessible.

## Python-Specific Rules (FastAPI + Supabase)

### Environment & Dependencies
- **Virtual Environments**: Always use a virtual environment (`venv`) for Python projects
- **Dependencies**: Install and manage within the virtual environment
- **Type Hints**: Mandatory for all functions and methods
- **Docstrings**: Required for classes, methods, and functions
- **Async/Await**: Mandatory for all I/O operations

### FastAPI Patterns
```python
# Standard FastAPI endpoint pattern
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

### Supabase Integration Patterns
- **RLS**: Always enable Row Level Security, test policies in development
- **Error Handling**: Transform Supabase errors into HTTPException
- **Background Tasks**: Use FastAPI BackgroundTasks for async operations
- **Client Usage**: Always use async Supabase client with proper error handling

## Frontend Development Rules (React + TypeScript + Vite)

### React Patterns
- **React 18**: With TypeScript mandatory
- **Functional Components**: Use hooks, no class components
- **Folder by Feature**: Organize by functionality, not by type
- **Error Boundaries**: Global error handling
- **Loading States**: Skeleton UI for async operations

### State Management
- **Zustand**: For global state management
- **React Query**: For server state and caching
- **Optimistic Updates**: For better UX
- **Type Safety**: Generate types from Supabase schema

### Supabase Frontend Integration
```typescript
// hooks/useSupabase.ts pattern
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
```

## Project Overview

WeScape is an AI-powered trip planning platform with a visual canvas interface, built using a full-stack architecture with React/TypeScript frontend, FastAPI Python backend, and Supabase for database and real-time features.

## Architecture Overview

### Frontend (React + TypeScript + Vite)
- **Location**: `frontend/` directory
- **Framework**: React 18 with TypeScript, built with Vite
- **State Management**: Zustand for global state, React Query for server state
- **Canvas System**: React Flow for the interactive trip planning canvas
- **UI Library**: Tailwind CSS with Radix UI components
- **Key Libraries**: Framer Motion (animations), Supabase client, Zod (validation)

### Backend (Python + FastAPI)
- **Location**: `backend/` directory  
- **Framework**: FastAPI with Python (minimal setup currently)
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Key Files**: `main.py` (basic FastAPI app), `requirements.txt` (dependencies)

### Database Schema
SQL migration files in `backend/sql/`:
- `01_create_trips_table.sql` - Main trips table
- `02_create_cards_table.sql` - Canvas cards/nodes
- `03_create_card_versions_table.sql` - Version history
- `04_create_connections_table.sql` - Card relationships
- `05_enable_rls_and_policies.sql` - Row Level Security
- `06_enable_realtime_publication.sql` - Real-time subscriptions

## Key Development Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment (Windows)
venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Run FastAPI server
uvicorn app.main:app --reload
```

### Root Level Commands
The root `package.json` contains dependencies for shared libraries used across the project (React Flow, Framer Motion, Zustand).

### Database Management
SQL migration files are managed manually in `backend/sql/`:
- Files are numbered sequentially (01_, 02_, etc.)
- Apply migrations manually to Supabase via SQL editor
- Create new migration files when schema changes are needed

## Core Canvas System

The heart of WeScape is the visual trip planning canvas built with React Flow:

### Canvas Store (`frontend/src/stores/canvasStore.ts`)
- **State Management**: Zustand store managing nodes, edges, history
- **Node Types**: destination, activity, restaurant, hotel, transport, note, dayDivider, nestedCanvas
- **Features**: Undo/redo system, auto-layout, drag & drop, version history
- **Mock AI**: Contains placeholder AI functions for future integration

### Canvas Component (`frontend/src/components/canvas/TripCanvas.tsx`)
- **Main Canvas**: ReactFlow wrapper with custom theming and controls
- **Event Handling**: Custom events for node editing, deletion, color picking
- **Modals**: Node editing, nested canvas, color picker overlays
- **Toast System**: User feedback for actions

### Node Types (`frontend/src/components/canvas/nodes/`)
Each node type has its own component with specific data fields and styling:
- **DestinationNode**: Location, date information
- **ActivityNode**: Time, duration, category
- **RestaurantNode**: Cuisine, price range, rating
- **HotelNode**: Check-in/out dates, star rating
- **TransportNode**: Departure/arrival, transport type
- **NoteNode**: Simple text notes with color coding
- **DayDividerNode**: Timeline organization
- **NestedCanvasNode**: Sub-canvas for detailed planning

## Development Guidelines

### Code Style & Standards
- **Frontend**: Follow existing TypeScript patterns, use functional components with hooks
- **Backend**: Follow FastAPI conventions, use async/await, type hints required
- **Testing**: TDD approach preferred (see AGENTS.md for detailed testing rules)
- **State Management**: Use Zustand for global state, React Query for server state

### Key Patterns

#### Adding New Node Types
1. Create component in `frontend/src/components/canvas/nodes/`
2. Add to node registry in `nodes/index.ts`
3. Update `canvasStore.ts` with default data structure
4. Add corresponding database fields if needed

#### Theme System
- Dark/light mode support via `ThemeContext`
- Color utilities in `frontend/src/utils/themeColors.ts`
- Custom color picker for individual nodes

#### Real-time Features
- Supabase real-time subscriptions for collaborative editing
- Optimistic updates for better UX
- Event-driven architecture for node operations

### Database Integration
- **Supabase**: PostgreSQL with Row Level Security (RLS)
- **Real-time**: WebSocket connections for live collaboration
- **Auth**: Supabase Auth for user management
- **Storage**: Supabase Storage for file uploads

## Testing Strategy

### Current Test Structure
- Test directories exist in `frontend/src/` (contexts, hooks, stores)
- Follow TDD principles as outlined in AGENTS.md
- Integration tests should use Supabase Cloud environment

### Test Commands
```bash
cd frontend
npm test                    # Run tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

## Environment Setup

### Required Environment Variables
```bash
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
```

### Development Workflow
1. Ensure Supabase project is set up and migrations are applied
2. Start backend server: `uvicorn app.main:app --reload` (from backend/)
3. Start frontend: `npm run dev` (from frontend/)
4. Access application at `http://localhost:5173`

## Important Implementation Notes

### Canvas Performance
- Uses React Flow's built-in virtualization for large numbers of nodes
- Custom node sizing to prevent auto-resize issues
- Debounced saves and optimistic updates for smooth UX

### State Synchronization
- Canvas state is managed locally with Zustand
- Future implementation will sync with Supabase for persistence
- Version history system tracks all changes for undo/redo

### AI Integration (Planned)
- Mock AI functions exist in `canvasStore.ts`
- Planned integration with n8n workflows for AI agents
- Contextual chat system for AI-assisted planning

### Mobile Support
- Responsive design with Tailwind CSS
- Touch gesture support in canvas
- PWA capabilities planned for offline usage

## Troubleshooting

### Common Issues
- **Node positioning**: Ensure React Flow ref is properly initialized
- **Theme switching**: Check ThemeContext provider wrapping
- **Canvas not loading**: Verify ReactFlowProvider is at component root
- **Build errors**: Check for TypeScript strict mode compliance

### Performance Optimization
- Use React.memo for complex node components
- Implement virtual scrolling for large datasets
- Optimize Supabase queries with proper indexing
- Use React Query's caching strategies

## Next Development Priorities

Based on the specs document, focus areas include:
1. **Backend API**: Expand FastAPI endpoints for CRUD operations
2. **Supabase Integration**: Connect canvas state to database persistence  
3. **Authentication**: Implement user auth and trip sharing
4. **AI Features**: Integrate n8n workflows for intelligent suggestions
5. **Real-time Collaboration**: Enable multi-user canvas editing
6. **Mobile Experience**: Enhance responsive design and PWA features

## Important Development Notes

### File Operations
- **NEVER create files unless absolutely necessary** for achieving your goal
- **ALWAYS prefer editing** an existing file to creating a new one
- **NEVER proactively create documentation files** (*.md) or README files unless explicitly requested

### Agent System Integration
- Check for specialized agents in `.claude/agents/` directory
- Evaluate if task should be delegated to specialized agent before proceeding
- Follow DevJournal.md workflow for all development tasks

### Architecture References
- See `AGENTS.md` for detailed testing rules and development patterns
- See `backend-architecture-guide.md` for comprehensive backend implementation roadmap
- Follow established patterns in existing codebase