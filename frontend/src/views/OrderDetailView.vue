<template>
  <div class="order-detail-view">
    <button class="back-btn" @click="goBack">← 返回订单列表</button>

    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>

    <div v-else-if="!order" class="not-found">
      <p>订单不存在</p>
      <router-link to="/orders" class="btn btn-primary">
        查看所有订单
      </router-link>
    </div>

    <div v-else class="order-detail">
      <div class="detail-header">
        <div class="order-info">
          <h2 class="order-number">订单号: {{ order.orderNumber }}</h2>
          <p class="order-time">{{ formatDate(order.createdAt) }}</p>
        </div>
        <span :class="['order-status', order.status]">
          {{ getStatusText(order.status) }}
        </span>
      </div>

      <div class="detail-section">
        <h3 class="section-title">订单菜品</h3>
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <div class="item-info">
              <span class="item-name">{{ item.menuItemName }}</span>
              <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
            </div>
            <div class="item-quantity">× {{ item.quantity }}</div>
            <div class="item-subtotal">¥{{ item.subtotal.toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <div class="detail-section summary">
        <h3 class="section-title">金额明细</h3>
        <div class="summary-row">
          <span class="summary-label">小计</span>
          <span class="summary-value">¥{{ order.subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">税费 (10%)</span>
          <span class="summary-value">¥{{ order.taxAmount.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span class="summary-label">合计</span>
          <span class="summary-value">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div v-if="order.status === 'pending'" class="action-section">
        <button class="btn btn-secondary" @click="cancelOrder">取消订单</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { orderApi } from '@/api'
import type { Order } from '@/types'

const order = ref<Order | null>(null)
const loading = ref(true)

const router = useRouter()
const route = useRoute()
const orderId = Number(route.params.id)

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

async function cancelOrder(): Promise<void> {
  if (!confirm('确定要取消这个订单吗？')) {
    return
  }

  const result = await orderApi.updateStatus(orderId, 'cancelled')
  if (result.success && result.data) {
    order.value = result.data
  }
}

function goBack(): void {
  router.back()
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-detail-view {
  max-width: 700px;
  margin: 0 auto;
}

.back-btn {
  background: transparent;
  color: #667eea;
  font-size: 1rem;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
}

.back-btn:hover {
  color: #5a67d8;
}

.loading,
.not-found {
  text-align: center;
  padding: 4rem;
  color: #a0aec0;
}

.order-detail {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.order-time {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.order-status {
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
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

.detail-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 0.5rem;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 500;
  color: #2d3748;
}

.item-price {
  font-size: 0.875rem;
  color: #718096;
}

.item-quantity {
  color: #4a5568;
  font-weight: 500;
}

.item-subtotal {
  font-weight: 600;
  color: #2d3748;
}

.summary {
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  margin-bottom: 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.summary-label {
  color: #718096;
}

.summary-value {
  color: #2d3748;
  font-weight: 500;
}

.summary-row.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
  font-size: 1.25rem;
}

.summary-row.total .summary-label,
.summary-row.total .summary-value {
  font-weight: 700;
  color: #e53e3e;
}

.action-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
</style>
