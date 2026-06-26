/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_SOLANA_NETWORK: string;
  readonly VITE_SOLANA_RPC_URL: string;
  readonly VITE_PROGRAM_ID: string;
  readonly VITE_PINATA_JWT: string;
  readonly VITE_COLLECTION_MINT: string;
  readonly VITE_COLLECTION_AUTHORITY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
