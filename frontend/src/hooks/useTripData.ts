import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { Trip, Card, Connection } from '../lib/api';
import { useAuth } from '../components/auth/AuthProvider';
import { useCanvasStore } from '../stores/canvasStore';

export interface TripFullData {
  trip: Trip;
  cards: Card[];
  connections: Connection[];
}

// Hook for managing current trip data
export const useTripData = (tripId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { setNodes, setEdges } = useCanvasStore();

  // Query for trip full data
  const {
    data: tripData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['trip-full', tripId],
    queryFn: async () => {
      if (!tripId) return null;
      const response = await apiClient.getTripFullData(tripId);
      return response.data;
    },
    enabled: !!tripId && !!user,
  });

  // Update canvas store when trip data changes
  useEffect(() => {
    if (tripData) {
      // Convert backend cards to frontend nodes
      const nodes = tripData.cards.map(card => ({
        id: card.id,
        type: card.type,
        position: card.position,
        data: {
          ...card.content,
          title: card.title,
          customColor: card.style?.customColor || null,
        },
        style: card.style,
      }));

      // Convert backend connections to frontend edges
      const edges = tripData.connections.map(conn => ({
        id: conn.id,
        source: conn.from_card_id,
        target: conn.to_card_id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        data: conn.metadata,
      }));

      setNodes(nodes);
      setEdges(edges);
    }
  }, [tripData, setNodes, setEdges]);

  // Mutation for creating cards
  const createCardMutation = useMutation({
    mutationFn: async ({ tripId, cardData }: { tripId: string; cardData: Partial<Card> }) => {
      const response = await apiClient.createCard(tripId, cardData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-full', tripId] });
    },
  });

  // Mutation for updating cards
  const updateCardMutation = useMutation({
    mutationFn: async ({ cardId, cardData }: { cardId: string; cardData: Partial<Card> }) => {
      const response = await apiClient.updateCard(cardId, cardData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-full', tripId] });
    },
  });

  // Mutation for deleting cards
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      await apiClient.deleteCard(cardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-full', tripId] });
    },
  });

  // Mutation for creating connections
  const createConnectionMutation = useMutation({
    mutationFn: async ({ tripId, connectionData }: { tripId: string; connectionData: Partial<Connection> }) => {
      const response = await apiClient.createConnection(tripId, connectionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-full', tripId] });
    },
  });

  // Mutation for deleting connections
  const deleteConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      await apiClient.deleteConnection(connectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-full', tripId] });
    },
  });

  return {
    tripData,
    isLoading,
    error,
    refetch,
    // Mutations
    createCard: createCardMutation.mutateAsync,
    updateCard: updateCardMutation.mutateAsync,
    deleteCard: deleteCardMutation.mutateAsync,
    createConnection: createConnectionMutation.mutateAsync,
    deleteConnection: deleteConnectionMutation.mutateAsync,
    // Mutation states
    isCreatingCard: createCardMutation.isPending,
    isUpdatingCard: updateCardMutation.isPending,
    isDeletingCard: deleteCardMutation.isPending,
    isCreatingConnection: createConnectionMutation.isPending,
    isDeletingConnection: deleteConnectionMutation.isPending,
  };
};

// Hook for managing user's trips list
export const useUserTrips = () => {
  const { user } = useAuth();

  const {
    data: trips,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-trips'],
    queryFn: async () => {
      const response = await apiClient.getTrips();
      return response.data;
    },
    enabled: !!user,
  });

  const queryClient = useQueryClient();

  // Mutation for creating trips
  const createTripMutation = useMutation({
    mutationFn: async (tripData: Partial<Trip>) => {
      const response = await apiClient.createTrip(tripData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-trips'] });
    },
  });

  // Mutation for updating trips
  const updateTripMutation = useMutation({
    mutationFn: async ({ tripId, tripData }: { tripId: string; tripData: Partial<Trip> }) => {
      const response = await apiClient.updateTrip(tripId, tripData);
      return response.data;
    },
    onMutate: async ({ tripId, tripData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-trips'] });
      
      // Snapshot the previous value
      const previousTrips = queryClient.getQueryData<Trip[]>(['user-trips']);
      
      // Optimistically update the cache
      if (previousTrips) {
        const updatedTrips = previousTrips.map(trip =>
          trip.id === tripId ? { ...trip, ...tripData } : trip
        );
        queryClient.setQueryData<Trip[]>(['user-trips'], updatedTrips);
      }
      
      // Return a context object with the snapshotted value
      return { previousTrips };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTrips) {
        queryClient.setQueryData<Trip[]>(['user-trips'], context.previousTrips);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-trips'] });
    },
  });

  // Mutation for deleting trips
  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      await apiClient.deleteTrip(tripId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-trips'] });
    },
  });

  return {
    trips,
    isLoading,
    error,
    refetch,
    // Mutations
    createTrip: createTripMutation.mutateAsync,
    updateTrip: updateTripMutation.mutateAsync,
    deleteTrip: deleteTripMutation.mutateAsync,
    // Mutation states
    isCreatingTrip: createTripMutation.isPending,
    isUpdatingTrip: updateTripMutation.isPending,
    isDeletingTrip: deleteTripMutation.isPending,
  };
};