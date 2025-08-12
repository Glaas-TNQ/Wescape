import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string, coverImage?: string) => Promise<void>;
  loading?: boolean;
}

const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isDark } = useTheme();
  const { user } = useAuth();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setCoverImage(null);
      setImagePreview(null);
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Per favore seleziona un file immagine valido');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'immagine non può superare i 5MB');
        return;
      }

      setCoverImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    if (!user) return null;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `trip-covers/${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('trip-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('trip-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    let coverImageUrl: string | undefined;
    
    // Upload image if selected
    if (coverImage) {
      coverImageUrl = await uploadImageToSupabase(coverImage) || undefined;
    }

    await onSubmit(name.trim(), description.trim() || undefined, coverImageUrl);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md p-6 rounded-wescape glass-effect-strong modal-enter ripple-effect"
           style={{ borderColor: 'var(--wescape-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-wescape-text">
            Crea nuovo trip
          </h2>
          
          <button
            onClick={onClose}
            disabled={loading}
            className={`
              p-2 rounded-lg transition-all hover:scale-110
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isDark
                ? 'text-white/60 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white/90' : 'text-gray-700'}
            `}>
              Nome del trip *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Viaggio in Giappone, Weekend a Parigi..."
              disabled={loading}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isDark
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
              `}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white/90' : 'text-gray-700'}
            `}>
              Descrizione (opzionale)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aggiungi dettagli sul tuo trip: destinazioni, durata, tipo di viaggio..."
              disabled={loading}
              rows={3}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isDark
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
              `}
              maxLength={300}
            />
            <div className={`
              text-xs mt-1 text-right
              ${isDark ? 'text-white/50' : 'text-gray-500'}
            `}>
              {description.length}/300
            </div>
          </div>

          {/* Cover Image Selection */}
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white/90' : 'text-gray-700'}
            `}>
              Immagine di copertina (opzionale)
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={loading}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  w-full h-32 border-2 border-dashed rounded-lg transition-all cursor-pointer
                  flex flex-col items-center justify-center gap-2
                  hover:border-blue-400 hover:bg-blue-50/50
                  ${isDark
                    ? 'border-white/20 text-white/60 hover:border-blue-400 hover:bg-blue-500/10'
                    : 'border-gray-300 text-gray-500'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-sm font-medium">Clicca per selezionare un'immagine</span>
                <span className="text-xs opacity-75">JPG, PNG, WebP • Max 5MB</span>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              className="hidden"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${isDark
                  ? 'bg-white/10 text-white/80 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Annulla
            </button>
            
            <button
              type="submit"
              disabled={loading || uploadingImage || !name.trim()}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${isDark
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {loading || uploadingImage ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {uploadingImage ? 'Caricamento immagine...' : 'Creazione...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🚀 Crea trip
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTripModal;