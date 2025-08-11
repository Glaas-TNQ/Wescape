import { supabase } from '../lib/supabase';

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an image file to Supabase Storage
 * @param file - The image file to upload
 * @param userId - The user ID for organizing files
 * @param prefix - Optional prefix for the filename (default: 'canvas-image')
 * @returns Promise with upload result
 */
export const uploadImage = async (
  file: File, 
  userId: string, 
  prefix: string = 'canvas-image'
): Promise<UploadImageResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Il file deve essere un\'immagine'
      };
    }

    // Validate file size (max 10MB for canvas images)
    const maxSizeInMB = 10;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        success: false,
        error: `Il file non può superare i ${maxSizeInMB}MB`
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${prefix}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('canvas-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('canvas-images')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (err) {
    console.error('Error uploading image:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Errore nel caricamento dell\'immagine'
    };
  }
};

/**
 * Creates a File object from clipboard image data
 * @param clipboardItem - The clipboard item containing image data
 * @returns Promise with File object or null if no image found
 */
export const getImageFromClipboard = async (clipboardItem: ClipboardItem): Promise<File | null> => {
  try {
    // Check if clipboard item contains image
    const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
    
    if (imageTypes.length === 0) {
      return null;
    }

    // Get the first available image type
    const imageType = imageTypes[0];
    const blob = await clipboardItem.getType(imageType);
    
    // Create File from blob
    const fileName = `screenshot-${Date.now()}.${imageType.split('/')[1]}`;
    return new File([blob], fileName, { type: imageType });
  } catch (err) {
    console.error('Error getting image from clipboard:', err);
    return null;
  }
};

/**
 * Handles paste event and extracts image if present
 * @param event - The paste event
 * @returns Promise with File object or null if no image found
 */
export const handlePasteImage = async (event: ClipboardEvent): Promise<File | null> => {
  try {
    const clipboardItems = event.clipboardData?.items;
    
    if (!clipboardItems) {
      return null;
    }

    // Look for image in clipboard items
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          // Rename file with timestamp
          const fileName = `screenshot-${Date.now()}.${item.type.split('/')[1]}`;
          return new File([file], fileName, { type: item.type });
        }
      }
    }

    // Also check for modern clipboard API
    if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const clipboardItems = await navigator.clipboard.read();
        
        for (const clipboardItem of clipboardItems) {
          const imageFile = await getImageFromClipboard(clipboardItem);
          if (imageFile) {
            return imageFile;
          }
        }
      } catch (err) {
        console.warn('Clipboard API read failed, falling back to legacy method');
      }
    }

    return null;
  } catch (err) {
    console.error('Error handling paste image:', err);
    return null;
  }
};

/**
 * Gets optimal image dimensions while maintaining aspect ratio
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum allowed width (default: 280)
 * @param maxHeight - Maximum allowed height (default: 200)
 * @returns Object with optimized width and height
 */
export const getOptimalImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 280,
  maxHeight: number = 200
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // Scale down if too large
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  // Ensure minimum dimensions
  const minWidth = 100;
  const minHeight = 100;

  if (width < minWidth) {
    width = minWidth;
    height = width / aspectRatio;
  }

  if (height < minHeight) {
    height = minHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
};