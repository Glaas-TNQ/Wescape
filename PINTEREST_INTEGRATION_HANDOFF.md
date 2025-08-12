# Pinterest Integration Handoff Document

## Overview
This document provides comprehensive guidance for implementing Pinterest pin and collection integration into WeScape's visual trip planning canvas. The integration will allow users to import Pinterest pins and boards directly into their travel planning canvas for visual inspiration and organization.

## Research Summary

### Pinterest API Landscape (2025)
- **Pinterest API v5**: Open API with OAuth authentication, RESTful endpoints
- **Rate Limits**: Managed through API dashboard, sandbox available for testing
- **Key Endpoints**: 
  - `/pins/` - Individual pin management
  - `/boards/` - Collection/board management
  - Analytics endpoints for engagement metrics

### Embedding Technologies Available
1. **iframe Embedding**: Simple, no auth required
2. **JavaScript Widgets**: Dynamic content with `pinit.js`
3. **React Components**: `react-social-media-embed` library with TypeScript support
4. **oEmbed**: Through third-party services like Iframely

## Technical Architecture

### Current WeScape Canvas System
- **State Management**: Zustand store (`frontend/src/stores/canvasStore.ts`)
- **Canvas Engine**: React Flow with custom node types
- **Node System**: Modular architecture in `frontend/src/components/canvas/nodes/`
- **Styling**: Tailwind CSS with custom theming system
- **Type Safety**: Full TypeScript implementation

### Existing Node Structure Analysis
Current node types: `destination`, `activity`, `restaurant`, `hotel`, `transport`, `note`, `dayDivider`, `nestedCanvas`, `image`

**ImageNode** can serve as architectural reference - already handles:
- Image loading states
- Error handling
- Resizable containers
- Custom colors
- Node actions integration

## Implementation Plan

### Phase 1: Core Pinterest Node Components

#### 1.1 PinterestPinNode Component
**Location**: `frontend/src/components/canvas/nodes/PinterestPinNode.tsx`

**Interface Design**:
```typescript
export interface PinterestPinNodeData {
  pinUrl: string;
  pinId?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  boardName?: string;
  customColor?: string | null;
  embedMethod: 'iframe' | 'react-component' | 'api';
  width?: number;
  height?: number;
  isPinned?: boolean; // For visual indication
}
```

**Key Features**:
- Support multiple embedding methods with fallbacks
- Loading states and error handling
- Resizable like ImageNode
- Pinterest branding/icon indicator
- Click-through to original Pinterest pin

#### 1.2 PinterestBoardNode Component
**Location**: `frontend/src/components/canvas/nodes/PinterestBoardNode.tsx`

**Interface Design**:
```typescript
export interface PinterestBoardNodeData {
  boardUrl: string;
  boardId?: string;
  boardName: string;
  pinCount?: number;
  description?: string;
  previewPins?: Array<{
    id: string;
    imageUrl: string;
    title?: string;
  }>;
  customColor?: string | null;
  displayMode: 'grid' | 'carousel' | 'compact';
  maxPreviews?: number; // Default 6
}
```

**Key Features**:
- Grid view of first 6-9 pins as preview
- Expandable to show more pins
- Board metadata display (name, pin count)
- Pinterest board branding

### Phase 2: Integration Points

#### 2.1 Node Registry Updates
**File**: `frontend/src/components/canvas/nodes/index.ts`

Add to exports:
```typescript
import PinterestPinNode from './PinterestPinNode';
import PinterestBoardNode from './PinterestBoardNode';

export const nodeTypes = {
  // ... existing types
  pinterestPin: PinterestPinNode,
  pinterestBoard: PinterestBoardNode,
};
```

#### 2.2 Canvas Store Integration
**File**: `frontend/src/stores/canvasStore.ts`

Add default data generators:
```typescript
const getDefaultNodeData = (type: NodeType) => {
  const defaults = {
    // ... existing defaults
    pinterestPin: {
      title: 'Pinterest Pin',
      pinUrl: '',
      embedMethod: 'react-component' as const,
      customColor: null,
    },
    pinterestBoard: {
      boardName: 'Pinterest Board',
      boardUrl: '',
      displayMode: 'grid' as const,
      maxPreviews: 6,
      customColor: null,
    },
  };
  // ... rest of function
};
```

### Phase 3: Pinterest Integration Service

#### 3.1 Pinterest Service Layer
**Location**: `frontend/src/services/pinterestService.ts`

**Core Functions**:
```typescript
export class PinterestService {
  // URL parsing and validation
  static parsePinterestUrl(url: string): PinterestUrlInfo | null;
  static validatePinterestUrl(url: string): boolean;
  
  // Pin data extraction (via API or scraping)
  static async fetchPinData(pinId: string): Promise<PinData>;
  static async fetchBoardData(boardId: string): Promise<BoardData>;
  
  // Embed code generation
  static generateEmbedCode(pinId: string, method: EmbedMethod): string;
  static generateBoardEmbedCode(boardId: string, method: EmbedMethod): string;
}
```

#### 3.2 Pinterest Hook
**Location**: `frontend/src/hooks/usePinterest.ts`

```typescript
export const usePinterest = () => {
  const importFromUrl = useCallback(async (url: string) => {
    // Validate and parse Pinterest URL
    // Determine if it's a pin or board
    // Create appropriate node in canvas
  }, []);

  return {
    importFromUrl,
    validateUrl: PinterestService.validatePinterestUrl,
  };
};
```

### Phase 4: User Interface Integration

#### 4.1 Import Dialog
**Location**: `frontend/src/components/canvas/modals/PinterestImportModal.tsx`

**Features**:
- URL input with validation
- Preview of what will be imported
- Option to choose embedding method
- Batch import for multiple URLs

#### 4.2 Node Toolbar Integration
Add Pinterest import button to existing canvas toolbar:
- Pinterest icon button
- Opens import dialog
- Paste URL detection

### Phase 5: Enhanced Features

#### 5.1 URL Detection and Auto-Import
- Detect Pinterest URLs in clipboard
- Auto-suggest import when Pinterest URL is pasted
- Bulk import from multiple URLs

#### 5.2 Pinterest Search Integration (Advanced)
- Search Pinterest directly from canvas
- Browse user's Pinterest boards (requires OAuth)
- Quick-add pins from search results

## Technical Implementation Details

### Recommended Tech Stack
1. **Primary**: `react-social-media-embed` library for TypeScript support
2. **Fallback**: iframe embedding for reliability
3. **Future**: Pinterest API v5 for advanced features

### Dependencies to Add
```json
{
  "react-social-media-embed": "^1.x.x"
}
```

### Environment Variables (Optional - for API integration)
```env
VITE_PINTEREST_APP_ID=your_app_id
VITE_PINTEREST_APP_SECRET=your_app_secret
```

### Performance Considerations
- Lazy loading for board previews
- Image optimization and caching
- Debounced URL validation
- Error boundaries for Pinterest embeds

### Security Considerations
- Validate Pinterest URLs server-side if possible
- Sanitize embed codes
- CSP headers for iframe sources
- Rate limiting for API calls

## Testing Strategy

### Unit Tests Required
- `PinterestService.parsePinterestUrl()`
- `PinterestService.validatePinterestUrl()`
- Pinterest node component rendering
- Error state handling

### Integration Tests
- Pinterest URL import flow
- Canvas node creation and manipulation
- Embed loading and fallbacks

### E2E Testing Scenarios
1. Import single Pinterest pin via URL
2. Import Pinterest board with multiple pins
3. Handle invalid Pinterest URLs gracefully
4. Test different embedding methods
5. Verify Pinterest node interactions (edit, delete, connect)

## File Structure

```
frontend/src/
├── components/canvas/nodes/
│   ├── PinterestPinNode.tsx         # New
│   ├── PinterestBoardNode.tsx       # New
│   └── index.ts                     # Update
├── components/canvas/modals/
│   └── PinterestImportModal.tsx     # New
├── services/
│   └── pinterestService.ts          # New
├── hooks/
│   └── usePinterest.ts              # New
└── stores/
    └── canvasStore.ts               # Update
```

## Known Limitations and Considerations

### Pinterest Terms of Service
- Respect Pinterest's embedding guidelines
- Maintain Pinterest branding where required
- Don't modify Pinterest content inappropriately

### Technical Limitations
- iframe embeds may have loading delays
- Pinterest API rate limits (200 requests per hour for basic access)
- Cross-origin restrictions for direct API calls

### UX Considerations
- Loading states for Pinterest content
- Fallback content for failed embeds
- Clear indication that content is from Pinterest
- Respect Pinterest's visual guidelines

## Success Metrics

### Functionality Metrics
- [ ] Successfully import Pinterest pin via URL
- [ ] Successfully import Pinterest board via URL
- [ ] Display Pinterest content in canvas nodes
- [ ] Handle loading and error states gracefully
- [ ] Integrate with existing canvas operations (move, resize, connect, delete)

### Performance Metrics
- Pinterest embeds load within 3 seconds
- No canvas performance degradation with Pinterest nodes
- Graceful handling of network failures

### User Experience Metrics
- Intuitive import process (< 3 clicks)
- Clear visual distinction of Pinterest content
- Seamless integration with existing canvas workflow

## Rollout Plan

### MVP (Minimum Viable Product)
- PinterestPinNode with iframe embedding
- URL import via dialog
- Basic error handling

### V1.1 (Enhanced)
- PinterestBoardNode with grid preview
- Multiple embedding methods with fallbacks
- Improved loading states and UX

### V2.0 (Advanced)
- Pinterest API integration
- Direct Pinterest search in canvas
- User Pinterest boards access (OAuth)
- Analytics and engagement metrics

## Dependencies and Prerequisites

### External Dependencies
- Pinterest Developer Account (for API access)
- `react-social-media-embed` npm package

### Internal Dependencies
- Existing canvas system must be stable
- Node creation/management flows must be working
- Theme system integration required

## Risk Assessment

### High Risk
- Pinterest API changes or deprecation
- Cross-origin security restrictions
- Pinterest Terms of Service violations

### Medium Risk
- Third-party library maintenance
- Performance impact on canvas
- User privacy concerns with Pinterest OAuth

### Low Risk
- UI/UX integration complexity
- Browser compatibility for embeds

## Contact and Support

### Implementation Questions
- Review existing ImageNode implementation for patterns
- Consult canvas store architecture for state management
- Reference theme system for consistent styling

### Pinterest API Support
- Pinterest Developer Documentation: https://developers.pinterest.com/
- Pinterest Developer Community
- API Status Page monitoring

---

**Last Updated**: 2025-08-12  
**Document Version**: 1.0  
**Prepared by**: Claude (Research & Architecture Phase)  
**Next Phase**: Implementation Agent Assignment