import { useState } from 'react';
import { uploadImageToBlob } from '../utils/roomBlobStorage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadProgress {
  file: string;
  percentage: number;
}

export interface UploadResult {
  url: string;
  file: File;
}

export function useRoomImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP, GIF`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 5MB`;
    }
    return null;
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setUploading(true);
    setError(null);
    setProgress([]);

    try {
      // Validate all files first
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }
      }

      const urls: string[] = [];

      // Upload files sequentially with progress tracking
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const url = await uploadImageToBlob(file, ({ percentage }) => {
            setProgress((prev) => {
              const updated = [...prev];
              updated[i] = { file: file.name, percentage };
              return updated;
            });
          });
          
          urls.push(url);
        } catch (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }

      setUploading(false);
      return urls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
      setError(errorMessage);
      setUploading(false);
      throw new Error(errorMessage);
    }
  };

  const uploadSingleImage = async (file: File): Promise<string> => {
    const urls = await uploadImages([file]);
    return urls[0];
  };

  return {
    uploadImages,
    uploadSingleImage,
    uploading,
    progress,
    error,
  };
}
