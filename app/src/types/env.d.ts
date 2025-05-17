declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    GITHUB_ACCESS_TOKEN: string;
    NEXT_PUBLIC_MODULE_ADDRESS: string;
    MOVEMENT_RPC_URL: string;
    MOVEMENT_PRIVATE_KEY: string;
  }
} 