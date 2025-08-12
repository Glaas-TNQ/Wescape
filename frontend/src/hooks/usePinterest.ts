import { useCallback } from 'react';
import { PinterestService, type PinData, type BoardData } from '../services/pinterestService';
import { useCanvasStore } from '../stores/canvasStore';
import { useToast } from './useToast';

export const usePinterest = () => {
  const { addNode } = useCanvasStore();
  const { toast } = useToast();

  const importFromUrl = useCallback(async (url: string, position = { x: 100, y: 100 }) => {
    try {
      const urlInfo = PinterestService.parsePinterestUrl(url);
      
      if (!urlInfo || !urlInfo.isValid) {
        toast.error('URL Pinterest non valido');
        return null;
      }

      if (urlInfo.type === 'pin') {
        toast.info('Importazione pin Pinterest...');
        
        // Fetch pin data (or use mock data for demo)
        let pinData: PinData;
        
        // Use sample data for demo - replace with real API call
        if (urlInfo.id === 'sample' || url.includes('sample')) {
          pinData = PinterestService.getSamplePinData();
        } else {
          pinData = await PinterestService.fetchPinData(urlInfo.id);
        }

        // Create Pinterest pin node
        addNode('pinterestPin', position, {
          pinUrl: url,
          pinId: pinData.id,
          title: pinData.title,
          description: pinData.description,
          imageUrl: pinData.imageUrl,
          boardName: pinData.boardName,
          embedMethod: 'react-component',
          isPinned: true,
        });

        toast.success('Pin Pinterest importato con successo!');
        return { type: 'pin', data: pinData };
      }
      
      if (urlInfo.type === 'board') {
        toast.info('Importazione board Pinterest...');
        
        // Fetch board data (or use mock data for demo)
        let boardData: BoardData;
        
        // Use sample data for demo - replace with real API call
        if (urlInfo.id.includes('sample') || url.includes('sample')) {
          boardData = PinterestService.getSampleBoardData();
        } else {
          boardData = await PinterestService.fetchBoardData(urlInfo.id);
        }

        // Create Pinterest board node
        addNode('pinterestBoard', position, {
          boardUrl: url,
          boardId: boardData.id,
          boardName: boardData.name,
          description: boardData.description,
          pinCount: boardData.pinCount,
          previewPins: boardData.pins?.slice(0, 6),
          displayMode: 'grid',
          maxPreviews: 6,
        });

        toast.success('Board Pinterest importata con successo!');
        return { type: 'board', data: boardData };
      }

    } catch (error) {
      console.error('Error importing Pinterest content:', error);
      toast.error('Errore durante l\'importazione da Pinterest');
      return null;
    }
  }, [addNode, toast]);

  const importSamplePin = useCallback((position = { x: 150, y: 150 }) => {
    return importFromUrl(PinterestService.getSamplePinUrl(), position);
  }, [importFromUrl]);

  const importSampleBoard = useCallback((position = { x: 400, y: 150 }) => {
    return importFromUrl(PinterestService.getSampleBoardUrl(), position);
  }, [importFromUrl]);

  const validateUrl = useCallback((url: string): boolean => {
    return PinterestService.validatePinterestUrl(url);
  }, []);

  const parseUrl = useCallback((url: string) => {
    return PinterestService.parsePinterestUrl(url);
  }, []);

  const isPinterestUrl = useCallback((url: string): boolean => {
    return PinterestService.isPinterestUrl(url);
  }, []);

  return {
    importFromUrl,
    importSamplePin,
    importSampleBoard,
    validateUrl,
    parseUrl,
    isPinterestUrl,
  };
};