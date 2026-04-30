import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CartItem, MenuItem, CartState } from '@/types'

const TAX_RATE = 0.1

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => total + item.menuItem.price * item.quantity, 0)
  })

  const taxAmount = computed(() => {
    return Math.round(subtotal.value * TAX_RATE * 100) / 100
  })

  const totalAmount = computed(() => {
    return Math.round((subtotal.value + taxAmount.value) * 100) / 100
  })

  const itemCount = computed(() => {
    return items.value.reduce((count, item) => count + item.quantity, 0)
  })

  function addItem(menuItem: MenuItem, quantity: number = 1): void {
    const existingItem = items.value.find(item => item.menuItem.id === menuItem.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        id: Date.now(),
        menuItem,
        quantity
      })
    }
  }

  function updateQuantity(cartItemId: number, quantity: number): void {
    const item = items.value.find(item => item.id === cartItemId)
    
    if (item) {
      if (quantity <= 0) {
        removeItem(cartItemId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function removeItem(cartItemId: number): void {
    const index = items.value.findIndex(item => item.id === cartItemId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  function clearCart(): void {
    items.value = []
  }

  function getCartState(): CartState {
    return {
      items: items.value,
      subtotal: subtotal.value,
      taxAmount: taxAmount.value,
      totalAmount: totalAmount.value
    }
  }

  return {
    items,
    subtotal,
    taxAmount,
    totalAmount,
    itemCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getCartState
  }
})
