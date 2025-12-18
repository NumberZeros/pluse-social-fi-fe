/**
 * IPFS Upload Service
 * Handles uploading post files and metadata to IPFS via Pinata
 * With mock storage fallback for development
 */

import { uploadFileToPinata, uploadJSONToPinata, hasPinataCredentials } from './pinata';

export interface PostMetadata {
  content: string;
  images?: string[];
  videos?: string[];
  timestamp?: number;
}

/**
 * Upload file to IPFS via Pinata (with mock fallback for development)
 * @param file - File to upload (image, video, etc.)
 * @returns IPFS URL or mock:// URL
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  if (!hasPinataCredentials()) {
    console.warn('⚠️ No Pinata credentials, using mock storage');
    return uploadFileMock(file);
  }

  try {
    return await uploadFileToPinata(file, {
      name: `Post Media: ${file.name}`,
      keyvalues: { type: 'post-media', platform: 'social-fi' },
    });
  } catch (error) {
    console.error('❌ Failed to upload to Pinata, using mock:', error);
    return uploadFileMock(file);
  }
}

/**
 * Mock file upload for development (stores as base64 in localStorage)
 */
async function uploadFileMock(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(mockId, base64);
      
      // Return a mock URL that can be resolved later
      const mockUrl = `mock://${mockId}`;
      console.log('📦 File stored in mock storage:', mockUrl);
      resolve(mockUrl);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload post metadata to IPFS (with mock fallback for development)
 * @param metadata - Post metadata object
 * @returns IPFS URL or ipfs://post/... mock URI
 */
export async function uploadMetadataToIPFS(metadata: PostMetadata): Promise<string> {
  const metadataWithTimestamp = {
    ...metadata,
    timestamp: Date.now(),
  };

  if (!hasPinataCredentials()) {
    console.warn('⚠️ No Pinata credentials, using mock storage');
    return uploadMetadataMock(metadataWithTimestamp);
  }

  try {
    return await uploadJSONToPinata(metadataWithTimestamp, {
      name: `Post Metadata: ${Date.now()}`,
      keyvalues: { type: 'post-metadata', platform: 'social-fi' },
    });
  } catch (error) {
    console.error('❌ Failed to upload metadata to Pinata, using mock:', error);
    return uploadMetadataMock(metadataWithTimestamp);
  }
}

/**
 * Mock metadata upload for development
 */
function uploadMetadataMock(metadata: PostMetadata): string {
  const uri = `ipfs://post/${Date.now()}`;
  localStorage.setItem(`post_metadata_${uri}`, JSON.stringify(metadata));
  console.log('📦 Metadata stored in localStorage:', uri);
  return uri;
}

/**
 * Resolve mock:// URLs to actual data
 */
export function resolveMockUrl(url: string): string | null {
  if (!url.startsWith('mock://')) return null;
  
  const mockId = url.replace('mock://', '');
  return localStorage.getItem(mockId);
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, type: 'image' | 'video'): { valid: boolean; error?: string } {
  const maxSizes = {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
  };

  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
  };

  if (file.size > maxSizes[type]) {
    return { 
      valid: false, 
      error: `File too large. Max size: ${maxSizes[type] / 1024 / 1024}MB` 
    };
  }

  if (!allowedTypes[type].includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${allowedTypes[type].join(', ')}` 
    };
  }

  return { valid: true };
}
