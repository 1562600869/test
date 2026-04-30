import { Router, Request, Response } from 'express'
import { getDatabase, Database } from '../config/database'

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

function mapOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    order_id: row.order_id,
    menu_item_id: row.menu_item_id,
    menu_item_name: row.menu_item_name,
    quantity: row.quantity,
    price: row.price,
    subtotal: row.subtotal,
    created_at: row.created_at
  }
}

function mapOrder(row: any, items?: OrderItem[]): Order {
  return {
    id: row.id,
    order_number: row.order_number,
    status: row.status,
    subtotal: row.subtotal,
    tax_amount: row.tax_amount,
    total_amount: row.total_amount,
    created_at: row.created_at,
    updated_at: row.updated_at,
    items: items
  }
}

router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase()
    const orderStmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC')
    const orders = orderStmt.all() as any[]
    const itemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?')

    const result = orders.map(order => {
      const items = itemStmt.all(order.id).map(mapOrderItem)
      return mapOrder(order, items)
    })

    db.close()
    res.json(result)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid order ID' })
    }

    const db = getDatabase()
    const orderStmt = db.prepare('SELECT * FROM orders WHERE id = ?')
    const order = orderStmt.get(id) as any

    if (!order) {
      db.close()
      return res.status(404).json({ error: 'Order not found' })
    }

    const itemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?')
    const items = itemStmt.all(id).map(mapOrderItem)

    const result = mapOrder(order, items)
    db.close()
    res.json(result)
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

router.post('/', (req: Request, res: Response) => {
  try {
    const { items } = req.body as { items: { menuItemId: number; quantity: number }[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' })
    }

    const db = getDatabase()

    const createOrder = db.transaction(() => {
      let subtotal = 0
      const menuItemStmt = db.prepare('SELECT * FROM menu_items WHERE id = ?')
      const orderItems: { menuItemId: number; quantity: number; price: number; name: string }[] = []

      for (const item of items) {
        const menuItem = menuItemStmt.get(item.menuItemId) as any
        if (!menuItem) {
          throw new Error(`Menu item ${item.menuItemId} not found`)
        }
        if (menuItem.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${menuItem.name}`)
        }
        if (menuItem.status === 'sold_out') {
          throw new Error(`${menuItem.name} is sold out`)
        }

        const itemSubtotal = menuItem.price * item.quantity
        subtotal += itemSubtotal
        orderItems.push({
          menuItemId: menuItem.id,
          quantity: item.quantity,
          price: menuItem.price,
          name: menuItem.name
        })
      }

      const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100
      const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100
      const orderNumber = generateOrderNumber()

      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (order_number, status, subtotal, tax_amount, total_amount)
        VALUES (?, ?, ?, ?, ?)
      `)
      const orderResult = insertOrderStmt.run(orderNumber, 'pending', subtotal, taxAmount, totalAmount)
      const orderId = orderResult.lastInsertRowid as number

      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, menu_item_id, menu_item_name, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      const updateStockStmt = db.prepare(`
        UPDATE menu_items 
        SET stock = stock - ?, 
            status = CASE 
              WHEN stock - ? = 0 THEN 'sold_out'
              WHEN stock - ? <= 5 THEN 'low_stock'
              ELSE status
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)

      for (const item of orderItems) {
        const itemSubtotal = item.price * item.quantity
        insertItemStmt.run(orderId, item.menuItemId, item.name, item.quantity, item.price, itemSubtotal)
        updateStockStmt.run(item.quantity, item.quantity, item.quantity, item.menuItemId)
      }

      const selectOrderStmt = db.prepare('SELECT * FROM orders WHERE id = ?')
      const order = selectOrderStmt.get(orderId) as any
      const selectItemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?')
      const orderItemsResult = selectItemsStmt.all(orderId).map(mapOrderItem)

      return mapOrder(order, orderItemsResult)
    })

    const result = createOrder()
    db.close()
    res.status(201).json(result)
  } catch (error: any) {
    console.error('Error creating order:', error)
    if (error.message && (error.message.includes('not found') || error.message.includes('Insufficient') || error.message.includes('sold out'))) {
      return res.status(400).json({ error: error.message })
    }
    res.status(500).json({ error: 'Failed to create order' })
  }
})

router.put('/:id', (req: Request, res: Response) => {
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

    const db = getDatabase()
    const selectStmt = db.prepare('SELECT * FROM orders WHERE id = ?')
    const existingOrder = selectStmt.get(id) as any

    if (!existingOrder) {
      db.close()
      return res.status(404).json({ error: 'Order not found' })
    }

    const updateStmt = db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    updateStmt.run(status, id)

    const order = selectStmt.get(id) as any
    const itemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?')
    const items = itemStmt.all(id).map(mapOrderItem)

    const result = mapOrder(order, items)
    db.close()
    res.json(result)
  } catch (error) {
    console.error('Error updating order:', error)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

export default router
