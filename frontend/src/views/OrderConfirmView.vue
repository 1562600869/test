<template>
  <div class="order-confirm-view">
    <div v-if="loading" class="loading">
      <p>加载订单信息...</p>
    </div>

    <div v-else-if="!order" class="error">
      <div class="error-icon">❌</div>
      <p class="error-text">订单信息加载失败</p>
      <router-link to="/" class="btn btn-primary">
        继续点餐
      </router-link>
    </div>

    <div v-else class="confirm-card">
      <div class="success-icon">✅</div>
      <h2 class="success-title">下单成功！</h2>
      <p class="success-message">您的订单已提交，我们正在为您准备</p>

      <div class="order-summary">
        <div class="summary-header">
          <span class="order-number">订单号: {{ order.orderNumber }}</span>
          <span :class="['order-status', order.status]">
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <div class="summary-items">
          <h3 class="items-title">订单详情</h3>
          <div class="item-list">
            <div v-for="item in order.items" :key="item.id" class="summary-item">
              <div class="item-info">
                <span class="item-name">{{ item.menuItemName }}</span>
                <span class="item-quantity">×{{ item.quantity }}</span>
              </div>
              <span class="item-price">¥{{ item.subtotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="summary-total">
          <div class="total-row">
            <span class="total-label">小计</span>
            <span class="total-value">¥{{ order.subtotal.toFixed(2) }}</span>
          </div>
          <div class="total-row">
            <span class="total-label">税费 (10%)</span>
            <span class="total-value">¥{{ order.taxAmount.toFixed(2) }}</span>
          </div>
          <div class="total-row grand-total">
            <span class="total-label">总计</span>
            <span class="total-value">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <router-link to="/orders" class="btn btn-secondary">
          查看订单列表
        </router-link>
        <router-link to="/" class="btn btn-primary">
          继续点餐
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { orderApi } from '@/api'
import type { Order } from '@/types'

const order = ref<Order | null>(null)
const loading = ref(true)

const route = useRoute()
const orderId = Number(route.params.id)

function getStatusText(status: Order['status']): string {
  const statusMap: Record<Order['status'], string> = {
    pending: '待确认',
    preparing: '准备中',
    ready: '已就绪',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知'
}

async function loadOrder(): Promise<void> {
  if (isNaN(orderId)) {
    loading.value = false
    return
  }

  loading.value = true
  const result = await orderApi.getById(orderId)
  if (result.success && result.data) {
    order.value = result.data
  }
  loading.value = false
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-confirm-view {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 2rem;
}

.loading,
.error {
  text-align: center;
  padding: 4rem;
  color: #a0aec0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-text {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.confirm-card {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.success-message {
  color: #718096;
  margin-bottom: 2rem;
}

.order-summary {
  text-align: left;
  background: #f7fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.order-number {
  font-weight: 600;
  color: #2d3748;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.order-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.summary-items {
  margin-bottom: 1.5rem;
}

.items-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.75rem;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-name {
  color: #2d3748;
}

.item-quantity {
  color: #718096;
  font-size: 0.875rem;
}

.item-price {
  font-weight: 500;
  color: #2d3748;
}

.summary-total {
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.total-label {
  color: #718096;
}

.total-value {
  color: #2d3748;
  font-weight: 500;
}

.total-row.grand-total {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 2px solid #e2e8f0;
  font-size: 1.1rem;
}

.total-row.grand-total .total-label,
.total-row.grand-total .total-value {
  font-weight: 700;
  color: #e53e3e;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-buttons .btn {
  text-decoration: none;
  display: inline-block;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
}
</style>
