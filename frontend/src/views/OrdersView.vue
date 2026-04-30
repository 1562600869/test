<template>
  <div class="orders-view">
    <h2 class="page-title">我的订单</h2>

    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>

    <div v-else-if="orders.length === 0" class="empty-orders">
      <div class="empty-icon">📋</div>
      <p class="empty-text">暂无订单</p>
      <p class="empty-hint">快去点餐吧！</p>
      <router-link to="/" class="btn btn-primary">
        去点餐
      </router-link>
    </div>

    <div v-else class="orders-list">
      <div 
        v-for="order in orders" 
        :key="order.id"
        class="order-card"
        @click="goToDetail(order.id)"
      >
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号: {{ order.orderNumber }}</span>
            <span class="order-time">{{ formatDate(order.createdAt) }}</span>
          </div>
          <span :class="['order-status', order.status]">
            {{ getStatusText(order.status) }}
          </span>
        </div>
        
        <div class="order-items-preview">
          <span class="items-label">包含菜品：</span>
          <span class="items-names">
            {{ order.items.map(item => item.menuItemName).join('、') }}
          </span>
        </div>

        <div class="order-footer">
          <span class="item-count">共 {{ order.items.length }} 件</span>
          <span class="order-amount">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi } from '@/api'
import type { Order } from '@/types'

const orders = ref<Order[]>([])
const loading = ref(true)

const router = useRouter()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

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

async function loadOrders(): Promise<void> {
  loading.value = true
  const result = await orderApi.getAll()
  if (result.success && result.data) {
    orders.value = result.data.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
  loading.value = false
}

function goToDetail(orderId: number): void {
  router.push(`/orders/${orderId}`)
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-view {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #a0aec0;
}

.empty-orders {
  text-align: center;
  padding: 4rem;
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
  margin-bottom: 1.5rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-number {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.order-time {
  font-size: 0.875rem;
  color: #718096;
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

.order-status.preparing {
  background: #dbeafe;
  color: #2563eb;
}

.order-status.ready {
  background: #d1fae5;
  color: #059669;
}

.order-status.completed {
  background: #e5e7eb;
  color: #6b7280;
}

.order-status.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.order-items-preview {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.items-label {
  font-size: 0.875rem;
  color: #718096;
}

.items-names {
  font-size: 0.875rem;
  color: #4a5568;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-count {
  font-size: 0.875rem;
  color: #718096;
}

.order-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e53e3e;
}
</style>
