/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (public) key. Access is enforced by row-level security. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Origin of the GitAlong FastAPI backend, without /api/v1. */
  readonly VITE_BACKEND_URL?: string;
  /** Public URL of this site (used for absolute links). */
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
