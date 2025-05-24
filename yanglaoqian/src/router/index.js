import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Index from '../pages/Index.vue'
import Bed from '../pages/Bed.vue'
import Health from '../pages/Health.vue'
import Video from '../pages/Video.vue'
import Members from '../pages/Members.vue'



const routes = [
  {
    path: '/login',
    name: 'Login',
    // component: ()=> import("../pages/Login.vue"),
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    // component:  ()=> import("../pages/Register.vue"),
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
    // component:  ()=> import("../pages/Index.vue"),
    component: Index,
    meta: { requiresAuth: true }
  },
  {
    path: '/bed',
    name: 'Bed',
    component: Bed,
    // component: ()=> import("../pages/Bed.vue"),

    meta: { requiresAuth: true }
  },
  {
    path: '/members',
    name: 'Members',
    // component:  ()=> import("../pages/Members.vue"),
    component: Members,
    meta: { requiresAuth: true }
  },
  {
    path: '/health',
    name: 'Health',
    // component:  ()=> import("../pages/Health.vue"),
    component: Health,
    meta: { requiresAuth: true }
  },
  {
    path: '/video',
    name: 'Video',
    // component:  ()=> import("../pages/Video.vue"),
    component: Video,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')  // 如果需要认证但没有token，重定向到登录页
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/')       // 已登录用户试图访问登录/注册页，重定向到首页
  } else {
    next()          // 其他情况正常导航
  }
})

export default router 