import { useState } from 'react';

export interface UploadProgress {
  fileName: string;
  percentage: number;
}

/**
 * Hook for handling room image uploads.
 * Converts image files to data URLs for storage.
 * Note: For production use with large images, consider implementing
 * a proper blob storage solution to avoid storing large base64 strings.
 */
export function useRoomImageUpload() {
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        // Simulate upload progress
        setUploadProgress((prev) => {
          const updated = new Map(prev);
          updated.set(file.name, 0);
          return updated;
        });

        // Read file as data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            resolve(result);
          };
          reader.onerror = () => {
            reject(new Error(`Failed to read file: ${file.name}`));
          };
          reader.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentage = Math.round((event.loaded / event.total) * 100);
              setUploadProgress((prev) => {
                const updated = new Map(prev);
                updated.set(file.name, percentage);
                return updated;
              });
            }
          };
          reader.readAsDataURL(file);
        });

        uploadedUrls.push(dataUrl);

        // Clear progress for this file
        setUploadProgress((prev) => {
          const updated = new Map(prev);
          updated.delete(file.name);
          return updated;
        });
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(new Map());
    }
  };

  const uploadImagesFromDataUrls = async (dataUrls: string[]): Promise<string[]> => {
    // Data URLs are already in the correct format, just return them
    // This function exists for consistency with the upload flow
    if (dataUrls.length === 0) return [];
    
    try {
      return dataUrls;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process images. Please try again.');
    }
  };

  // Calculate overall progress percentage
  const overallProgress = uploadProgress.size > 0
    ? Math.round(Array.from(uploadProgress.values()).reduce((sum, val) => sum + val, 0) / uploadProgress.size)
    : 0;

  return {
    uploadImages,
    uploadImagesFromDataUrls,
    uploadProgress: overallProgress,
    isUploading,
  };
}
