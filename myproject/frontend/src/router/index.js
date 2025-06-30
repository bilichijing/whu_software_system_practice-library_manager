import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '@/views/UserLogin.vue'
import UserRegister from '@/views/UserRegister.vue'
import UserDashboard from '@/views/UserDashboard.vue'
import UserProfile from '@/views/UserProfile.vue'
import PointsManagement from '@/views/PointsManagement.vue'
import SeatBooking from '@/views/SeatBooking.vue'
import BookingHistory from '@/views/BookingHistory.vue'
import RatingManagement from '@/views/RatingManagement.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'UserLogin',
    component: UserLogin,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'UserRegister',
    component: UserRegister,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/points',
    name: 'PointsManagement',
    component: PointsManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/booking',
    name: 'SeatBooking',
    component: SeatBooking,
    meta: { requiresAuth: true }
  },
  {
    path: '/bookings',
    name: 'BookingHistory',
    component: BookingHistory,
    meta: { requiresAuth: true }
  },
  {
    path: '/ratings',
    name: 'RatingManagement',
    component: RatingManagement,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 