import { type Node, type Edge } from 'reactflow';

export const sampleNodes: Node[] = [
  {
    id: 'destination_1',
    type: 'destination',
    position: { x: 200, y: 100 },
    data: {
      title: 'Roma',
      description: 'La città eterna ti aspetta con la sua storia millenaria',
      date: '15-18 Maggio 2024',
      location: 'Roma, Italia'
    }
  },
  {
    id: 'activity_1',
    type: 'activity',
    position: { x: 500, y: 100 },
    data: {
      title: 'Colosseo',
      description: 'Tour guidato con accesso prioritario ai sotterranei',
      time: 'Giorno 1 • 09:00-12:00',
      duration: '3 ore',
      category: 'Monumenti'
    }
  },
  {
    id: 'restaurant_1',
    type: 'restaurant',
    position: { x: 350, y: 300 },
    data: {
      title: 'Trattoria Monti',
      description: 'Cucina romana autentica nel cuore di Roma',
      time: 'Giorno 1 • 13:00',
      cuisine: 'Romana',
      priceRange: '€€',
      rating: 4.5
    }
  },
  {
    id: 'hotel_1',
    type: 'hotel',
    position: { x: 650, y: 300 },
    data: {
      title: 'Hotel Artemide',
      description: '4★ elegante hotel vicino alla Stazione Termini',
      checkIn: '15 Maggio, 15:00',
      checkOut: '18 Maggio, 11:00',
      stars: 4,
      amenities: ['WiFi', 'Colazione', 'Parcheggio']
    }
  },
  {
    id: 'transport_1',
    type: 'transport',
    position: { x: 100, y: 500 },
    data: {
      title: 'Metro Linea B',
      description: 'Da Termini al Colosseo',
      departure: '08:30 - Termini',
      arrival: '08:35 - Colosseo',
      duration: '5 minuti',
      type: 'train' as const
    }
  },
  {
    id: 'note_1',
    type: 'note',
    position: { x: 800, y: 100 },
    data: {
      title: 'Ricorda!',
      content: 'Portare documento per ingresso Vaticano\\nPrenotare cena per domani sera\\nComprare biglietti autobus turistico',
      color: 'yellow' as const
    }
  },
  {
    id: 'day_1',
    type: 'dayDivider',
    position: { x: 100, y: 50 },
    data: {
      day: 1,
      date: '15 Maggio 2024 • Mercoledì',
      title: 'Primo Giorno - Centro Storico'
    }
  }
];

export const sampleEdges: Edge[] = [
  {
    id: 'destination_1-activity_1',
    source: 'destination_1',
    target: 'activity_1',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 2 }
  },
  {
    id: 'activity_1-restaurant_1',
    source: 'activity_1',
    target: 'restaurant_1',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 }
  },
  {
    id: 'restaurant_1-hotel_1',
    source: 'restaurant_1',
    target: 'hotel_1',
    type: 'smoothstep',
    style: { stroke: '#f59e0b', strokeWidth: 2 }
  },
  {
    id: 'transport_1-activity_1',
    source: 'transport_1',
    target: 'activity_1',
    type: 'smoothstep',
    style: { stroke: '#ef4444', strokeWidth: 2 }
  }
];