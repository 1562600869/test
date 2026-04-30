<template>
  <div class="cart-sidebar" :class="{ 'is-open': isOpen }">
    <div class="cart-header">
      <h3 class="cart-title">购物车</h3>
      <span class="cart-count" v-if="itemCount > 0">({{ itemCount }} 件)</span>
      <button class="cart-close" @click="handleClose">×</button>
    </div>

    <div class="cart-body" v-if="items.length > 0">
      <div class="cart-items">
        <div v-for="item in items" :key="item.id" class="cart-item">
          <div class="cart-item-info">
            <h4 class="cart-item-name">{{ item.menuItem.name }}</h4>
            <span class="cart-item-price">¥{{ item.menuItem.price.toFixed(2) }}</span>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-control">
              <button 
                class="quantity-btn" 
                @click="updateQuantity(item.id, item.quantity - 1)"
              >−</button>
              <span class="quantity-value">{{ item.quantity }}</span>
              <button 
                class="quantity-btn" 
                @click="updateQuantity(item.id, item.quantity + 1)"
                :disabled="item.quantity >= item.menuItem.stock"
              >+</button>
            </div>
            <button class="btn-remove" @click="removeItem(item.id)">删除</button>
          </div>
          <div class="cart-item-subtotal">
            小计: ¥{{ (item.menuItem.price * item.quantity).toFixed(2) }}
          </div>
        </div>
      </div>

      <button class="btn-clear" @click="clearCart">清空购物车</button>
    </div>

    <div class="cart-empty" v-else>
      <div class="empty-icon">🛒</div>
      <p class="empty-text">购物车是空的</p>
      <p class="empty-hint">快去添加美味的菜品吧！</p>
    </div>

    <div class="cart-footer" v-if="items.length > 0">
      <div class="cart-summary">
        <div class="summary-row">
          <span class="summary-label">小计</span>
          <span class="summary-value">¥{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">税费 (10%)</span>
          <span class="summary-value">¥{{ taxAmount.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span class="summary-label">合计</span>
          <span class="summary-value">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>
      <button class="btn btn-primary btn-checkout" @click="handleCheckout">
        去结账
      </button>
    </div>
  </div>

  <div v-if="isOpen" class="cart-overlay" @click="handleClose"></div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/store/cart'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { orderApi } from '@/api'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const cartStore = useCartStore()
const { items, subtotal, taxAmount, totalAmount, itemCount } = storeToRefs(cartStore)

function handleClose(): void {
  emit('close')
}

function updateQuantity(itemId: number, quantity: number): void {
  cartStore.updateQuantity(itemId, quantity)
}

function removeItem(itemId: number): void {
  cartStore.removeItem(itemId)
}

function clearCart(): void {
  cartStore.clearCart()
}

async function handleCheckout(): void {
  const orderItems = items.value.map(item => ({
    menuItemId: item.menuItem.id,
    quantity: item.quantity
  }))

  const result = await orderApi.create(orderItems)
  
  if (result.success && result.data) {
    cartStore.clearCart()
    emit('close')
    router.push(`/order-confirm/${result.data.id}`)
  } else {
    alert(result.error || '下单失败，请重试')
  }
}
</script>

<style scoped>
.cart-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
  z-index: 1001;
}

.cart-sidebar.is-open {
  right: 0;
}

.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.cart-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cart-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.cart-count {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

.cart-close {
  margin-left: auto;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cart-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 1rem;
}

.cart-item-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}

.cart-item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.cart-item-price {
  font-size: 1rem;
  font-weight: 600;
  color: #e53e3e;
}

.cart-item-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 0.375rem;
  padding: 0.125rem;
  border: 1px solid #e2e8f0;
}

.quantity-btn {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.25rem;
  background: transparent;
  color: #4a5568;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
}

.quantity-btn:hover:not(:disabled) {
  background: #edf2f7;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-value {
  width: 2.5rem;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
}

.btn-remove {
  background: transparent;
  color: #e53e3e;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

.btn-remove:hover {
  background: #fed7d7;
  border-radius: 0.25rem;
}

.cart-item-subtotal {
  font-size: 0.875rem;
  color: #718096;
  text-align: right;
}

.btn-clear {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: transparent;
  color: #e53e3e;
  font-size: 0.875rem;
  border: 1px solid #fc8181;
  border-radius: 0.5rem;
}

.btn-clear:hover {
  background: #fff5f5;
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #a0aec0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
}

.cart-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.cart-summary {
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.summary-label {
  color: #718096;
}

.summary-value {
  color: #2d3748;
  font-weight: 500;
}

.summary-row.total {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  font-size: 1.1rem;
}

.summary-row.total .summary-label,
.summary-row.total .summary-value {
  font-weight: 700;
  color: #e53e3e;
}

.btn-checkout {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
