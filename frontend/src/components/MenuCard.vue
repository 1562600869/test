<template>
  <div class="menu-card" :class="{ 'sold-out': menuItem.status === 'sold_out' }">
    <div class="menu-card-image">
      <img :src="menuItem.image" :alt="menuItem.name" />
      <div v-if="menuItem.status === 'sold_out'" class="sold-out-badge">已售罄</div>
      <div v-else-if="menuItem.status === 'low_stock'" class="low-stock-badge">库存紧张</div>
    </div>
    <div class="menu-card-content">
      <h3 class="menu-card-name">{{ menuItem.name }}</h3>
      <p class="menu-card-desc">{{ menuItem.description }}</p>
      <div class="menu-card-bottom">
        <span class="menu-card-price">¥{{ menuItem.price.toFixed(2) }}</span>
        <button 
          class="btn-add" 
          @click="handleAdd"
          :disabled="menuItem.status === 'sold_out'"
        >
          加购
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types'

const props = defineProps<{
  menuItem: MenuItem
}>()

const emit = defineEmits<{
  add: [item: MenuItem]
  click: [item: MenuItem]
}>()

function handleAdd(event: Event): void {
  event.stopPropagation()
  emit('add', props.menuItem)
}
</script>

<style scoped>
.menu-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.menu-card:hover:not(.sold-out) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.menu-card.sold-out {
  opacity: 0.7;
  cursor: not-allowed;
}

.menu-card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.menu-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sold-out-badge,
.low-stock-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.sold-out-badge {
  background-color: #ef4444;
  color: white;
}

.low-stock-badge {
  background-color: #f59e0b;
  color: white;
}

.menu-card-content {
  padding: 1rem;
}

.menu-card-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.menu-card-desc {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-card-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e53e3e;
}

.btn-add {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-add:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}
</style>
