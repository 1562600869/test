import { Router, Request, Response } from 'express'
import { getDatabase } from '../config/database'

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

function mapMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    image: row.image,
    stock: row.stock,
    allergens: JSON.parse(row.allergens),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase()
    const category = req.query.category as string

    let menuItems: any[]
    
    if (category) {
      const stmt = db.prepare('SELECT * FROM menu_items WHERE category = ? ORDER BY created_at DESC')
      menuItems = stmt.all(category)
    } else {
      const stmt = db.prepare('SELECT * FROM menu_items ORDER BY created_at DESC')
      menuItems = stmt.all()
    }

    const result = menuItems.map(mapMenuItem)
    db.close()
    res.json(result)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    res.status(500).json({ error: 'Failed to fetch menu items' })
  }
})

router.get('/categories', (req: Request, res: Response) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT DISTINCT category FROM menu_items ORDER BY category')
    const rows = stmt.all() as { category: string }[]
    const categories = rows.map(row => row.category)
    db.close()
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

router.get('/search', (req: Request, res: Response) => {
  try {
    const q = req.query.q as string
    if (!q || q.trim() === '') {
      return res.json([])
    }

    const db = getDatabase()
    const searchPattern = `%${q.trim().toLowerCase()}%`
    const stmt = db.prepare(`
      SELECT * FROM menu_items 
      WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?
      ORDER BY created_at DESC
    `)
    const menuItems = stmt.all(searchPattern, searchPattern)
    const result = menuItems.map(mapMenuItem)
    db.close()
    res.json(result)
  } catch (error) {
    console.error('Error searching menu items:', error)
    res.status(500).json({ error: 'Failed to search menu items' })
  }
})

router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid menu item ID' })
    }

    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM menu_items WHERE id = ?')
    const row = stmt.get(id) as any

    if (!row) {
      db.close()
      return res.status(404).json({ error: 'Menu item not found' })
    }

    const result = mapMenuItem(row)
    db.close()
    res.json(result)
  } catch (error) {
    console.error('Error fetching menu item:', error)
    res.status(500).json({ error: 'Failed to fetch menu item' })
  }
})

export default router
