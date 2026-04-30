import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import menuRoutes from './routes/menu'
import orderRoutes from './routes/orders'
import { getDatabase } from './config/database'

const app = express()
const PORT = process.env.PORT || 3001

const dbDir = join(__dirname, '../../database')
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

app.use(cors())
app.use(express.json())

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

async function startServer(): Promise<void> {
  try {
    await getDatabase()
    console.log('Database initialized')
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 API endpoint: http://localhost:${PORT}/api`)
      console.log(`📋 Menu API: http://localhost:${PORT}/api/menu`)
      console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`)
      console.log(`💡 First run: npm run init-db to insert mock data`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
