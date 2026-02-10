export interface UploadProgress {
  percentage: number;
}

export interface BlobUploadResult {
  url: string;
}

/**
 * Upload an image file to blob storage and return a stable URL
 * Note: This is a placeholder implementation. The actual blob storage
 * functionality needs to be implemented based on the available storage solution.
 * 
 * @param file - The image file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Promise resolving to the stable blob URL
 */
export async function uploadImageToBlob(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  try {
    // Read file as data URL for now (temporary solution)
    // TODO: Replace with actual blob storage implementation
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        if (onProgress) {
          onProgress({ percentage: 100 });
        }
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload multiple images to blob storage
 * @param files - Array of image files to upload
 * @param onProgress - Optional callback for overall progress
 * @returns Promise resolving to array of stable blob URLs
 */
export async function uploadMultipleImages(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const url = await uploadImageToBlob(files[i]);
    urls.push(url);
    
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  
  return urls;
}
