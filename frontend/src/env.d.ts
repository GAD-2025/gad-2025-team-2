/// <reference types="vite/client" />

// Provide a minimal ImportMetaEnv typing in case the project doesn't include it.
// This keeps TS happy for usages like import.meta.env.VITE_API_BASE_URL
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // add other VITE_... vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
