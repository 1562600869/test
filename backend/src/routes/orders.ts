import { Router, Request, Response } from 'express'
import { getDatabase, saveDatabase, Database } from '../config/database'

const router = Router()
const TAX_RATE = 0.1

interface OrderItem {
  id: number
  order_id: number
  menu_item_id: number
  menu_item_name: string
  quantity: number
  price: number
  subtotal: number
  created_at: string
}

interface Order {
  id: number
  order_number: string
  status: string
  subtotal: number
  tax_amount: number
  total_amount: number
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD${year}${month}${day}${random}`
}

function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

function mapOrderItem(row: Record<string, any>): OrderItem {
  return {
    id: Number(row.id),
    order_id: Number(row.order_id),
    menu_item_id: Number(row.menu_item_id),
    menu_item_name: String(row.menu_item_name),
    quantity: Number(row.quantity),
    price: Number(row.price),
    subtotal: Number(row.subtotal),
    created_at: String(row.created_at)
  }
}

function mapOrder(row: Record<string, any>, items?: OrderItem[]): Order {
  return {
    id: Number(row.id),
    order_number: String(row.order_number),
    status: String(row.status),
    subtotal: Number(row.subtotal),
    tax_amount: Number(row.tax_amount),
    total_amount: Number(row.total_amount),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    items: items
  }
}

function queryOneOrder(db: Database, sql: string, params: any[] = []): Record<string, any> | null {
  const stmt = db.prepare(sql)
  
  if (params.length > 0) {
    stmt.bind(params)
  }
  
  if (stmt.step()) {
    const row = stmt.getAsObject()
    stmt.free()
    return row
  }
  
  stmt.free()
  return null
}

function queryAllOrders(db: Database, sql: string, params: any[] = []): Record<string, any>[] {
  const result: Record<string, any>[] = []
  const stmt = db.prepare(sql)
  
  if (params.length > 0) {
    stmt.bind(params)
  }
  
  while (stmt.step()) {
    const row = stmt.getAsObject()
    result.push(row)
  }
  stmt.free()
  
  return result
}

function queryOrderItems(db: Database, orderId: number): OrderItem[] {
  const items: OrderItem[] = []
  const stmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?')
  stmt.bind([orderId])
  
  while (stmt.step()) {
    const row = stmt.getAsObject()
    items.push(mapOrderItem(row))
  }
  stmt.free()
  
  return items
}

function runSql(db: Database, sql: string, params: any[] = []): void {
  const stmt = db.prepare(sql)
  if (params.length > 0) {
    stmt.bind(params)
  }
  stmt.step()
  stmt.free()
}

function getLastInsertId(db: Database): number {
  const result = db.exec('SELECT last_insert_rowid() as id')
  if (result.length > 0 && result[0].values.length > 0) {
    return Number(result[0].values[0][0])
  }
  return 0
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase()
    const orders = queryAllOrders(db, 'SELECT * FROM orders ORDER BY created_at DESC')

    const result = orders.map(order => {
      const items = queryOrderItems(db, Number(order.id))
      return mapOrder(order, items)
    })

    res.json(result)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order ID' })
    }

    const db = await getDatabase()
    const order = queryOneOrder(db, 'SELECT * FROM orders WHERE id = ?', [id])

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const items = queryOrderItems(db, id)
    const result = mapOrder(order, items)

    res.json(result)
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { items } = req.body as { items: { menuItemId: number; quantity: number }[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' })
    }

    const db = await getDatabase()

    let subtotal = 0
    const orderItems: { menuItemId: number; quantity: number; price: number; name: string; stock: number; status: string }[] = []

    for (const item of items) {
      const menuItem = queryOneOrder(db, 'SELECT * FROM menu_items WHERE id = ?', [item.menuItemId])
      
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` })
      }
      
      const stock = Number(menuItem.stock)
      const status = String(menuItem.status)
      
      if (stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${menuItem.name}` })
      }
      if (status === 'sold_out') {
        return res.status(400).json({ error: `${menuItem.name} is sold out` })
      }

      const itemSubtotal = Number(menuItem.price) * item.quantity
      subtotal += itemSubtotal
      orderItems.push({
        menuItemId: Number(menuItem.id),
        quantity: item.quantity,
        price: Number(menuItem.price),
        name: String(menuItem.name),
        stock: stock,
        status: status
      })
    }

    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100
    const orderNumber = generateOrderNumber()
    const now = getCurrentTimestamp()

    runSql(db, `
      INSERT INTO orders (order_number, status, subtotal, tax_amount, total_amount, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [orderNumber, 'pending', subtotal, taxAmount, totalAmount, now, now])

    const orderId = getLastInsertId(db)

    for (const item of orderItems) {
      const itemSubtotal = item.price * item.quantity
      runSql(db, `
        INSERT INTO order_items (order_id, menu_item_id, menu_item_name, quantity, price, subtotal, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [orderId, item.menuItemId, item.name, item.quantity, item.price, itemSubtotal, now])

      const newStock = item.stock - item.quantity
      let newStatus = item.status
      if (newStock === 0) {
        newStatus = 'sold_out'
      } else if (newStock <= 5) {
        newStatus = 'low_stock'
      }

      runSql(db, `
        UPDATE menu_items 
        SET stock = ?, status = ?, updated_at = ?
        WHERE id = ?
      `, [newStock, newStatus, now, item.menuItemId])
    }

    const order = queryOneOrder(db, 'SELECT * FROM orders WHERE id = ?', [orderId])
    const orderItemsResult = queryOrderItems(db, orderId)
    const result = mapOrder(order!, orderItemsResult)

    saveDatabase(db)
    res.status(201).json(result)
  } catch (error: any) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order ID' })
    }

    const { status } = req.body as { status: string }
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled']

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' })
    }

    const db = await getDatabase()
    const existingOrder = queryOneOrder(db, 'SELECT * FROM orders WHERE id = ?', [id])

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const now = getCurrentTimestamp()
    runSql(db, 'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, now, id])

    const order = queryOneOrder(db, 'SELECT * FROM orders WHERE id = ?', [id])
    const items = queryOrderItems(db, id)
    const result = mapOrder(order!, items)

    saveDatabase(db)
    res.json(result)
  } catch (error) {
    console.error('Error updating order:', error)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

export default router
