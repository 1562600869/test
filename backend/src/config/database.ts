import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

let dbInstance: SqlJsDatabase | null = null
const DB_PATH = join(__dirname, '../../../database/restaurant.db')

function ensureDbDir(): void {
  const dbDir = dirname(DB_PATH)
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }
}

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  const SQL = await initSqlJs()
  ensureDbDir()

  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH)
    dbInstance = new SQL.Database(fileBuffer)
  } else {
    dbInstance = new SQL.Database()
  }

  return dbInstance
}

export function saveDatabase(db: SqlJsDatabase): void {
  ensureDbDir()
  const data = db.export()
  const buffer = Buffer.from(data)
  writeFileSync(DB_PATH, buffer)
}

export { SqlJsDatabase as Database }
