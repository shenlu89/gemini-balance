import { z } from 'zod'

const configSchema = z.object({
  // Database
  TURSO_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
  
  // JWT
  JWT_SECRET: z.string(),
  
  // Admin
  ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  ADMIN_PASSWORD: z.string().default('admin123'),
  
  // API Keys
  API_KEYS: z.array(z.string()).default([]),
  ALLOWED_TOKENS: z.array(z.string()).default([]),
  AUTH_TOKEN: z.string().default('sk-123456'),
  
  // Gemini API
  BASE_URL: z.string().default('https://generativelanguage.googleapis.com/v1beta'),
  TEST_MODEL: z.string().default('gemini-1.5-flash'),
  MAX_FAILURES: z.number().default(10),
  MAX_RETRIES: z.number().default(3),
  CHECK_INTERVAL_HOURS: z.number().default(1),
  TIMEOUT: z.number().default(300),
  
  // Models
  THINKING_MODELS: z.array(z.string()).default([]),
  THINKING_BUDGET_MAP: z.record(z.number()).default({}),
  IMAGE_MODELS: z.array(z.string()).default(['gemini-2.0-flash-exp']),
  SEARCH_MODELS: z.array(z.string()).default(['gemini-2.0-flash-exp']),
  FILTERED_MODELS: z.array(z.string()).default([]),
  
  // Features
  URL_CONTEXT_ENABLED: z.boolean().default(false),
  TOOLS_CODE_EXECUTION_ENABLED: z.boolean().default(false),
  SHOW_SEARCH_LINK: z.boolean().default(true),
  SHOW_THINKING_PROCESS: z.boolean().default(true),
  
  // Proxy
  PROXIES: z.array(z.string()).default([]),
  PROXIES_USE_CONSISTENCY_HASH_BY_API_KEY: z.boolean().default(true),
  
  // Image Generation
  PAID_KEY: z.string().default(''),
  CREATE_IMAGE_MODEL: z.string().default('imagen-3.0-generate-002'),
  UPLOAD_PROVIDER: z.string().default('smms'),
  SMMS_SECRET_TOKEN: z.string().default(''),
  
  // Stream Optimizer
  STREAM_OPTIMIZER_ENABLED: z.boolean().default(false),
  STREAM_MIN_DELAY: z.number().default(0.016),
  STREAM_MAX_DELAY: z.number().default(0.024),
  STREAM_SHORT_TEXT_THRESHOLD: z.number().default(10),
  STREAM_LONG_TEXT_THRESHOLD: z.number().default(50),
  STREAM_CHUNK_SIZE: z.number().default(5),
  
  // Logging
  LOG_LEVEL: z.string().default('info'),
  AUTO_DELETE_ERROR_LOGS_ENABLED: z.boolean().default(true),
  AUTO_DELETE_ERROR_LOGS_DAYS: z.number().default(7),
  AUTO_DELETE_REQUEST_LOGS_ENABLED: z.boolean().default(false),
  AUTO_DELETE_REQUEST_LOGS_DAYS: z.number().default(30),
  
  // Safety
  SAFETY_SETTINGS: z.array(z.object({
    category: z.string(),
    threshold: z.string(),
  })).default([]),
  
  // TTS
  TTS_MODEL: z.string().default('gemini-2.5-flash-preview-tts'),
  TTS_VOICE_NAME: z.string().default('Zephyr'),
  TTS_SPEED: z.string().default('normal'),
  
  // Files
  FILES_CLEANUP_ENABLED: z.boolean().default(true),
  FILES_CLEANUP_INTERVAL_HOURS: z.number().default(1),
  FILES_USER_ISOLATION_ENABLED: z.boolean().default(true),
})

function parseEnvValue(value: string | undefined): any {
  if (!value) return undefined
  
  // Try to parse as JSON first
  try {
    return JSON.parse(value)
  } catch {
    // If not JSON, return as string
    return value
  }
}

function getEnvConfig() {
  const env = process.env
  
  return {
    TURSO_DATABASE_URL: env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN,
    JWT_SECRET: env.JWT_SECRET,
    ADMIN_EMAIL: env.ADMIN_EMAIL,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD,
    API_KEYS: parseEnvValue(env.API_KEYS),
    ALLOWED_TOKENS: parseEnvValue(env.ALLOWED_TOKENS),
    AUTH_TOKEN: env.AUTH_TOKEN,
    BASE_URL: env.BASE_URL,
    TEST_MODEL: env.TEST_MODEL,
    MAX_FAILURES: env.MAX_FAILURES ? parseInt(env.MAX_FAILURES) : undefined,
    MAX_RETRIES: env.MAX_RETRIES ? parseInt(env.MAX_RETRIES) : undefined,
    CHECK_INTERVAL_HOURS: env.CHECK_INTERVAL_HOURS ? parseInt(env.CHECK_INTERVAL_HOURS) : undefined,
    TIMEOUT: env.TIMEOUT ? parseInt(env.TIMEOUT) : undefined,
    THINKING_MODELS: parseEnvValue(env.THINKING_MODELS),
    THINKING_BUDGET_MAP: parseEnvValue(env.THINKING_BUDGET_MAP),
    IMAGE_MODELS: parseEnvValue(env.IMAGE_MODELS),
    SEARCH_MODELS: parseEnvValue(env.SEARCH_MODELS),
    FILTERED_MODELS: parseEnvValue(env.FILTERED_MODELS),
    URL_CONTEXT_ENABLED: env.URL_CONTEXT_ENABLED === 'true',
    TOOLS_CODE_EXECUTION_ENABLED: env.TOOLS_CODE_EXECUTION_ENABLED === 'true',
    SHOW_SEARCH_LINK: env.SHOW_SEARCH_LINK !== 'false',
    SHOW_THINKING_PROCESS: env.SHOW_THINKING_PROCESS !== 'false',
    PROXIES: parseEnvValue(env.PROXIES),
    PROXIES_USE_CONSISTENCY_HASH_BY_API_KEY: env.PROXIES_USE_CONSISTENCY_HASH_BY_API_KEY !== 'false',
    PAID_KEY: env.PAID_KEY,
    CREATE_IMAGE_MODEL: env.CREATE_IMAGE_MODEL,
    UPLOAD_PROVIDER: env.UPLOAD_PROVIDER,
    SMMS_SECRET_TOKEN: env.SMMS_SECRET_TOKEN,
    STREAM_OPTIMIZER_ENABLED: env.STREAM_OPTIMIZER_ENABLED === 'true',
    STREAM_MIN_DELAY: env.STREAM_MIN_DELAY ? parseFloat(env.STREAM_MIN_DELAY) : undefined,
    STREAM_MAX_DELAY: env.STREAM_MAX_DELAY ? parseFloat(env.STREAM_MAX_DELAY) : undefined,
    STREAM_SHORT_TEXT_THRESHOLD: env.STREAM_SHORT_TEXT_THRESHOLD ? parseInt(env.STREAM_SHORT_TEXT_THRESHOLD) : undefined,
    STREAM_LONG_TEXT_THRESHOLD: env.STREAM_LONG_TEXT_THRESHOLD ? parseInt(env.STREAM_LONG_TEXT_THRESHOLD) : undefined,
    STREAM_CHUNK_SIZE: env.STREAM_CHUNK_SIZE ? parseInt(env.STREAM_CHUNK_SIZE) : undefined,
    LOG_LEVEL: env.LOG_LEVEL,
    AUTO_DELETE_ERROR_LOGS_ENABLED: env.AUTO_DELETE_ERROR_LOGS_ENABLED !== 'false',
    AUTO_DELETE_ERROR_LOGS_DAYS: env.AUTO_DELETE_ERROR_LOGS_DAYS ? parseInt(env.AUTO_DELETE_ERROR_LOGS_DAYS) : undefined,
    AUTO_DELETE_REQUEST_LOGS_ENABLED: env.AUTO_DELETE_REQUEST_LOGS_ENABLED === 'true',
    AUTO_DELETE_REQUEST_LOGS_DAYS: env.AUTO_DELETE_REQUEST_LOGS_DAYS ? parseInt(env.AUTO_DELETE_REQUEST_LOGS_DAYS) : undefined,
    SAFETY_SETTINGS: parseEnvValue(env.SAFETY_SETTINGS),
    TTS_MODEL: env.TTS_MODEL,
    TTS_VOICE_NAME: env.TTS_VOICE_NAME,
    TTS_SPEED: env.TTS_SPEED,
    FILES_CLEANUP_ENABLED: env.FILES_CLEANUP_ENABLED !== 'false',
    FILES_CLEANUP_INTERVAL_HOURS: env.FILES_CLEANUP_INTERVAL_HOURS ? parseInt(env.FILES_CLEANUP_INTERVAL_HOURS) : undefined,
    FILES_USER_ISOLATION_ENABLED: env.FILES_USER_ISOLATION_ENABLED !== 'false',
  }
}

export const config = configSchema.parse(getEnvConfig())

export type Config = z.infer<typeof configSchema>