import { type Node, type Connection } from 'reactflow';
import { type NodeType } from '../components/canvas/nodes';

export interface ConnectionRule {
  from: NodeType[];
  to: NodeType[];
  description: string;
}

// Define valid connection rules
export const connectionRules: ConnectionRule[] = [
  // Destinations can connect to activities, restaurants, hotels
  {
    from: ['destination'],
    to: ['activity', 'restaurant', 'hotel', 'note'],
    description: 'Le destinazioni possono collegare attività, ristoranti e hotel'
  },
  
  // Activities can connect to other activities, restaurants, transport
  {
    from: ['activity'],
    to: ['activity', 'restaurant', 'transport', 'note', 'hotel'],
    description: 'Le attività possono collegare altre attività, ristoranti o trasporti'
  },
  
  // Restaurants can connect to activities, hotels, transport
  {
    from: ['restaurant'],
    to: ['activity', 'hotel', 'transport', 'note'],
    description: 'I ristoranti possono collegare attività, hotel o trasporti'
  },
  
  // Hotels can connect to anything (check-in/out points)
  {
    from: ['hotel'],
    to: ['activity', 'restaurant', 'transport', 'note', 'destination'],
    description: 'Gli hotel possono collegare qualsiasi tipo di attività'
  },
  
  // Transport connects activities and locations
  {
    from: ['transport'],
    to: ['destination', 'activity', 'hotel', 'restaurant', 'note'],
    description: 'I trasporti collegano destinazioni e attività'
  },
  
  // Notes can connect to anything for annotations
  {
    from: ['note'],
    to: ['destination', 'activity', 'restaurant', 'hotel', 'transport', 'dayDivider'],
    description: 'Le note possono collegare qualsiasi elemento'
  },
  
  // Day dividers organize the flow
  {
    from: ['dayDivider'],
    to: ['destination', 'activity', 'restaurant', 'hotel', 'dayDivider'],
    description: 'I divisori giorno organizzano il flusso temporale'
  },

  // Nested canvas can connect to everything for complex structures
  {
    from: ['nestedCanvas'],
    to: ['destination', 'activity', 'restaurant', 'hotel', 'transport', 'note', 'dayDivider', 'nestedCanvas'],
    description: 'I canvas annidati possono collegare qualsiasi elemento per strutture complesse'
  },

  // Everything can connect to nested canvas
  {
    from: ['destination', 'activity', 'restaurant', 'hotel', 'transport', 'note', 'dayDivider'],
    to: ['nestedCanvas'],
    description: 'Tutti gli elementi possono collegare a un canvas annidato'
  }
];

// Invalid connection patterns to specifically avoid
export const invalidConnections: Array<{ from: NodeType[], to: NodeType[], reason: string }> = [
  {
    from: ['hotel'],
    to: ['hotel'],
    reason: 'Non puoi collegare direttamente un hotel ad un altro hotel'
  },
  {
    from: ['transport'],
    to: ['transport'],
    reason: 'Non puoi collegare direttamente un trasporto ad un altro trasporto'
  },
  {
    from: ['dayDivider'],
    to: ['transport', 'note'],
    reason: 'I divisori giorno non possono collegare trasporti o note'
  }
];

export const validateConnection = (
  connection: Connection,
  nodes: Node[]
): { isValid: boolean; reason?: string } => {
  if (!connection.source || !connection.target) {
    return { isValid: false, reason: 'Connessione incompleta' };
  }

  // Self-connection check
  if (connection.source === connection.target) {
    return { isValid: false, reason: 'Non puoi collegare un nodo a se stesso' };
  }

  // Get node types
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);
  
  if (!sourceNode || !targetNode) {
    return { isValid: false, reason: 'Nodi non trovati' };
  }

  const sourceType = sourceNode.type as NodeType;
  const targetType = targetNode.type as NodeType;

  // Check for specifically invalid patterns
  for (const invalid of invalidConnections) {
    if (invalid.from.includes(sourceType) && invalid.to.includes(targetType)) {
      return { isValid: false, reason: invalid.reason };
    }
  }

  // Check if connection is in allowed rules
  for (const rule of connectionRules) {
    if (rule.from.includes(sourceType) && rule.to.includes(targetType)) {
      return { isValid: true };
    }
  }

  // If no rule found, it's invalid
  return { 
    isValid: false, 
    reason: `Non puoi collegare ${getNodeTypeLabel(sourceType)} a ${getNodeTypeLabel(targetType)}` 
  };
};

export const getConnectionSuggestion = (sourceType: NodeType): string[] => {
  const suggestions: string[] = [];
  
  for (const rule of connectionRules) {
    if (rule.from.includes(sourceType)) {
      suggestions.push(...rule.to.map(type => getNodeTypeLabel(type)));
    }
  }
  
  return [...new Set(suggestions)]; // Remove duplicates
};

const getNodeTypeLabel = (type: NodeType): string => {
  const labels: Record<NodeType, string> = {
    destination: 'Destinazione',
    activity: 'Attività',
    restaurant: 'Ristorante',
    hotel: 'Hotel',
    transport: 'Trasporto',
    note: 'Nota',
    dayDivider: 'Divisore Giorno',
    nestedCanvas: 'Canvas Annidato',
  };
  return labels[type] || type;
};