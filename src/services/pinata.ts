/**
 * Pinata IPFS Upload Service
 * Shared service for uploading files and JSON to IPFS via Pinata
 */

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';

export interface PinataMetadata {
  name: string;
  keyvalues?: Record<string, string | number>;
}

/**
 * Upload file to Pinata IPFS
 * @param file - File to upload (or Blob)
 * @param metadata - Optional metadata for Pinata dashboard
 * @returns IPFS gateway URL
 */
export async function uploadFileToPinata(
  file: File | Blob,
  metadata?: PinataMetadata
): Promise<string> {
  if (!PINATA_JWT || PINATA_JWT === 'YOUR_PINATA_JWT_HERE') {
    throw new Error(
      'VITE_PINATA_JWT not configured. Get free API key at https://pinata.cloud\n' +
      '1. Sign up at pinata.cloud\n' +
      '2. Go to API Keys → New Key\n' +
      '3. Copy JWT and add to .env as VITE_PINATA_JWT=your_jwt_here'
    );
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify(metadata));
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const ipfsHash = result.IpfsHash;

    if (!ipfsHash) {
      throw new Error('No IPFS hash returned from Pinata');
    }

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    console.log('✅ File uploaded to Pinata:', ipfsUrl);
    
    return ipfsUrl;
  } catch (error) {
    console.error('❌ Pinata upload failed:', error);
    throw error;
  }
}

/**
 * Upload JSON to Pinata IPFS
 * @param data - JSON object to upload
 * @param metadata - Optional metadata for Pinata dashboard
 * @returns IPFS gateway URL
 */
export async function uploadJSONToPinata(
  data: unknown,
  metadata?: PinataMetadata
): Promise<string> {
  if (!PINATA_JWT || PINATA_JWT === 'YOUR_PINATA_JWT_HERE') {
    throw new Error(
      'VITE_PINATA_JWT not configured. Get free API key at https://pinata.cloud'
    );
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: metadata,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata JSON upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const ipfsHash = result.IpfsHash;

    if (!ipfsHash) {
      throw new Error('No IPFS hash returned from Pinata');
    }

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    console.log('✅ JSON uploaded to Pinata:', ipfsUrl);
    
    return ipfsUrl;
  } catch (error) {
    console.error('❌ Pinata JSON upload failed:', error);
    throw error;
  }
}

/**
 * Check if Pinata credentials are configured
 */
export function hasPinataCredentials(): boolean {
  return !!PINATA_JWT && PINATA_JWT !== 'YOUR_PINATA_JWT_HERE';
}
