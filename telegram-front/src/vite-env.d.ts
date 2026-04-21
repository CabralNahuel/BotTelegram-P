/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DESARROLLO: string;
  readonly VITE_PRODUCCION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
