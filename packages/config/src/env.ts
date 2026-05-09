import { z } from "zod";

export type EnvMap = Record<string, string | undefined>;

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url().default("http://localhost:3000"),
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional()
});

function getDefaultEnv(): EnvMap {
  const host = globalThis as { process?: { env?: EnvMap } };
  return host.process?.env ?? {};
}

export function readEnv(source: EnvMap = getDefaultEnv()) {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid SERRALE mobile env: ${message}`);
  }

  return parsed.data;
}

export function getApiBaseUrl(source?: EnvMap): string {
  return readEnv(source).EXPO_PUBLIC_API_URL;
}

export function getSupabaseConfig(source?: EnvMap) {
  const env = readEnv(source);

  if (!env.EXPO_PUBLIC_SUPABASE_URL || !env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  return {
    url: env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  };
}
