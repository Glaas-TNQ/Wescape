import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Types for entities
export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency: string;
  visibility: 'private' | 'shared' | 'public';
  cover_image?: string;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  trip_id: string;
  type: 'destination' | 'activity' | 'restaurant' | 'hotel' | 'transport' | 'note' | 'dayDivider' | 'nestedCanvas';
  title: string;
  content: Record<string, any>;
  position: { x: number; y: number };
  style: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  trip_id: string;
  from_card_id: string;
  to_card_id: string;
  type: string;
  metadata: Record<string, any>;
  created_at: string;
}

// API Client class
class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string, full_name?: string) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Trip endpoints
  async getTrips(limit = 50, offset = 0): Promise<ApiResponse<Trip[]>> {
    return this.request<Trip[]>(`/trips?limit=${limit}&offset=${offset}`);
  }

  async getTrip(tripId: string): Promise<ApiResponse<Trip>> {
    return this.request<Trip>(`/trips/${tripId}`);
  }

  async getTripFullData(tripId: string): Promise<ApiResponse<{
    trip: Trip;
    cards: Card[];
    connections: Connection[];
  }>> {
    return this.request(`/trips/${tripId}/full`);
  }

  async createTrip(tripData: Partial<Trip>): Promise<ApiResponse<Trip>> {
    return this.request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  async updateTrip(tripId: string, tripData: Partial<Trip>): Promise<ApiResponse<Trip>> {
    return this.request<Trip>(`/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  }

  async deleteTrip(tripId: string): Promise<ApiResponse> {
    return this.request(`/trips/${tripId}`, {
      method: 'DELETE',
    });
  }

  // Card endpoints
  async getTripCards(tripId: string): Promise<ApiResponse<Card[]>> {
    return this.request<Card[]>(`/trips/${tripId}/cards`);
  }

  async createCard(tripId: string, cardData: Partial<Card>): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/trips/${tripId}/cards`, {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  async updateCard(cardId: string, cardData: Partial<Card>): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/trips/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(cardData),
    });
  }

  async deleteCard(cardId: string): Promise<ApiResponse> {
    return this.request(`/trips/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateCards(updates: Array<{id: string} & Partial<Card>>): Promise<ApiResponse<Card[]>> {
    return this.request<Card[]>('/trips/cards/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Connection endpoints
  async getTripConnections(tripId: string): Promise<ApiResponse<Connection[]>> {
    return this.request<Connection[]>(`/trips/${tripId}/connections`);
  }

  async createConnection(tripId: string, connectionData: Partial<Connection>): Promise<ApiResponse<Connection>> {
    return this.request<Connection>(`/trips/${tripId}/connections`, {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  }

  async updateConnection(connectionId: string, connectionData: Partial<Connection>): Promise<ApiResponse<Connection>> {
    return this.request<Connection>(`/trips/connections/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify(connectionData),
    });
  }

  async deleteConnection(connectionId: string): Promise<ApiResponse> {
    return this.request(`/trips/connections/${connectionId}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();