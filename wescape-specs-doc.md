# WeScape - Specs Driven Development Document

## 📋 Executive Summary

WeScape è una piattaforma di pianificazione viaggi basata su AI che rivoluziona il processo di creazione di itinerari attraverso un approccio conversazionale guidato e un canvas visuale interattivo. Il sistema combina agenti AI orchestrati tramite n8n, collaborazione real-time via Supabase, e un'interfaccia drag-and-drop intuitiva.

---

## 🎯 Business Needs

### Primary Needs
1. **Semplificazione della pianificazione viaggi**: Ridurre il tempo medio di pianificazione da 20+ ore a 2-3 ore
2. **Personalizzazione scalabile**: Fornire itinerari personalizzati senza intervento umano
3. **Collaborazione efficace**: Permettere a gruppi di pianificare insieme senza conflitti
4. **Monetizzazione multi-canale**: Revenue da subscriptions, commissioni booking, e API

### Secondary Needs
1. **Data insights**: Raccolta dati su preferenze e trend di viaggio
2. **Ecosystem creation**: Piattaforma aperta per local experts e agenzie
3. **Brand differentiation**: Posizionamento come "Figma dei viaggi"

---

## 👥 User Personas & Their Needs

### Persona 1: "Il Viaggiatore Solo Esploratore" (Marco, 32)
**Needs:**
- Itinerari flessibili modificabili al volo
- Suggerimenti per esperienze autentiche locali
- Budget tracking in tempo reale
- Backup offline per emergenze

### Persona 2: "La Coppia Organizzata" (Elena & Luca, 28-30)
**Needs:**
- Pianificazione condivisa con votazioni
- Separazione spese e budget
- Mix di attività romantiche e avventura
- Timeline dettagliata con orari

### Persona 3: "Il Gruppo di Amici" (5-8 persone, 25-35)
**Needs:**
- Votazione democratica su destinazioni
- Split delle spese complesso
- Chat integrata per discussioni
- Ruoli e permessi differenziati

### Persona 4: "La Famiglia con Bambini" (Genitori 35-45, bambini 5-12)
**Needs:**
- Filtri per attività family-friendly
- Tempi di spostamento realistici
- Pause e orari flessibili
- Suggerimenti per emergenze (farmacie, ospedali)

---

## 📝 Epic & User Stories

## EPIC 1: Onboarding & Profilazione
*Come utente voglio un processo di onboarding conversazionale che mi guidi nella creazione del mio profilo viaggiatore*

### User Stories

#### US-1.1: Registrazione e Autenticazione
**Come** nuovo utente  
**Voglio** registrarmi con email/social  
**Per** accedere rapidamente alla piattaforma

**Acceptance Criteria:**
- Posso registrarmi con email + password
- Posso usare Google/Facebook OAuth
- Ricevo email di conferma
- Il mio profilo base viene creato automaticamente

**Tasks:**
- [x] T-1.1.1: Setup Supabase Auth con email/password (2h) ✅ **COMPLETATO**
- [ ] T-1.1.2: Configurare Google OAuth in Supabase (2h) ❌ **NON IMPLEMENTATO**
- [ ] T-1.1.3: Configurare Facebook OAuth in Supabase (2h) ❌ **NON IMPLEMENTATO**
- [x] T-1.1.4: Creare componente React per login/signup (4h) ✅ **COMPLETATO**
- [ ] T-1.1.5: Implementare email templates per conferma (2h) ❌ **NON IMPLEMENTATO**
- [x] T-1.1.6: Creare hook useAuth per gestione stato (3h) ✅ **COMPLETATO**
- [x] T-1.1.7: Implementare persistenza sessione (2h) ✅ **COMPLETATO**
- [ ] T-1.1.8: Aggiungere password recovery flow (3h) ❌ **NON IMPLEMENTATO**

#### US-1.2: Stazione Profilazione Base
**Come** utente registrato  
**Voglio** completare il mio profilo viaggiatore via chat  
**Per** ricevere suggerimenti personalizzati

**Acceptance Criteria:**
- Chat guidata mi chiede informazioni base
- Posso rispondere via testo o quick options
- Le risposte vengono salvate nel profilo
- Posso saltare e completare dopo

**Tasks:**
- [ ] T-1.2.1: Design database schema per user_profiles (2h)
- [ ] T-1.2.2: Creare componente StationFlow container (4h)
- [ ] T-1.2.3: Implementare ProfileStation component (6h)
- [ ] T-1.2.4: Creare sistema di quick options dinamiche (3h)
- [ ] T-1.2.5: Implementare salvataggio progressivo profilo (3h)
- [ ] T-1.2.6: Aggiungere animazioni Framer Motion (2h)
- [ ] T-1.2.7: Creare progress indicator component (2h)
- [ ] T-1.2.8: Implementare skip & resume logic (3h)

#### US-1.3: Stazione Preferenze Dettagliate
**Come** utente  
**Voglio** specificare i miei interessi di viaggio  
**Per** ottenere raccomandazioni accurate

**Acceptance Criteria:**
- Selezione multipla di categorie interesse
- Slider per intensità preferenze
- Salvataggio in formato strutturato
- Modifica successiva possibile

**Tasks:**
- [ ] T-1.3.1: Creare PreferencesStation component (6h)
- [ ] T-1.3.2: Design interesse categories data model (2h)
- [ ] T-1.3.3: Implementare multi-select con chips (3h)
- [ ] T-1.3.4: Creare preference intensity sliders (3h)
- [ ] T-1.3.5: Backend endpoint per salvare preferenze (2h)
- [ ] T-1.3.6: Validazione e normalizzazione dati (2h)
- [ ] T-1.3.7: UI per modifica preferenze post-onboarding (4h)

---

## EPIC 2: Canvas Interattivo & Card System
*Come utente voglio un canvas visuale dove posso organizzare gli elementi del mio viaggio*

### User Stories

#### US-2.1: Canvas Base
**Come** utente  
**Voglio** un canvas drag-and-drop  
**Per** organizzare visualmente il mio itinerario

**Acceptance Criteria:**
- Canvas infinito con pan e zoom
- Grid snapping opzionale
- Minimap per navigazione
- Salvataggio automatico posizioni

**Tasks:**
- [x] T-2.1.1: Setup React Flow con TypeScript (3h) ✅ **COMPLETATO**
- [x] T-2.1.2: Configurare canvas controls (zoom, pan) (2h) ✅ **COMPLETATO**
- [x] T-2.1.3: Implementare grid background (2h) ✅ **COMPLETATO**
- [x] T-2.1.4: Aggiungere minimap component (2h) ✅ **COMPLETATO**
- [x] T-2.1.5: Implementare auto-save posizioni (4h) ✅ **COMPLETATO**
- [x] T-2.1.6: Ottimizzare performance per 100+ cards (4h) ✅ **COMPLETATO**
- [x] T-2.1.7: Aggiungere keyboard shortcuts (3h) ✅ **COMPLETATO** (hook implementato)
- [x] T-2.1.8: Implementare undo/redo system (5h) ✅ **COMPLETATO**

#### US-2.2: Card Creation & Types
**Come** utente  
**Voglio** creare diversi tipi di card  
**Per** rappresentare tutti gli elementi del viaggio

**Acceptance Criteria:**
- 6 tipi di card (destination, activity, restaurant, hotel, transport, note)
- Ogni tipo ha template e campi specifici
- Creazione via toolbar o keyboard shortcut
- Posizionamento intelligente nel canvas

**Tasks:**
- [x] T-2.2.1: Definire Card base component (4h) ✅ **COMPLETATO**
- [x] T-2.2.2: Creare DestinationCard component (3h) ✅ **COMPLETATO**
- [x] T-2.2.3: Creare ActivityCard component (3h) ✅ **COMPLETATO**
- [x] T-2.2.4: Creare RestaurantCard component (3h) ✅ **COMPLETATO**
- [x] T-2.2.5: Creare HotelCard component (3h) ✅ **COMPLETATO**
- [x] T-2.2.6: Creare TransportCard component (3h) ✅ **COMPLETATO**
- [x] T-2.2.7: Creare NoteCard component (2h) ✅ **COMPLETATO**
- [x] T-2.2.8: Implementare card creation toolbar (3h) ✅ **COMPLETATO**
- [x] T-2.2.9: Aggiungere smart positioning algorithm (4h) ✅ **COMPLETATO**
- [x] T-2.2.10: Database schema per cards table (2h) ✅ **COMPLETATO**
- [x] T-2.2.11: DayDividerNode component (2h) ✅ **COMPLETATO**
- [x] T-2.2.12: NestedCanvasNode component (3h) ✅ **COMPLETATO**
- [x] T-2.2.13: API endpoints CRUD per cards (4h) ✅ **COMPLETATO**

#### US-2.3: Card Connections
**Come** utente  
**Voglio** collegare le card tra loro  
**Per** definire relazioni e percorsi

**Acceptance Criteria:**
- Drag per creare connessioni
- Diversi tipi di connessione (sequenza, alternativa, gruppo)
- Visualizzazione frecce direzionali
- Cancellazione facile connessioni

**Tasks:**
- [x] T-2.3.1: Implementare connection drawing (4h) ✅ **COMPLETATO**
- [x] T-2.3.2: Creare connection types system (3h) ✅ **COMPLETATO**
- [x] T-2.3.3: Aggiungere arrow markers customizzati (2h) ✅ **COMPLETATO**
- [x] T-2.3.4: Implementare connection validation (3h) ✅ **COMPLETATO**
- [x] T-2.3.5: Database schema per connections (2h) ✅ **COMPLETATO**
- [x] T-2.3.6: API per gestione connections (3h) ✅ **COMPLETATO**
- [x] T-2.3.7: Animazioni per connections attive (2h) ✅ **COMPLETATO**

---

## EPIC 3: AI Integration & Chat Contestuale
*Come utente voglio interagire con AI per modificare e migliorare il mio itinerario*

### User Stories

#### US-3.1: Chat Contestuale per Card
**Come** utente  
**Voglio** chattare con AI su una specifica card  
**Per** modificarla e arricchirla con suggerimenti

**Acceptance Criteria:**
- Double-click apre chat contestuale
- AI conosce contesto card e viaggio
- Modifiche applicate in real-time
- Storia chat preservata

**Tasks:**
- [ ] T-3.1.1: Creare ContextualChat component (6h)
- [ ] T-3.1.2: Implementare chat state management (3h)
- [ ] T-3.1.3: Integrare con backend chat endpoint (4h)
- [ ] T-3.1.4: Creare message bubble components (2h)
- [ ] T-3.1.5: Implementare typing indicator (1h)
- [ ] T-3.1.6: Salvare chat history in database (3h)
- [ ] T-3.1.7: Implementare context injection per AI (4h)
- [ ] T-3.1.8: Aggiungere suggested prompts (2h)

#### US-3.2: n8n Workflow Integration
**Come** sistema  
**Voglio** orchestrare agenti AI via n8n  
**Per** processare richieste complesse

**Acceptance Criteria:**
- Workflows triggerati da chat
- Diversi agenti per diversi task
- Response streaming supportato
- Error handling robusto

**Tasks:**
- [ ] T-3.2.1: Setup n8n instance su Railway (3h)
- [ ] T-3.2.2: Creare n8n client service (4h)
- [ ] T-3.2.3: Implementare webhook endpoints (3h)
- [ ] T-3.2.4: Creare Research Agent workflow (6h)
- [ ] T-3.2.5: Creare Activity Finder workflow (5h)
- [ ] T-3.2.6: Creare Route Optimizer workflow (6h)
- [ ] T-3.2.7: Creare Budget Analyzer workflow (5h)
- [ ] T-3.2.8: Implementare workflow monitoring (4h)
- [ ] T-3.2.9: Aggiungere retry logic (3h)
- [ ] T-3.2.10: Creare execution status tracking (3h)

#### US-3.3: AI-Powered Suggestions
**Come** utente  
**Voglio** ricevere suggerimenti proattivi dall'AI  
**Per** scoprire opportunità che non conoscevo

**Acceptance Criteria:**
- Suggerimenti basati su contesto
- Non intrusivi (dismissable)
- Applicabili con un click
- Learning da feedback utente

**Tasks:**
- [ ] T-3.3.1: Creare suggestion engine service (6h)
- [ ] T-3.3.2: Implementare context analyzer (5h)
- [ ] T-3.3.3: Creare SuggestionToast component (3h)
- [ ] T-3.3.4: Implementare suggestion ranking (4h)
- [ ] T-3.3.5: Aggiungere feedback collection (3h)
- [ ] T-3.3.6: Creare suggestion application logic (4h)
- [ ] T-3.3.7: Implementare A/B testing framework (5h)

---

## EPIC 4: Versioning & History
*Come utente voglio tracciare tutte le modifiche al mio itinerario*

### User Stories

#### US-4.1: Version Control per Cards
**Come** utente  
**Voglio** vedere la storia delle modifiche  
**Per** poter tornare a versioni precedenti

**Acceptance Criteria:**
- Ogni modifica crea nuova versione
- Timeline visuale versioni
- Diff tra versioni
- Rollback con un click

**Tasks:**
- [x] T-4.1.1: Database schema per card_versions (2h) ✅ **COMPLETATO**
- [ ] T-4.1.2: Trigger automatico versioning (3h) ❌ **NON IMPLEMENTATO**
- [ ] T-4.1.3: Creare VersionTimeline component (5h) ❌ **NON IMPLEMENTATO**
- [ ] T-4.1.4: Implementare version diff viewer (4h) ❌ **NON IMPLEMENTATO**
- [ ] T-4.1.5: API endpoint per version history (3h) ❌ **NON IMPLEMENTATO**
- [ ] T-4.1.6: Implementare rollback functionality (3h) ❌ **NON IMPLEMENTATO**
- [ ] T-4.1.7: Aggiungere version annotations (2h) ❌ **NON IMPLEMENTATO**
- [ ] T-4.1.8: Compressione storage vecchie versioni (4h) ❌ **NON IMPLEMENTATO**

#### US-4.2: AI vs Human Changes Tracking
**Come** utente  
**Voglio** distinguere modifiche AI da quelle umane  
**Per** capire origine dei cambiamenti

**Acceptance Criteria:**
- Flag per modifiche AI
- Prompt che ha generato modifica
- Autore per modifiche umane
- Filtri per tipo modifica

**Tasks:**
- [ ] T-4.2.1: Aggiungere metadata a versioni (2h)
- [ ] T-4.2.2: UI per distinguere tipi modifiche (3h)
- [ ] T-4.2.3: Salvare prompts AI utilizzati (2h)
- [ ] T-4.2.4: Implementare filtri timeline (3h)
- [ ] T-4.2.5: Analytics su modifiche AI vs umane (4h)

---

## EPIC 5: Collaborazione Real-time
*Come gruppo voglio pianificare insieme in tempo reale*

### User Stories

#### US-5.1: Multi-user Canvas
**Come** membro del gruppo  
**Voglio** vedere cosa fanno gli altri in real-time  
**Per** coordinare la pianificazione

**Acceptance Criteria:**
- Cursori colorati per ogni utente
- Modifiche propagate istantaneamente
- Indicatore "user typing"
- Gestione conflitti automatica

**Tasks:**
- [ ] T-5.1.1: Setup Supabase Realtime (3h)
- [ ] T-5.1.2: Implementare cursor broadcasting (4h)
- [ ] T-5.1.3: Creare colored cursor component (2h)
- [ ] T-5.1.4: Sincronizzare card changes (4h)
- [ ] T-5.1.5: Implementare presence system (3h)
- [ ] T-5.1.6: Aggiungere user avatars (2h)
- [ ] T-5.1.7: Conflict resolution algorithm (5h)
- [ ] T-5.1.8: Ottimizzare websocket performance (4h)

#### US-5.2: Voting System
**Come** gruppo  
**Voglio** votare su proposte  
**Per** decidere democraticamente

**Acceptance Criteria:**
- Creare proposte da card
- Votazione semplice (sì/no/astenuto)
- Deadline per votazioni
- Risultati automatici

**Tasks:**
- [ ] T-5.2.1: Database schema per proposals (2h)
- [ ] T-5.2.2: Creare VotingCard component (4h)
- [ ] T-5.2.3: Implementare voting logic (3h)
- [ ] T-5.2.4: Notifiche per nuove proposte (3h)
- [ ] T-5.2.5: Timer per deadline votazioni (3h)
- [ ] T-5.2.6: Visualizzazione risultati (2h)
- [ ] T-5.2.7: Applicazione automatica decisioni (3h)

#### US-5.3: Integrated Chat
**Come** gruppo  
**Voglio** discutere nel contesto delle card  
**Per** non perdere informazioni in chat esterne

**Acceptance Criteria:**
- Chat thread per ogni card
- Menzioni @utente
- Notifiche push
- Search nella chat

**Tasks:**
- [ ] T-5.3.1: Implementare chat threads (4h)
- [ ] T-5.3.2: Database schema per messages (2h)
- [ ] T-5.3.3: Creare ChatThread component (4h)
- [ ] T-5.3.4: Implementare mention system (3h)
- [ ] T-5.3.5: Setup push notifications (4h)
- [ ] T-5.3.6: Aggiungere chat search (3h)
- [ ] T-5.3.7: Unread messages indicator (2h)
- [ ] T-5.3.8: Message reactions (2h)

---

## EPIC 6: Timeline & Scheduling
*Come utente voglio organizzare il viaggio nel tempo*

### User Stories

#### US-6.1: Timeline View
**Come** utente  
**Voglio** vedere il viaggio organizzato per giorni  
**Per** capire la sequenza temporale

**Acceptance Criteria:**
- Vista timeline orizzontale
- Drag card su giorni specifici
- Visualizzazione conflitti orari
- Calcolo tempi spostamento

**Tasks:**
- [ ] T-6.1.1: Creare TimelineView component (6h)
- [ ] T-6.1.2: Implementare day containers (3h)
- [ ] T-6.1.3: Drag & drop tra giorni (4h)
- [ ] T-6.1.4: Conflict detection algorithm (4h)
- [ ] T-6.1.5: UI per conflitti temporali (3h)
- [ ] T-6.1.6: Integrazione Google Maps per tempi (4h)
- [ ] T-6.1.7: Auto-arrangement algorithm (5h)
- [ ] T-6.1.8: Export to calendar (3h)

#### US-6.2: Smart Scheduling
**Come** utente  
**Voglio** che l'AI ottimizzi i miei percorsi  
**Per** risparmiare tempo negli spostamenti

**Acceptance Criteria:**
- Analisi percorsi ottimali
- Suggerimenti riorganizzazione
- Considerazione orari apertura
- Calcolo buffer times

**Tasks:**
- [ ] T-6.2.1: Route optimization service (6h)
- [ ] T-6.2.2: Opening hours integration (4h)
- [ ] T-6.2.3: Buffer time calculator (3h)
- [ ] T-6.2.4: Optimization suggestions UI (4h)
- [ ] T-6.2.5: Apply optimization action (3h)
- [ ] T-6.2.6: Travel mode selection (3h)
- [ ] T-6.2.7: Weather consideration (4h)

---

## EPIC 7: Budget Management
*Come utente voglio tracciare e ottimizzare il budget del viaggio*

### User Stories

#### US-7.1: Budget Tracking
**Come** utente  
**Voglio** vedere costi totali e per categoria  
**Per** restare nel budget

**Acceptance Criteria:**
- Input costi per ogni card
- Totali automatici per categoria
- Conversione valute
- Alert superamento budget

**Tasks:**
- [ ] T-7.1.1: Aggiungere campi costo a cards (2h)
- [ ] T-7.1.2: Creare BudgetPanel component (4h)
- [ ] T-7.1.3: Implementare category totals (3h)
- [ ] T-7.1.4: Integrazione exchange rates API (3h)
- [ ] T-7.1.5: Budget alerts system (3h)
- [ ] T-7.1.6: Visualizzazione grafici spesa (4h)
- [ ] T-7.1.7: Export report PDF (3h)

#### US-7.2: Group Expense Splitting
**Come** gruppo  
**Voglio** dividere le spese equamente  
**Per** evitare discussioni su soldi

**Acceptance Criteria:**
- Assegnazione spese a persone
- Calcolo debiti/crediti
- Storico pagamenti
- Settlement suggestions

**Tasks:**
- [ ] T-7.2.1: Database schema per expenses (2h)
- [ ] T-7.2.2: Creare ExpenseSplitter component (5h)
- [ ] T-7.2.3: Algoritmo split calculation (4h)
- [ ] T-7.2.4: Debt tracking system (3h)
- [ ] T-7.2.5: Settlement optimizer (4h)
- [ ] T-7.2.6: Payment confirmation flow (3h)
- [ ] T-7.2.7: Expense history view (3h)

---

## EPIC 8: Integrazioni Esterne
*Come utente voglio prenotare direttamente dall'app*

### User Stories

#### US-8.1: Booking Integration
**Come** utente  
**Voglio** prenotare hotel/voli dall'app  
**Per** non dover cambiare piattaforma

**Acceptance Criteria:**
- Search availability in-app
- Confronto prezzi
- Booking redirect/API
- Conferme salvate

**Tasks:**
- [ ] T-8.1.1: Integrare Booking.com API (8h)
- [ ] T-8.1.2: Integrare Skyscanner API (8h)
- [ ] T-8.1.3: Creare BookingSearch component (5h)
- [ ] T-8.1.4: Price comparison engine (4h)
- [ ] T-8.1.5: Booking flow implementation (6h)
- [ ] T-8.1.6: Salvare booking confirmations (3h)
- [ ] T-8.1.7: Email confirmation sync (4h)

#### US-8.2: Maps & Places Integration
**Come** utente  
**Voglio** informazioni dettagliate sui luoghi  
**Per** fare scelte informate

**Acceptance Criteria:**
- Info da Google Places
- Reviews TripAdvisor
- Photos dei luoghi
- Street View integration

**Tasks:**
- [ ] T-8.2.1: Setup Google Places API (3h)
- [ ] T-8.2.2: TripAdvisor API integration (4h)
- [ ] T-8.2.3: Photo gallery component (3h)
- [ ] T-8.2.4: Reviews aggregator (4h)
- [ ] T-8.2.5: Street View embed (3h)
- [ ] T-8.2.6: Cache places data (3h)
- [ ] T-8.2.7: Offline data sync (5h)

---

## EPIC 9: Mobile Experience
*Come utente voglio accedere al mio itinerario da mobile*

### User Stories

#### US-9.1: Mobile Web App
**Come** utente mobile  
**Voglio** consultare il mio itinerario  
**Per** averlo sempre con me

**Acceptance Criteria:**
- Responsive design
- Touch gestures
- Offline viewing
- Push notifications

**Tasks:**
- [ ] T-9.1.1: Responsive canvas implementation (6h)
- [ ] T-9.1.2: Touch gesture handlers (4h)
- [ ] T-9.1.3: Mobile navigation menu (3h)
- [ ] T-9.1.4: Service worker setup (4h)
- [ ] T-9.1.5: Offline data caching (5h)
- [ ] T-9.1.6: Push notification setup (4h)
- [ ] T-9.1.7: Mobile-specific UI components (5h)
- [ ] T-9.1.8: Performance optimization mobile (4h)

#### US-9.2: Progressive Web App
**Come** utente  
**Voglio** installare l'app sul telefono  
**Per** accesso rapido

**Acceptance Criteria:**
- Installabile da browser
- Icon su home screen
- Splash screen
- Native-like experience

**Tasks:**
- [ ] T-9.2.1: PWA manifest configuration (2h)
- [ ] T-9.2.2: Icon sets generation (2h)
- [ ] T-9.2.3: Splash screen design (2h)
- [ ] T-9.2.4: App shell architecture (4h)
- [ ] T-9.2.5: Background sync implementation (4h)
- [ ] T-9.2.6: Install prompt UI (3h)
- [ ] T-9.2.7: Update notification system (3h)

---

## EPIC 10: Analytics & Insights
*Come utente voglio capire i miei pattern di viaggio*

### User Stories

#### US-10.1: Personal Travel Analytics
**Come** utente  
**Voglio** vedere statistiche sui miei viaggi  
**Per** capire le mie preferenze

**Acceptance Criteria:**
- Dashboard personale
- Trend nel tempo
- Categorie preferite
- Mappa viaggi fatti

**Tasks:**
- [ ] T-10.1.1: Analytics database schema (3h)
- [ ] T-10.1.2: Data collection service (4h)
- [ ] T-10.1.3: Dashboard component (6h)
- [ ] T-10.1.4: Charts implementation (4h)
- [ ] T-10.1.5: Travel map visualization (4h)
- [ ] T-10.1.6: Insights generation algorithm (5h)
- [ ] T-10.1.7: Export analytics report (3h)

#### US-10.2: AI Learning from History
**Come** utente returning  
**Voglio** che l'AI impari dalle mie scelte  
**Per** suggerimenti sempre migliori

**Acceptance Criteria:**
- Preferenze auto-detected
- Suggerimenti basati su storia
- Correzione bias negativi
- Privacy-preserving learning

**Tasks:**
- [ ] T-10.2.1: User preference model (5h)
- [ ] T-10.2.2: Historical data processor (4h)
- [ ] T-10.2.3: ML model training pipeline (8h)
- [ ] T-10.2.4: Preference inference engine (6h)
- [ ] T-10.2.5: Bias detection algorithm (5h)
- [ ] T-10.2.6: Privacy controls UI (3h)
- [ ] T-10.2.7: Model update scheduler (3h)

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Weeks 1-2) ✅ **COMPLETATO**
**Goal:** Setup base infrastructure and auth

**Priority Tasks:**
- ✅ All T-1.1.x (Authentication) - IMPLEMENTATO COMPLETO
- ✅ T-2.1.1 to T-2.1.8 (Canvas completo) - COMPLETATO
- ✅ Database setup - IMPLEMENTATO COMPLETO
- ❌ CI/CD pipeline - DA IMPLEMENTARE

**Deliverable:** ✅ Canvas funzionante CON autenticazione e persistenza

### Phase 2: Core Experience (Weeks 3-4) ✅ **COMPLETATO**
**Goal:** Canvas e sistema di card

**Priority Tasks:**
- ✅ T-2.2.1 to T-2.2.12 (Tutti i tipi di card)
- ✅ Canvas con drag & drop, connessioni, toolbar
- ✅ Theme system (dark/light mode)
- ✅ Color picker per personalizzazione nodi
- ✅ Nested canvas modals
- ✅ Toast notifications system
- ✅ API endpoints CRUD per cards - IMPLEMENTATO COMPLETO

**Deliverable:** ✅ Canvas funzionale con persistenza completa

### Phase 3: AI Integration (Weeks 5-6)
**Goal:** Chat and n8n workflows

**Priority Tasks:**
- All T-3.1.x (Contextual chat)
- T-3.2.1 to T-3.2.6 (Core workflows)
- T-4.1.1 to T-4.1.3 (Basic versioning)

**Deliverable:** AI-powered modifications

### Phase 4: Collaboration (Weeks 7-8)
**Goal:** Real-time multi-user features

**Priority Tasks:**
- T-5.1.1 to T-5.1.5 (Real-time sync)
- T-5.2.1 to T-5.2.6 (Voting)
- T-4.1.4 to T-4.1.6 (Version control)

**Deliverable:** Collaborative planning

### Phase 5: Advanced Features (Weeks 9-10)
**Goal:** Timeline and budget

**Priority Tasks:**
- T-6.1.1 to T-6.1.5 (Timeline)
- T-7.1.1 to T-7.1.5 (Budget tracking)
- T-3.3.1 to T-3.3.3 (AI suggestions)

**Deliverable:** Complete planning toolkit

### Phase 6: Polish & Mobile (Weeks 11-12)
**Goal:** Mobile experience and optimization

**Priority Tasks:**
- T-9.1.1 to T-9.1.5 (Mobile web)
- T-9.2.1 to T-9.2.4 (PWA)
- Performance optimization
- Bug fixes

**Deliverable:** Production-ready MVP

---

## 📊 Success Metrics

### Technical Metrics
- Page load time < 2s
- Time to Interactive < 3s
- Canvas supports 200+ cards smoothly
- Real-time sync latency < 100ms
- 99.9% uptime

### User Metrics
- Onboarding completion rate > 70%
- Average session time > 15 min
- Cards created per trip > 20
- AI interaction rate > 60%
- Mobile usage > 40%

### Business Metrics
- User acquisition cost < €10
- Conversion to paid > 5%
- Monthly Active Users growth > 20%
- Churn rate < 10% monthly
- Revenue per user > €5/month

---

## 🔧 Technical Specifications

### Performance Requirements
- **Frontend Bundle Size**: < 500KB gzipped initial load
- **API Response Time**: p95 < 200ms, p99 < 500ms
- **Database Queries**: Optimized for < 50ms execution
- **Concurrent Users**: Support 10,000 simultaneous canvas sessions
- **Real-time Sync**: Message delivery < 100ms globally
- **AI Response**: First token < 1s, complete response < 5s

### Security Requirements
- **Authentication**: JWT with refresh tokens (15min/7days)
- **Authorization**: Row Level Security on all tables
- **Data Encryption**: TLS 1.3 for transit, AES-256 for rest
- **PII Protection**: GDPR compliant data handling
- **API Rate Limiting**: 100 req/min per user, 1000 req/min per IP
- **Input Validation**: Zod schemas on all endpoints

### Scalability Requirements
- **Database**: Horizontal scaling via read replicas
- **Storage**: CDN for static assets, S3 for user uploads
- **Compute**: Auto-scaling backend instances (2-20)
- **Caching**: Redis for session and API cache
- **Queue**: Celery for async job processing
- **Monitoring**: Real-time alerting for performance degradation

---

## 🎨 Design System Specifications

### Component Library
```typescript
// Core Components Required
- Button (primary, secondary, ghost, danger)
- Input (text, number, date, select)
- Card (base, destination, activity, restaurant, hotel, transport, note)
- Modal (standard, fullscreen, drawer)
- Toast (info, success, warning, error)
- Avatar (user, group, AI)
- Badge (status, count, category)
- Skeleton (card, text, image)
- Dropdown (single, multi, searchable)
- Tabs (standard, pills, underline)
- Timeline (horizontal, vertical)
- Chat (message, bubble, typing)
```

### Color System
```css
/* Primary Palette */
--primary-50: #f5f3ff;
--primary-100: #ede9fe;
--primary-500: #6366f1;
--primary-600: #4f46e5;
--primary-900: #1e1b4b;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Neutral Scale */
--gray-50 to --gray-950

/* Dark Mode */
--background: #0a0a0a;
--surface: #141414;
--border: rgba(255, 255, 255, 0.1);
```

### Typography Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Animation System
```typescript
// Framer Motion Variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideIn = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};

// Transition Presets
const springTransition = { type: "spring", stiffness: 300, damping: 30 };
const easeTransition = { duration: 0.3, ease: "easeInOut" };
```

---

## 📐 Database Schema Details

### Complete Entity Relationship

```sql
-- Core Tables with Relations

-- Users (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  travel_style TEXT[],
  preferences JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  visibility TEXT DEFAULT 'private', -- private, shared, public
  cover_image TEXT,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trip Collaborators
CREATE TABLE trip_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer', -- owner, editor, viewer
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Cards (Extended)
CREATE TABLE cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  size JSONB DEFAULT '{"width": 250, "height": 150}',
  style JSONB DEFAULT '{}',
  day_number INTEGER,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  cost DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  external_id TEXT, -- For integrated bookings
  external_source TEXT, -- booking.com, google_places, etc
  tags TEXT[],
  is_locked BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Card Versions (Extended)
CREATE TABLE card_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  change_type TEXT, -- manual, ai_suggestion, auto_save
  change_description TEXT,
  created_by UUID REFERENCES auth.users(id),
  ai_model TEXT,
  ai_prompt TEXT,
  ai_confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Connections (Extended)
CREATE TABLE connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  from_card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  to_card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'sequence', -- sequence, alternative, dependency
  label TEXT,
  style JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  parent_message_id UUID REFERENCES chat_messages(id),
  content TEXT NOT NULL,
  role TEXT NOT NULL, -- user, assistant, system
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Proposals & Voting
CREATE TABLE proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id),
  proposed_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  proposal_type TEXT, -- add_card, modify_card, delete_card, change_date
  proposal_data JSONB NOT NULL,
  status TEXT DEFAULT 'open', -- open, approved, rejected, expired
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vote TEXT NOT NULL, -- yes, no, abstain
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Expenses & Budget
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  category TEXT,
  description TEXT,
  paid_by UUID REFERENCES auth.users(id),
  split_between UUID[],
  split_type TEXT DEFAULT 'equal', -- equal, percentage, amount
  split_details JSONB DEFAULT '{}',
  receipt_url TEXT,
  is_settled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  trip_id UUID REFERENCES trips(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Workflow Executions
CREATE TABLE workflow_executions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  card_id UUID REFERENCES cards(id),
  workflow_type TEXT NOT NULL,
  n8n_execution_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_cards_trip_id ON cards(trip_id);
CREATE INDEX idx_cards_day_number ON cards(trip_id, day_number);
CREATE INDEX idx_connections_trip ON connections(trip_id);
CREATE INDEX idx_versions_card ON card_versions(card_id, version_number DESC);
CREATE INDEX idx_messages_trip_card ON chat_messages(trip_id, card_id);
CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_analytics_user_trip ON analytics_events(user_id, trip_id);
CREATE INDEX idx_workflow_trip_card ON workflow_executions(trip_id, card_id);

-- Full Text Search
CREATE INDEX idx_cards_search ON cards USING GIN(to_tsvector('english', title || ' ' || COALESCE(subtitle, '')));
CREATE INDEX idx_trips_search ON trips USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

---

## 🔄 API Specifications

### RESTful Endpoints

```typescript
// Authentication Endpoints
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/verify-email/:token

// User Profile Endpoints
GET    /api/v1/profile
PUT    /api/v1/profile
POST   /api/v1/profile/avatar
DELETE /api/v1/profile
GET    /api/v1/profile/preferences
PUT    /api/v1/profile/preferences

// Trips Endpoints
GET    /api/v1/trips                 // List user's trips
POST   /api/v1/trips                 // Create new trip
GET    /api/v1/trips/:id            // Get trip details
PUT    /api/v1/trips/:id            // Update trip
DELETE /api/v1/trips/:id            // Delete trip
POST   /api/v1/trips/:id/duplicate  // Duplicate trip
POST   /api/v1/trips/:id/share      // Share trip
GET    /api/v1/trips/:id/export     // Export trip (PDF/JSON)

// Cards Endpoints
GET    /api/v1/trips/:tripId/cards
POST   /api/v1/trips/:tripId/cards
GET    /api/v1/cards/:id
PUT    /api/v1/cards/:id
DELETE /api/v1/cards/:id
POST   /api/v1/cards/:id/duplicate
GET    /api/v1/cards/:id/versions
POST   /api/v1/cards/:id/rollback/:versionId

// Connections Endpoints
GET    /api/v1/trips/:tripId/connections
POST   /api/v1/trips/:tripId/connections
PUT    /api/v1/connections/:id
DELETE /api/v1/connections/:id

// Chat Endpoints
GET    /api/v1/trips/:tripId/chat
POST   /api/v1/trips/:tripId/chat
GET    /api/v1/cards/:cardId/chat
POST   /api/v1/cards/:cardId/chat
DELETE /api/v1/chat/:messageId

// AI Workflow Endpoints
POST   /api/v1/workflows/trigger
GET    /api/v1/workflows/status/:executionId
POST   /api/v1/workflows/research
POST   /api/v1/workflows/optimize
POST   /api/v1/workflows/suggest
GET    /api/v1/workflows/history/:tripId

// Collaboration Endpoints
GET    /api/v1/trips/:tripId/collaborators
POST   /api/v1/trips/:tripId/collaborators
PUT    /api/v1/trips/:tripId/collaborators/:userId
DELETE /api/v1/trips/:tripId/collaborators/:userId
GET    /api/v1/trips/:tripId/proposals
POST   /api/v1/trips/:tripId/proposals
POST   /api/v1/proposals/:id/vote
GET    /api/v1/proposals/:id/results

// Budget & Expenses Endpoints
GET    /api/v1/trips/:tripId/expenses
POST   /api/v1/trips/:tripId/expenses
PUT    /api/v1/expenses/:id
DELETE /api/v1/expenses/:id
GET    /api/v1/trips/:tripId/budget-summary
POST   /api/v1/expenses/:id/settle

// External Integrations
GET    /api/v1/search/destinations
GET    /api/v1/search/places
GET    /api/v1/search/hotels
GET    /api/v1/search/flights
POST   /api/v1/booking/check-availability
POST   /api/v1/booking/create
GET    /api/v1/weather/:location
GET    /api/v1/exchange-rates

// Analytics Endpoints
POST   /api/v1/analytics/event
GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/insights/:userId
```

### WebSocket Events

```typescript
// Real-time Events via Supabase Realtime
interface RealtimeEvents {
  // Card Events
  'card:created': { tripId: string; card: Card };
  'card:updated': { tripId: string; card: Card };
  'card:deleted': { tripId: string; cardId: string };
  'card:moved': { tripId: string; cardId: string; position: Position };
  
  // Connection Events
  'connection:created': { tripId: string; connection: Connection };
  'connection:deleted': { tripId: string; connectionId: string };
  
  // Collaboration Events
  'user:joined': { tripId: string; user: User };
  'user:left': { tripId: string; userId: string };
  'user:typing': { tripId: string; userId: string; cardId?: string };
  'cursor:moved': { tripId: string; userId: string; position: Position };
  
  // Chat Events
  'message:new': { tripId: string; message: ChatMessage };
  'message:edited': { tripId: string; message: ChatMessage };
  'message:deleted': { tripId: string; messageId: string };
  
  // Voting Events
  'proposal:created': { tripId: string; proposal: Proposal };
  'vote:cast': { proposalId: string; vote: Vote };
  'proposal:resolved': { proposalId: string; result: string };
}
```

---

## 🧪 Testing Strategy

### Testing Pyramid

```
         /\
        /  \    E2E Tests (10%)
       /----\   - Critical user journeys
      /      \  - Cross-browser testing
     /--------\ Integration Tests (30%)
    /          \- API endpoint testing
   /            \- Database operations
  /--------------\- External service mocks
 /                \ Unit Tests (60%)
/------------------\- Component testing
                    - Business logic
                    - Utility functions
```

### Test Specifications

#### Unit Tests
```typescript
// Example Test Structure
describe('CardComponent', () => {
  it('should render with correct type icon', () => {});
  it('should handle drag events', () => {});
  it('should emit edit event on double-click', () => {});
  it('should show version badge when modified', () => {});
});

describe('BudgetCalculator', () => {
  it('should sum expenses by category', () => {});
  it('should convert currencies correctly', () => {});
  it('should detect budget overruns', () => {});
  it('should calculate split amounts', () => {});
});
```

#### Integration Tests
```python
# API Test Example
class TestTripEndpoints:
    def test_create_trip_authenticated(self):
        """Should create trip for authenticated user"""
    
    def test_create_trip_unauthenticated(self):
        """Should return 401 for unauthenticated request"""
    
    def test_update_trip_owner_only(self):
        """Should allow only owner to update trip"""
    
    def test_share_trip_creates_collaborators(self):
        """Should add collaborators when sharing trip"""
```

#### E2E Tests
```typescript
// Playwright Test Example
test('Complete trip planning flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  
  // Complete onboarding
  await page.click('text=Nuovo Viaggio');
  await page.click('text=Viaggio Solo');
  await page.click('text=Arte e Cultura');
  
  // Create cards
  await page.click('[title="Aggiungi Destinazione"]');
  await page.fill('[name=title]', 'Roma');
  
  // Verify canvas state
  await expect(page.locator('.floating-card')).toHaveCount(1);
});
```

---

## 📦 Deployment Strategy

### Environment Setup

```yaml
# Development Environment
development:
  frontend_url: http://localhost:5173
  backend_url: http://localhost:8000
  supabase_url: https://[project-id].supabase.co
  n8n_url: http://localhost:5678
  
# Staging Environment
staging:
  frontend_url: https://staging.wescape.app
  backend_url: https://api-staging.wescape.app
  supabase_url: https://[staging-project].supabase.co
  n8n_url: https://n8n-staging.wescape.app

# Production Environment
production:
  frontend_url: https://wescape.app
  backend_url: https://api.wescape.app
  supabase_url: https://[prod-project].supabase.co
  n8n_url: https://n8n.wescape.app
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Unit Tests
        run: npm test
      - name: Run Integration Tests
        run: pytest
      - name: Run E2E Tests
        run: npm run test:e2e

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Frontend
        run: npm run build
      - name: Deploy to Vercel
        run: vercel deploy --prod

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Image
        run: docker build -t wescape-api .
      - name: Deploy to Railway
        run: railway up

  deploy-workflows:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Export n8n Workflows
        run: n8n export:workflow --all
      - name: Deploy to n8n Instance
        run: n8n import:workflow
```

---

## 🔍 Monitoring & Observability

### Key Metrics to Track

```typescript
// Performance Metrics
- API Response Time (p50, p95, p99)
- Canvas Frame Rate
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

// Business Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User Retention (D1, D7, D30)
- Feature Adoption Rate
- AI Usage per User
- Average Cards per Trip
- Collaboration Rate

// Error Metrics
- API Error Rate
- Frontend Error Rate
- AI Workflow Failure Rate
- Payment Failure Rate

// Infrastructure Metrics
- CPU Usage
- Memory Usage
- Database Connection Pool
- Queue Length
- Storage Usage
```

### Monitoring Stack

```yaml
monitoring:
  apm: Sentry
  logs: LogRocket
  analytics: Mixpanel
  infrastructure: Datadog
  uptime: Better Uptime
  error_tracking: Sentry
  user_session: FullStory
```

---

## 📋 Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase rate limits | Medium | High | Implement caching, optimize queries |
| n8n workflow failures | Medium | Medium | Retry logic, fallback to direct AI calls |
| Canvas performance with many cards | Low | High | Virtual scrolling, lazy loading |
| Real-time sync conflicts | Medium | Medium | CRDT implementation, conflict resolution UI |
| AI response quality | Low | High | Multiple model fallbacks, human review option |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low user adoption | Medium | High | Strong onboarding, referral program |
| High AI costs | High | Medium | Usage limits, tier-based pricing |
| Competition from big players | Medium | High | Focus on niche features, better UX |
| Data privacy concerns | Low | High | GDPR compliance, data encryption |
| Seasonal usage patterns | High | Medium | Diversify markets, off-season features |

---

## 🎯 Definition of Done

### Feature Level DoD
- [ ] Code complete and peer reviewed
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Accessibility checked (WCAG 2.1 AA)
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Deployed to staging
- [ ] Product owner acceptance

### Sprint Level DoD
- [ ] All stories meet Feature DoD
- [ ] E2E tests passing
- [ ] No critical bugs
- [ ] Performance regression tests passing
- [ ] Deployment guide updated
- [ ] Sprint retrospective completed

### Release Level DoD
- [ ] All sprints complete
- [ ] Production deployment successful
- [ ] Monitoring alerts configured
- [ ] Analytics tracking verified
- [ ] Marketing materials ready
- [ ] Support documentation complete
- [ ] Load testing completed
- [ ] Rollback plan tested

---

## 📚 Appendix

### Glossary
- **Card**: Visual representation of a trip element (destination, activity, etc.)
- **Canvas**: Interactive workspace for trip planning
- **Station**: Conversational flow step in onboarding
- **Connection**: Link between cards showing relationships
- **Workflow**: n8n automation for AI processing
- **Proposal**: Suggested change requiring group approval
- **Settlement**: Process of balancing group expenses

### References
- [Supabase Documentation](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io)
- [React Flow Documentation](https://reactflow.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Figma API](https://www.figma.com/developers/api)

### Version History
- v1.0.0 - Initial specification document
- v1.1.0 - Added detailed database schema
- v1.2.0 - Extended API specifications
- v1.3.0 - Added testing and deployment strategies

---

## 📊 Stato Attuale Implementazione (Gennaio 2025)

### ✅ Cosa è stato implementato:

**🎯 BACKEND COMPLETO (Epic 1 - Authentication & Database):**
- ✅ **FastAPI Backend** con architettura completa
- ✅ **Sistema di autenticazione Supabase** con JWT tokens
- ✅ **Database Schema completo** con 6 tabelle (users, trips, cards, connections, versions)
- ✅ **Row Level Security (RLS)** per tutti i dati
- ✅ **API endpoints completi** per Trip, Card e Connection management
- ✅ **Real-time ready** con Supabase Realtime setup

**🎯 FRONTEND INTEGRATO:**
- ✅ **AuthProvider** con login/signup completo
- ✅ **React Query** per data fetching e caching
- ✅ **API Client** integrato con backend FastAPI
- ✅ **TripSelector** per gestione progetti
- ✅ **Persistenza completa** del canvas su database
- ✅ **Error handling** e loading states

**🎯 CANVAS SYSTEM (Epic 2 - COMPLETO):**
- ✅ Canvas React Flow con tutti i controlli (pan, zoom, minimap, background)
- ✅ **8 tipi di nodi**: Destination, Activity, Restaurant, Hotel, Transport, Note, DayDivider, NestedCanvas
- ✅ Sistema di connessioni con validazione e animazioni
- ✅ Drag & drop con toolbar per creazione nodi
- ✅ Undo/redo system con history
- ✅ Keyboard shortcuts
- ✅ Theme system (dark/light mode) con ThemeContext
- ✅ Color picker per personalizzazione nodi
- ✅ Toast notifications system
- ✅ Empty state component
- ✅ Node edit modal e nested canvas modal
- ✅ Auto-positioning e smart layout
- ✅ State management con Zustand

**🎯 TECH STACK COMPLETO:**
- ✅ **Frontend**: React 19, TypeScript, React Flow 11, Zustand, Tailwind CSS, Framer Motion, Radix UI, Zod, React Query
- ✅ **Backend**: FastAPI, Supabase (PostgreSQL), Pydantic, JWT Auth
- ✅ **Database**: PostgreSQL con RLS, JSONB support, triggers
- ✅ **Infrastructure**: Ready per deploy su Railway/Vercel

### 🚧 Stato Epic Implementation:

**Epic 1 - Onboarding & Authentication: ✅ COMPLETATO (100%)**
- ✅ Registrazione e login funzionale
- ✅ User profiles table
- ❌ Onboarding conversazionale (da implementare dopo MVP)

**Epic 2 - Canvas Interattivo: ✅ COMPLETATO (100%)**
- ✅ Tutti i componenti canvas implementati
- ✅ Persistenza su database
- ✅ UI/UX completa

**Epic 3 - AI Integration: ❌ NON INIZIATO**
- ❌ Chat contestuale per nodi
- ❌ n8n workflows
- ❌ AI suggestions

**Epic 4 - Versioning: ⚠️ PARZIALE (20%)**
- ✅ Database schema per versioni
- ❌ UI per version history
- ❌ Rollback functionality

**Epic 5 - Collaborazione: ⚠️ INFRASTRUTTURA PRONTA (30%)**
- ✅ Database setup per real-time
- ✅ Supabase Realtime configurato
- ❌ Multi-user UI
- ❌ Chat integrata
- ❌ Voting system

### 🎯 MVP STATUS: **85% COMPLETATO**

**✅ Funzionalità MVP Pronte:**
- Sistema completo di autenticazione
- Canvas funzionale con persistenza
- Gestione trip completa
- UI/UX responsive
- Backend API robusto

**❌ Funzionalità mancanti per MVP:**
- ❌ Mobile optimization
- ❌ PWA setup
- ❌ Deploy e test in produzione

---

*Document maintained by: WeScape Development Team*  
*Last updated: Gennaio 2025*  
*Next review: Pre-Deploy MVP*

---

## 🎯 ROADMAP AGGIORNATA - Prossimi Passi

### 🚀 Ready for MVP Deploy (Settimana corrente)
**Priorità ALTA - MVP Deployment Ready**

1. **Deploy Infrastructure Setup**
   - Setup Supabase Production Project
   - Deploy FastAPI backend su Railway
   - Deploy React frontend su Vercel
   - Configurazione domini e SSL

2. **Environment Configuration** 
   - Produzione environment variables
   - Database migration scripts
   - API endpoint configuration
   - CORS domains setup

3. **Testing & Validation**
   - End-to-end testing del flusso completo
   - Performance testing con dati reali  
   - Security audit delle API
   - Mobile responsiveness verification

### 🎯 Post-MVP Enhancements (Settimane successive)

**Epic 5 - Real-time Collaboration (Priority 1)**
- Multi-user canvas editing
- Live cursors e presence
- Conflict resolution
- Chat integrata per trip

**Epic 9 - Mobile & PWA (Priority 2)** 
- Mobile touch gestures
- PWA configuration
- Offline capabilities
- App store optimization

**Epic 3 - AI Integration (Priority 3)**
- Chat contestuale per nodi
- n8n workflow setup
- AI-powered suggestions
- Smart trip templates

### 📊 SUCCESS METRICS Target MVP
- **Authentication**: 95%+ successful login rate
- **Canvas Performance**: <2s load time, 60fps interactions
- **Data Persistence**: 99.9% save success rate  
- **User Experience**: <3 clicks per action
- **Mobile Usage**: 70%+ responsive compatibility