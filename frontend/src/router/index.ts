import { createRouter, createWebHistory } from 'vue-router'
import MenuView from '@/views/MenuView.vue'
import OrdersView from '@/views/OrdersView.vue'
import OrderDetailView from '@/views/OrderDetailView.vue'
import OrderConfirmView from '@/views/OrderConfirmView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'menu',
      component: MenuView
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrdersView
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: OrderDetailView,
      props: true
    },
    {
      path: '/order-confirm/:id',
      name: 'order-confirm',
      component: OrderConfirmView,
      props: true
    }
  ]
})

export default router
