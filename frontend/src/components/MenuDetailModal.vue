<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content">
        <button class="modal-close" @click="handleClose">×</button>
        
        <div class="modal-image">
          <img :src="menuItem?.image" :alt="menuItem?.name" />
        </div>

        <div class="modal-body">
          <div class="modal-header">
            <h2 class="modal-title">{{ menuItem?.name }}</h2>
            <span class="modal-price">¥{{ menuItem?.price.toFixed(2) }}</span>
          </div>

          <p class="modal-description">{{ menuItem?.description }}</p>

          <div v-if="menuItem?.allergens && menuItem.allergens.length > 0" class="modal-allergens">
            <h4 class="allergens-title">过敏原信息</h4>
            <div class="allergens-list">
              <span 
                v-for="allergen in menuItem.allergens" 
                :key="allergen"
                class="allergen-tag"
              >
                {{ allergen }}
              </span>
            </div>
          </div>

          <div class="modal-status" v-if="menuItem">
            <span class="status-label">库存状态：</span>
            <span :class="['status-value', menuItem.status]">
              {{ statusText }}
            </span>
          </div>

          <div class="modal-actions">
            <div class="quantity-control">
              <button class="quantity-btn" @click="decreaseQuantity" :disabled="quantity <= 1">−</button>
              <span class="quantity-value">{{ quantity }}</span>
              <button class="quantity-btn" @click="increaseQuantity" :disabled="menuItem?.stock === 0 || quantity >= (menuItem?.stock || 0)">+</button>
            </div>
            <button 
              class="btn btn-primary btn-add-cart"
              @click="handleAddToCart"
              :disabled="menuItem?.status === 'sold_out'"
            >
              加入购物车
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MenuItem } from '@/types'

const props = defineProps<{
  visible: boolean
  menuItem: MenuItem | null
}>()

const emit = defineEmits<{
  close: []
  add: [item: MenuItem, quantity: number]
}>()

const quantity = ref(1)

const statusText = computed(() => {
  switch (props.menuItem?.status) {
    case 'available':
      return '充足'
    case 'low_stock':
      return '库存紧张'
    case 'sold_out':
      return '已售罄'
    default:
      return '未知'
  }
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    quantity.value = 1
  }
})

function increaseQuantity(): void {
  if (props.menuItem && quantity.value < props.menuItem.stock) {
    quantity.value++
  }
}

function decreaseQuantity(): void {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function handleClose(): void {
  emit('close')
}

function handleAddToCart(): void {
  if (props.menuItem) {
    emit('add', props.menuItem, quantity.value)
    handleClose()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: white;
  color: #4a5568;
  font-size: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-close:hover {
  background: #f7fafc;
  color: #2d3748;
}

.modal-image {
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-body {
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.modal-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #e53e3e;
}

.modal-description {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.modal-allergens {
  margin-bottom: 1.5rem;
}

.allergens-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.allergens-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.allergen-tag {
  padding: 0.25rem 0.75rem;
  background-color: #fed7d7;
  color: #c53030;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.modal-status {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-label {
  font-size: 0.875rem;
  color: #718096;
}

.status-value {
  font-size: 0.875rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.status-value.available {
  color: #38a169;
}

.status-value.low_stock {
  color: #d69e2e;
}

.status-value.sold_out {
  color: #e53e3e;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.quantity-control {
  display: flex;
  align-items: center;
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.quantity-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background: white;
  color: #4a5568;
  font-size: 1.25rem;
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
  width: 3rem;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.btn-add-cart {
  flex: 1;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.btn-add-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
