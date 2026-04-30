import type { MenuItem, Order, ApiResponse } from '@/types'

const API_BASE = '/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.error || '请求失败' }
    }
    
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '网络错误' }
  }
}

export const menuApi = {
  async getAll(): Promise<ApiResponse<MenuItem[]>> {
    return request<MenuItem[]>('/menu')
  },

  async getById(id: number): Promise<ApiResponse<MenuItem>> {
    return request<MenuItem>(`/menu/${id}`)
  },

  async getByCategory(category: string): Promise<ApiResponse<MenuItem[]>> {
    return request<MenuItem[]>(`/menu?category=${encodeURIComponent(category)}`)
  },

  async search(keyword: string): Promise<ApiResponse<MenuItem[]>> {
    return request<MenuItem[]>(`/menu/search?q=${encodeURIComponent(keyword)}`)
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    return request<string[]>('/menu/categories')
  }
}

export const orderApi = {
  async create(items: { menuItemId: number; quantity: number }[]): Promise<ApiResponse<Order>> {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ items })
    })
  },

  async getAll(): Promise<ApiResponse<Order[]>> {
    return request<Order[]>('/orders')
  },

  async getById(id: number): Promise<ApiResponse<Order>> {
    return request<Order>(`/orders/${id}`)
  },

  async updateStatus(id: number, status: Order['status']): Promise<ApiResponse<Order>> {
    return request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }
}
