import { Router, Request, Response } from 'express'
import { getDatabase, saveDatabase, Database } from '../config/database'

const router = Router()

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
  allergens: string[]
  status: string
  created_at: string
  updated_at: string
}

function mapMenuItem(row: any[] | Record<string, any>, columns: string[]): MenuItem {
  if (Array.isArray(row)) {
    return {
      id: Number(row[columns.indexOf('id')]),
      name: String(row[columns.indexOf('name')]),
      description: String(row[columns.indexOf('description')]),
      price: Number(row[columns.indexOf('price')]),
      category: String(row[columns.indexOf('category')]),
      image: String(row[columns.indexOf('image')]),
      stock: Number(row[columns.indexOf('stock')]),
      allergens: JSON.parse(String(row[columns.indexOf('allergens')]) || '[]'),
      status: String(row[columns.indexOf('status')]),
      created_at: String(row[columns.indexOf('created_at')]),
      updated_at: String(row[columns.indexOf('updated_at')])
    }
  }
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description),
    price: Number(row.price),
    category: String(row.category),
    image: String(row.image),
    stock: Number(row.stock),
    allergens: JSON.parse(String(row.allergens) || '[]'),
    status: String(row.status),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  }
}

function queryAll(db: Database, sql: string, params: any[] = []): MenuItem[] {
  const result: MenuItem[] = []
  const stmt = db.prepare(sql)
  
  if (params.length > 0) {
    stmt.bind(params)
  }
  
  let columns: string[] = []
  while (stmt.step()) {
    if (columns.length === 0) {
      columns = stmt.getColumnNames()
    }
    const row = stmt.getAsObject()
    result.push(mapMenuItem(row, columns))
  }
  stmt.free()
  
  return result
}

function queryOne(db: Database, sql: string, params: any[] = []): MenuItem | null {
  const stmt = db.prepare(sql)
  
  if (params.length > 0) {
    stmt.bind(params)
  }
  
  if (stmt.step()) {
    const row = stmt.getAsObject()
    const columns = stmt.getColumnNames()
    stmt.free()
    return mapMenuItem(row, columns)
  }
  
  stmt.free()
  return null
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase()
    const category = req.query.category as string

    let menuItems: MenuItem[]
    
    if (category) {
      menuItems = queryAll(db, 'SELECT * FROM menu_items WHERE category = ? ORDER BY created_at DESC', [category])
    } else {
      menuItems = queryAll(db, 'SELECT * FROM menu_items ORDER BY created_at DESC')
    }

    res.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    res.status(500).json({ error: 'Failed to fetch menu items' })
  }
})

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase()
    const result = db.exec('SELECT DISTINCT category FROM menu_items ORDER BY category')
    
    const categories: string[] = []
    if (result.length > 0) {
      for (const row of result[0].values) {
        categories.push(String(row[0]))
      }
    }
    
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string
    if (!q || q.trim() === '') {
      return res.json([])
    }

    const db = await getDatabase()
    const searchPattern = `%${q.trim().toLowerCase()}%`
    
    const menuItems = queryAll(db, `
      SELECT * FROM menu_items 
      WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?
      ORDER BY created_at DESC
    `, [searchPattern, searchPattern])

    res.json(menuItems)
  } catch (error) {
    console.error('Error searching menu items:', error)
    res.status(500).json({ error: 'Failed to search menu items' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid menu item ID' })
    }

    const db = await getDatabase()
    const menuItem = queryOne(db, 'SELECT * FROM menu_items WHERE id = ?', [id])

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' })
    }

    res.json(menuItem)
  } catch (error) {
    console.error('Error fetching menu item:', error)
    res.status(500).json({ error: 'Failed to fetch menu item' })
  }
})

export default router
