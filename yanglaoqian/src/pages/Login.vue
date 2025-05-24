<template>
  <div class="login-container" :class="isDarkMode ? 'dark-mode' : 'light-mode'">
    <particle-background />
    <div class="login-box">
      <div class="login-left">
        <div class="welcome-text">
          <h1>乐龄慧护</h1>
          <p>基于物联网与人工智能的养老服务平台</p>
        </div>
        <div class="login-image">
          <img src="../assets/login.png" alt="login background">
        </div>
      </div>
      <div class="login-right">
        <div class="mode-switch">
          <el-switch
            v-model="isDarkMode"
            :active-icon="Moon"
            :inactive-icon="Sunny"
            @change="toggleDarkMode"
          />
        </div>
        <div class="login-form">
          <h2>用户登录</h2>
          <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入用户名"
                :prefix-icon="User"
                class="custom-input"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="请输入密码"
                :prefix-icon="Lock"
                class="custom-input"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleLogin" 
                :loading="loading" 
                class="login-button"
              >
                登录
              </el-button>
            </el-form-item>
            <div class="register-link">
              <span>还没有账号？</span>
              <el-link type="primary" @click="goToRegister">立即注册</el-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Moon, Sunny } from '@element-plus/icons-vue'
import { login } from '../api/auth'
import { useUserStore } from '../stores/userStore'
import ParticleBackground from '../components/ParticleBackground.vue'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const isDarkMode = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

onMounted(() => {
  // 检查本地存储中是否有主题模式设置
  const savedMode = localStorage.getItem('darkMode')
  if (savedMode) {
    isDarkMode.value = savedMode === 'true'
  } else {
    // 检测系统主题
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
  }
})

const toggleDarkMode = () => {
  localStorage.setItem('darkMode', isDarkMode.value)
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm)
        if (res.code === 200) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('userInfo', JSON.stringify(res.data.user))
          userStore.setUserInfo(res.data.user)
          ElMessage.success('登录成功')
          router.push('/')
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s, color 0.3s;
}

.light-mode {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #333;
}

.dark-mode {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: #f3f4f6;
}

.login-box {
  width: 900px;
  height: 500px;
  display: flex;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.5s ease-in-out;
  transition: box-shadow 0.3s, background-color 0.3s;
}

.dark-mode .login-box {
  background-color: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #409EFF 0%, #36D1DC 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  transition: background 0.3s;
}

.dark-mode .login-left {
  background: linear-gradient(135deg, #1e40af 0%, #0369a1 100%);
}

.welcome-text h1 {
  font-size: 32px;
  margin-bottom: 10px;
  animation: slideInLeft 0.5s ease-in-out;
}

.welcome-text p {
  font-size: 16px;
  opacity: 0.8;
  animation: slideInLeft 0.7s ease-in-out;
}

.login-image {
  text-align: center;
  animation: fadeIn 1s ease-in-out;
}

.login-image img {
  max-width: 100%;
  height: auto;
}

.login-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  transition: background-color 0.3s;
}

.dark-mode .login-right {
  background-color: #1e293b;
}

.mode-switch {
  position: absolute;
  top: 20px;
  right: 20px;
}

.login-form {
  width: 100%;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  animation: fadeIn 0.5s ease-in-out;
  transition: color 0.3s;
}

.dark-mode .login-form h2 {
  color: #f3f4f6;
}

.custom-input {
  margin-bottom: 20px;
  animation: fadeIn 0.7s ease-in-out;
}

.login-button {
  width: 100%;
  height: 40px;
  margin-top: 10px;
  animation: fadeIn 0.9s ease-in-out;
  transition: background-color 0.3s, transform 0.2s;
}

.login-button:hover {
  transform: translateY(-2px);
}

.register-link {
  text-align: center;
  margin-top: 20px;
  animation: fadeIn 1s ease-in-out;
  color: #666;
  transition: color 0.3s;
}

.dark-mode .register-link {
  color: #d1d5db;
}

.register-link span {
  margin-right: 10px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6;
  transition: box-shadow 0.3s;
}

.dark-mode :deep(.el-input__wrapper) {
  background-color: #2d3748;
  box-shadow: 0 0 0 1px #4b5563;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409EFF;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF;
}

:deep(.el-input__inner) {
  color: #333333 !important;
}

.dark-mode :deep(.el-input__inner) {
  color: #ffffff !important;
}

:deep(.el-input__inner::placeholder) {
  color: #999999;
}

.dark-mode :deep(.el-input__inner::placeholder) {
  color: #aaaaaa;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 