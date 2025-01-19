import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  bucket: 'profile-images' | 'vehicle-images';
  onUploadComplete: (url: string) => void;
  currentImage?: string | null;
  className?: string;
}

export default function ImageUpload({ bucket, onUploadComplete, currentImage, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Redimensionner si l'image est trop grande
        const MAX_SIZE = 1200;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte 2D'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Échec de la conversion en blob'));
            }
          },
          'image/jpeg', // Toujours utiliser JPEG pour la compatibilité
          0.85 // Qualité de compression
        );
      };
      
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Format d\'image non supporté. Utilisez JPG, PNG ou GIF');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Traiter l'image
      const processedImage = await processImage(file);
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, processedImage, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onUploadComplete(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Erreur lors du téléchargement. Veuillez réessayer.');
    } finally {
      setIsUploading(false);
    }
  };

  const defaultImage = bucket === 'profile-images' 
    ? 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    : 'https://res.cloudinary.com/ddyrp671i/image/upload/v1737008202/ASAP/default-vehicle.jpg';

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        <img
          src={currentImage || defaultImage}
          alt="Image"
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            {isUploading ? 'Envoi en cours...' : 'Changer l\'image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}