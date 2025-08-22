import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'

export const settings = sqliteTable('t_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const errorLogs = sqliteTable('t_error_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  geminiKey: text('gemini_key'),
  modelName: text('model_name'),
  errorType: text('error_type'),
  errorLog: text('error_log'),
  errorCode: integer('error_code'),
  requestMsg: text('request_msg', { mode: 'json' }),
  requestTime: integer('request_time', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export const requestLogs = sqliteTable('t_request_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestTime: integer('request_time', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  modelName: text('model_name'),
  apiKey: text('api_key'),
  isSuccess: integer('is_success', { mode: 'boolean' }).notNull(),
  statusCode: integer('status_code'),
  latencyMs: integer('latency_ms'),
})

export const fileRecords = sqliteTable('t_file_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  displayName: text('display_name'),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  sha256Hash: text('sha256_hash'),
  state: text('state').notNull().default('PROCESSING'),
  createTime: integer('create_time', { mode: 'timestamp' }).notNull(),
  updateTime: integer('update_time', { mode: 'timestamp' }).notNull(),
  expirationTime: integer('expiration_time', { mode: 'timestamp' }).notNull(),
  uri: text('uri').notNull(),
  apiKey: text('api_key').notNull(),
  uploadUrl: text('upload_url'),
  userToken: text('user_token'),
  uploadCompleted: integer('upload_completed', { mode: 'timestamp' }),
})

export const users = sqliteTable('t_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
})

export type Settings = typeof settings.$inferSelect
export type NewSettings = typeof settings.$inferInsert
export type ErrorLog = typeof errorLogs.$inferSelect
export type NewErrorLog = typeof errorLogs.$inferInsert
export type RequestLog = typeof requestLogs.$inferSelect
export type NewRequestLog = typeof requestLogs.$inferInsert
export type FileRecord = typeof fileRecords.$inferSelect
export type NewFileRecord = typeof fileRecords.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert