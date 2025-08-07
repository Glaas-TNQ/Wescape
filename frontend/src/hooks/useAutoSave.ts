import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCanvasStore } from '../stores/canvasStore';
import { useTripData } from './useTripData';
import { useToast } from './useToast';
import type { Card, Connection } from '../lib/api';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: NodeJS.Timeout;
  let lastArgs: Parameters<T>;
  
  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { cancel: () => void; flush: () => void };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };

  debounced.flush = () => {
    clearTimeout(timeoutId);
    if (lastArgs) {
      func(...lastArgs);
    }
  };

  return debounced;
}

export const useAutoSave = (tripId?: string) => {
  const { nodes, edges } = useCanvasStore();
  const { 
    createCard, 
    updateCard, 
    deleteCard,
    createConnection,
    deleteConnection,
    tripData 
  } = useTripData(tripId);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Keep track of previous state to detect changes
  const previousNodesRef = useRef<typeof nodes>([]);
  const previousEdgesRef = useRef<typeof edges>([]);
  const isInitialLoadRef = useRef(true);
  
  // Debounced save function
  const debouncedSave = useRef(
    debounce(async (currentNodes: typeof nodes, currentEdges: typeof edges) => {
      if (!tripId || isInitialLoadRef.current) return;
      
      try {
        await saveChanges(currentNodes, currentEdges);
        
        // Invalidate trip data to refresh after save
        queryClient.invalidateQueries({ queryKey: ['trip-full', tripId] });
        
        // Show success toast occasionally, not on every save
        if (Math.random() > 0.8) {
          toast.success('Changes saved!');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast.error('Failed to save changes');
      }
    }, 2000) // Save after 2 seconds of inactivity
  ).current;

  const saveChanges = async (currentNodes: typeof nodes, currentEdges: typeof edges) => {
    if (!tripId || !tripData) {
      console.log('Skipping save: missing tripId or tripData', { tripId, tripData: !!tripData });
      return;
    }

    console.log('Starting save process:', { tripId, nodesCount: currentNodes.length, edgesCount: currentEdges.length });
    
    // Convert frontend nodes to backend cards format
    const existingCards = tripData.cards || [];
    const existingConnections = tripData.connections || [];
    
    // Handle node changes
    for (const node of currentNodes) {
      const existingCard = existingCards.find(card => card.id === node.id);
      
      const cardData: Partial<Card> = {
        title: node.data.title || 'Untitled',
        type: node.type as any,
        position: node.position,
        content: node.data,
        style: {
          width: node.width,
          height: node.height,
          customColor: node.data.customColor,
          ...node.style,
        },
      };
      
      if (!existingCard) {
        // Create new card with the node's ID
        try {
          console.log('Creating new card:', { tripId, nodeId: node.id, cardData });
          const cardWithId = { ...cardData, id: node.id };
          const newCard = await createCard({ tripId, cardData: cardWithId });
          console.log('Card created successfully:', newCard);
        } catch (error) {
          console.error('Failed to create card:', error, { tripId, cardData, nodeId: node.id });
        }
      } else {
        // Update existing card if changed
        const hasChanged = 
          JSON.stringify(existingCard.position) !== JSON.stringify(node.position) ||
          JSON.stringify(existingCard.content) !== JSON.stringify(node.data) ||
          existingCard.title !== (node.data.title || 'Untitled');
          
        if (hasChanged) {
          try {
            console.log('Updating card:', { cardId: node.id, cardData });
            await updateCard({ cardId: node.id, cardData });
            console.log('Card updated successfully');
          } catch (error) {
            console.error('Failed to update card:', error, { cardId: node.id, cardData });
          }
        }
      }
    }
    
    // Handle deleted nodes
    for (const existingCard of existingCards) {
      const nodeExists = currentNodes.find(node => node.id === existingCard.id);
      if (!nodeExists) {
        try {
          await deleteCard(existingCard.id);
        } catch (error) {
          console.error('Failed to delete card:', error);
        }
      }
    }
    
    // Handle edge changes
    for (const edge of currentEdges) {
      const existingConnection = existingConnections.find(conn => conn.id === edge.id);
      
      if (!existingConnection) {
        // Create new connection
        const connectionData: Partial<Connection> = {
          id: edge.id,
          from_card_id: edge.source,
          to_card_id: edge.target,
          type: edge.type || 'smoothstep',
          metadata: edge.data || {},
        };
        
        try {
          await createConnection({ tripId, connectionData });
        } catch (error) {
          console.error('Failed to create connection:', error);
        }
      }
    }
    
    // Handle deleted connections
    for (const existingConnection of existingConnections) {
      const edgeExists = currentEdges.find(edge => edge.id === existingConnection.id);
      if (!edgeExists) {
        try {
          await deleteConnection(existingConnection.id);
        } catch (error) {
          console.error('Failed to delete connection:', error);
        }
      }
    }
  };

  // Effect to handle auto-save when nodes or edges change
  useEffect(() => {
    // Skip if no trip data yet
    if (!tripData) {
      console.log('Skipping auto-save effect: no tripData');
      return;
    }
    
    // Skip initial load - when trip data first loads
    if (isInitialLoadRef.current) {
      console.log('Skipping initial load, setting previous state');
      isInitialLoadRef.current = false;
      previousNodesRef.current = [...nodes];
      previousEdgesRef.current = [...edges];
      return;
    }
    
    // Check if there are actual changes
    const nodesChanged = JSON.stringify(previousNodesRef.current) !== JSON.stringify(nodes);
    const edgesChanged = JSON.stringify(previousEdgesRef.current) !== JSON.stringify(edges);
    
    if (nodesChanged || edgesChanged) {
      console.log('Changes detected, triggering save:', { nodesChanged, edgesChanged });
      debouncedSave(nodes, edges);
      
      // Update refs
      previousNodesRef.current = [...nodes];
      previousEdgesRef.current = [...edges];
    }
  }, [nodes, edges, tripData, debouncedSave]);

  // Reset initial load flag when trip changes OR when tripData changes
  useEffect(() => {
    console.log('Trip or tripData changed, resetting initial load flag', { tripId, tripData: !!tripData });
    isInitialLoadRef.current = true;
    // Clear previous refs to avoid false change detection
    previousNodesRef.current = [];
    previousEdgesRef.current = [];
  }, [tripId, tripData]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    // Expose manual save function if needed
    saveNow: () => debouncedSave.flush(),
  };
};