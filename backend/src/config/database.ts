import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { existsSync, mkdirSync } from 'fs'

const DB_PATH = join(__dirname, '../../../database/restaurant.db')

function ensureDbDir(): void {
  const dbDir = dirname(DB_PATH)
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }
}

export function getDatabase(): Database.Database {
  ensureDbDir()
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}

export { Database }
