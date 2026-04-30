export interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
  allergens: string[]
  status: 'available' | 'low_stock' | 'sold_out'
}

export interface CartItem {
  id: number
  menuItem: MenuItem
  quantity: number
}

export interface Order {
  id: number
  orderNumber: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  totalAmount: number
  taxAmount: number
  subtotal: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  orderId: number
  menuItemId: number
  menuItemName: string
  quantity: number
  price: number
  subtotal: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface CartState {
  items: CartItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
}
