<template>
  <div class="menu-view">
    <div class="menu-header">
      <div class="search-section">
        <input 
          type="text" 
          v-model="searchKeyword"
          placeholder="搜索菜品..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
      
      <div class="category-section">
        <button 
          v-for="category in categories" 
          :key="category"
          :class="['category-btn', { 'active': selectedCategory === category }]"
          @click="selectCategory(category)"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <div class="menu-grid">
      <div 
        v-for="item in filteredMenuItems" 
        :key="item.id"
        @click="openDetail(item)"
      >
        <MenuCard 
          :menu-item="item" 
          @add="handleAddToCart"
        />
      </div>
    </div>

    <div v-if="filteredMenuItems.length === 0" class="empty-result">
      <p>没有找到匹配的菜品</p>
    </div>

    <button v-if="cartItemCount > 0" class="cart-float-btn" @click="openCart">
      <span class="cart-icon">🛒</span>
      <span class="cart-count-badge">{{ cartItemCount }}</span>
      <span class="cart-total">¥{{ cartTotal }}</span>
    </button>

    <MenuDetailModal 
      :visible="isDetailModalOpen"
      :menu-item="selectedMenuItem"
      @close="closeDetail"
      @add="handleAddToCart"
    />

    <CartSidebar 
      :is-open="isCartOpen"
      @close="closeCart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/store/cart'
import { storeToRefs } from 'pinia'
import { menuApi } from '@/api'
import type { MenuItem } from '@/types'
import MenuCard from '@/components/MenuCard.vue'
import MenuDetailModal from '@/components/MenuDetailModal.vue'
import CartSidebar from '@/components/CartSidebar.vue'

const menuItems = ref<MenuItem[]>([])
const categories = ref<string[]>(['全部'])
const searchKeyword = ref('')
const selectedCategory = ref('全部')
const isDetailModalOpen = ref(false)
const selectedMenuItem = ref<MenuItem | null>(null)
const isCartOpen = ref(false)

const cartStore = useCartStore()
const { itemCount: cartItemCount, totalAmount: cartTotal } = storeToRefs(cartStore)

const filteredMenuItems = computed(() => {
  let items = menuItems.value

  if (selectedCategory.value !== '全部') {
    items = items.filter(item => item.category === selectedCategory.value)
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    items = items.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }

  return items
})

async function loadMenuItems(): Promise<void> {
  const result = await menuApi.getAll()
  if (result.success && result.data) {
    menuItems.value = result.data
  }
}

async function loadCategories(): Promise<void> {
  const result = await menuApi.getCategories()
  if (result.success && result.data) {
    categories.value = ['全部', ...result.data]
  }
}

function selectCategory(category: string): void {
  selectedCategory.value = category
}

function handleSearch(): void {
}

function openDetail(item: MenuItem): void {
  selectedMenuItem.value = item
  isDetailModalOpen.value = true
}

function closeDetail(): void {
  isDetailModalOpen.value = false
  selectedMenuItem.value = null
}

function handleAddToCart(item: MenuItem, quantity: number = 1): void {
  cartStore.addItem(item, quantity)
}

function openCart(): void {
  isCartOpen.value = true
}

function closeCart(): void {
  isCartOpen.value = false
}

onMounted(() => {
  loadMenuItems()
  loadCategories()
})
</script>

<style scoped>
.menu-view {
  max-width: 1400px;
  margin: 0 auto;
}

.menu-header {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.search-section {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #667eea;
}

.category-section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.category-btn {
  padding: 0.625rem 1.25rem;
  background: #f7fafc;
  border: none;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: #edf2f7;
}

.category-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.empty-result {
  text-align: center;
  padding: 4rem;
  color: #a0aec0;
  font-size: 1.1rem;
}

.cart-float-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 3rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  z-index: 100;
}

.cart-float-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.cart-icon {
  font-size: 1.25rem;
}

.cart-count-badge {
  background: white;
  color: #667eea;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.cart-total {
  font-weight: 600;
  font-size: 1rem;
}
</style>
