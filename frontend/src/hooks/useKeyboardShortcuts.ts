import { useEffect } from 'react';
import { useCanvasStore } from '../stores/canvasStore';

export const useKeyboardShortcuts = () => {
  const { undo, redo, deleteNodes, selectedNodes, autoLayout } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      switch (key.toLowerCase()) {
        case 'z':
          if (isModifierPressed && !shiftKey) {
            event.preventDefault();
            undo();
          } else if (isModifierPressed && shiftKey) {
            event.preventDefault();
            redo();
          }
          break;

        case 'y':
          if (isModifierPressed) {
            event.preventDefault();
            redo();
          }
          break;

        case 'delete':
        case 'backspace':
          if (selectedNodes.length > 0) {
            event.preventDefault();
            deleteNodes(selectedNodes);
          }
          break;

        case 'a':
          if (isModifierPressed) {
            event.preventDefault();
            // Select all nodes (implementation would go in store)
            console.log('Select all nodes');
          }
          break;

        case 'l':
          if (isModifierPressed) {
            event.preventDefault();
            autoLayout();
          }
          break;

        case 'escape':
          // Clear selection or close modals
          if (selectedNodes.length > 0) {
            useCanvasStore.getState().setSelectedNodes([]);
          }
          break;

        // Quick node creation shortcuts
        case '1':
          if (isModifierPressed) {
            event.preventDefault();
            useCanvasStore.getState().addNode('destination', { x: 200, y: 200 });
          }
          break;
        case '2':
          if (isModifierPressed) {
            event.preventDefault();
            useCanvasStore.getState().addNode('activity', { x: 200, y: 200 });
          }
          break;
        case '3':
          if (isModifierPressed) {
            event.preventDefault();
            useCanvasStore.getState().addNode('restaurant', { x: 200, y: 200 });
          }
          break;
        case '4':
          if (isModifierPressed) {
            event.preventDefault();
            useCanvasStore.getState().addNode('hotel', { x: 200, y: 200 });
          }
          break;
        case '5':
          if (isModifierPressed) {
            event.preventDefault();
            useCanvasStore.getState().addNode('transport', { x: 200, y: 200 });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes, undo, redo, deleteNodes, autoLayout]);
};

export default useKeyboardShortcuts;