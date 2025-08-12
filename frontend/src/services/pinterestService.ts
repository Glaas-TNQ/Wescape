export interface PinterestUrlInfo {
  type: 'pin' | 'board' | 'user' | 'unknown';
  id: string;
  url: string;
  isValid: boolean;
}

export interface PinData {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  url: string;
  boardName?: string;
  createdAt?: string;
}

export interface BoardData {
  id: string;
  name: string;
  description?: string;
  url: string;
  pinCount?: number;
  coverImage?: string;
  createdAt?: string;
  pins?: Array<{
    id: string;
    imageUrl: string;
    title?: string;
    url: string;
  }>;
}

export type EmbedMethod = 'iframe' | 'react-component' | 'api';

export class PinterestService {
  // URL parsing and validation
  static parsePinterestUrl(url: string): PinterestUrlInfo | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Clean the URL
    const cleanUrl = url.trim();
    
    // Pinterest URL patterns
    const patterns = {
      pin: /(?:https?:\/\/)?(?:www\.)?(?:pinterest\.(?:com|it|co\.uk|fr|de|es|ca|au))\/pin\/(\d+)/i,
      board: /(?:https?:\/\/)?(?:www\.)?(?:pinterest\.(?:com|it|co\.uk|fr|de|es|ca|au))\/([^\/]+)\/([^\/]+)/i,
      user: /(?:https?:\/\/)?(?:www\.)?(?:pinterest\.(?:com|it|co\.uk|fr|de|es|ca|au))\/([^\/]+)\/?$/i,
    };

    // Check for pin
    const pinMatch = cleanUrl.match(patterns.pin);
    if (pinMatch) {
      return {
        type: 'pin',
        id: pinMatch[1],
        url: cleanUrl,
        isValid: true,
      };
    }

    // Check for board
    const boardMatch = cleanUrl.match(patterns.board);
    if (boardMatch && !pinMatch) {
      const username = boardMatch[1];
      const boardName = boardMatch[2];
      
      // Skip if it looks like a pin URL or other special paths
      if (boardName && !['pins', '_saved', '_created'].includes(boardName)) {
        return {
          type: 'board',
          id: `${username}/${boardName}`,
          url: cleanUrl,
          isValid: true,
        };
      }
    }

    // Check for user
    const userMatch = cleanUrl.match(patterns.user);
    if (userMatch) {
      return {
        type: 'user',
        id: userMatch[1],
        url: cleanUrl,
        isValid: false, // Users not supported yet
      };
    }

    return {
      type: 'unknown',
      id: '',
      url: cleanUrl,
      isValid: false,
    };
  }

  static validatePinterestUrl(url: string): boolean {
    const parsed = this.parsePinterestUrl(url);
    return parsed?.isValid || false;
  }

  // Pin data extraction (mock implementation - would integrate with Pinterest API)
  static async fetchPinData(pinId: string): Promise<PinData> {
    // Mock implementation - in real app would use Pinterest API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: pinId,
          title: `Pin ${pinId}`,
          description: 'Pinterest pin description',
          imageUrl: `https://via.placeholder.com/300x400?text=Pin+${pinId}`,
          url: `https://pinterest.com/pin/${pinId}`,
          boardName: 'Sample Board',
          createdAt: new Date().toISOString(),
        });
      }, 1000);
    });
  }

  static async fetchBoardData(boardId: string): Promise<BoardData> {
    // Mock implementation - in real app would use Pinterest API
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockPins = Array.from({ length: 8 }, (_, i) => ({
          id: `${boardId}_pin_${i + 1}`,
          imageUrl: `https://via.placeholder.com/200x300?text=Pin+${i + 1}`,
          title: `Pin ${i + 1}`,
          url: `https://pinterest.com/pin/${boardId}_pin_${i + 1}`,
        }));

        resolve({
          id: boardId,
          name: boardId.split('/').pop() || 'Pinterest Board',
          description: `Pinterest board containing ${mockPins.length} pins`,
          url: `https://pinterest.com/${boardId}`,
          pinCount: mockPins.length,
          coverImage: mockPins[0]?.imageUrl,
          createdAt: new Date().toISOString(),
          pins: mockPins,
        });
      }, 1500);
    });
  }

  // Embed code generation
  static generateEmbedCode(pinId: string, method: EmbedMethod): string {
    switch (method) {
      case 'iframe':
        return `<iframe src="https://assets.pinterest.com/ext/embed.html?id=${pinId}" width="345" height="467" frameborder="0" scrolling="no"></iframe>`;
      
      case 'react-component':
        return `<PinterestEmbed url="https://pinterest.com/pin/${pinId}" width={345} height={467} />`;
      
      case 'api':
        return `// API integration code for pin ${pinId}`;
      
      default:
        return '';
    }
  }

  static generateBoardEmbedCode(boardId: string, method: EmbedMethod): string {
    switch (method) {
      case 'iframe':
        return `<iframe src="https://assets.pinterest.com/ext/embed.html?id=${boardId}" width="400" height="600" frameborder="0" scrolling="no"></iframe>`;
      
      case 'react-component':
        return `<PinterestEmbed url="https://pinterest.com/${boardId}" width={400} height={600} />`;
      
      case 'api':
        return `// API integration code for board ${boardId}`;
      
      default:
        return '';
    }
  }

  // Utility methods
  static extractPinIdFromUrl(url: string): string | null {
    const parsed = this.parsePinterestUrl(url);
    return parsed?.type === 'pin' ? parsed.id : null;
  }

  static extractBoardIdFromUrl(url: string): string | null {
    const parsed = this.parsePinterestUrl(url);
    return parsed?.type === 'board' ? parsed.id : null;
  }

  static isPinterestUrl(url: string): boolean {
    if (!url) return false;
    return /pinterest\.(com|it|co\.uk|fr|de|es|ca|au)/i.test(url);
  }

  // Sample data for testing
  static getSamplePinUrl(): string {
    return 'https://pinterest.com/pin/123456789';
  }

  static getSampleBoardUrl(): string {
    return 'https://pinterest.com/sampleuser/travel-inspiration';
  }

  static getSamplePinData(): PinData {
    return {
      id: 'sample123',
      title: 'Amazing Travel Destination',
      description: 'Beautiful mountain landscape perfect for hiking and photography',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      url: 'https://pinterest.com/pin/sample123',
      boardName: 'Travel Dreams',
      createdAt: new Date().toISOString(),
    };
  }

  static getSampleBoardData(): BoardData {
    const samplePins = [
      {
        id: 'pin1',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=300&fit=crop',
        title: 'Mountain Paradise',
        url: 'https://pinterest.com/pin/pin1',
      },
      {
        id: 'pin2',
        imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=300&fit=crop',
        title: 'Forest Adventure',
        url: 'https://pinterest.com/pin/pin2',
      },
      {
        id: 'pin3',
        imageUrl: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=200&h=300&fit=crop',
        title: 'Ocean View',
        url: 'https://pinterest.com/pin/pin3',
      },
      {
        id: 'pin4',
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=300&fit=crop',
        title: 'Desert Sunset',
        url: 'https://pinterest.com/pin/pin4',
      },
      {
        id: 'pin5',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=300&fit=crop',
        title: 'Forest Path',
        url: 'https://pinterest.com/pin/pin5',
      },
      {
        id: 'pin6',
        imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=300&fit=crop',
        title: 'Mountain Lake',
        url: 'https://pinterest.com/pin/pin6',
      },
    ];

    return {
      id: 'sampleuser/travel-inspiration',
      name: 'Travel Inspiration',
      description: 'A collection of beautiful travel destinations and adventures',
      url: 'https://pinterest.com/sampleuser/travel-inspiration',
      pinCount: samplePins.length,
      coverImage: samplePins[0].imageUrl,
      createdAt: new Date().toISOString(),
      pins: samplePins,
    };
  }
}