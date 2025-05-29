import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Index from '../pages/Index.vue'
import Bed from '../pages/Bed.vue'
import Health from '../pages/Health.vue'
import Video from '../pages/Video.vue'
import Members from '../pages/Members.vue'
import { hasPermission, handlePermissionDenied } from '../utils/permission'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'Index',
    component: Index,
    meta: { requiresAuth: true, isPublic: true }
  },
  {
    path: '/bed',
    name: 'Bed',
    component: Bed,
    meta: { requiresAuth: true, permission: ["bed"] }
  },
  {
    path: '/members',
    name: 'Members',
    component: Members,
    meta: { requiresAuth: true, permission: ["member"] }
  },
  {
    path: '/health',
    name: 'Health',
    component: Health,
    meta: { requiresAuth: true, permission: ["health"] }
  },
  {
    path: '/video',
    name: 'Video',
    component: Video,
    meta: { requiresAuth: true, permission: ["video"] }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  
  // 已登录用户试图访问登录/注册页，重定向到首页
  if ((to.path === '/login' || to.path === '/register') && token) {
    next('/')
    return
  }
  
  // 检查权限
  if (to.meta.requiresAuth && token) {
    // 如果是公开页面，直接放行
    if (to.meta.isPublic) {
      next()
      return
    }
    
    // 检查是否有权限访问
    if (to.meta.permission && !hasPermission(to.meta.permission)) {
      handlePermissionDenied()
      next(false)
      return
    }
  }
  
  next()
})

export default router 