<template>
  <div class="register-container" :class="isDarkMode ? 'dark-mode' : 'light-mode'">
    <particle-background />
    <div class="register-box">
      <div class="register-left">
        <div class="welcome-text">
          <h1>乐龄慧护</h1>
          <p>基于 VR +AI 的智慧养老院数字孪生平台：智能监控与健康管理一体化系</p>
        </div>
        <div class="register-image">
          <img src="../assets/login.png" alt="register background">
        </div>
      </div>
      <div class="register-right">
        <div class="mode-switch">
          <el-switch
            v-model="isDarkMode"
            :active-icon="Moon"
            :inactive-icon="Sunny"
            @change="toggleDarkMode"
          />
        </div>
        <div class="register-form">
          <h2>用户注册</h2>
          <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
            <el-form-item prop="username">
              <el-input 
                v-model="registerForm.username" 
                placeholder="请输入用户名"
                :prefix-icon="User"
                class="custom-input"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="请输入密码"
                :prefix-icon="Lock"
                class="custom-input"
                show-password
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                placeholder="请确认密码"
                :prefix-icon="Lock"
                class="custom-input"
                show-password
              />
            </el-form-item>
            <el-form-item prop="name">
              <el-input 
                v-model="registerForm.name" 
                placeholder="请输入姓名"
                :prefix-icon="User"
                class="custom-input"
              />
            </el-form-item>
            <el-form-item prop="role">
              <el-select 
                v-model="registerForm.role" 
                placeholder="请选择角色"
                class="custom-input"
                style="width: 100%"
              >
                <el-option label="管理员" value="admin" />
                <el-option label="普通员工" value="staff" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleRegister" 
                :loading="loading" 
                class="register-button"
              >
                注册
              </el-button>
            </el-form-item>
            <div class="login-link">
              <span>已有账号？</span>
              <el-link type="primary" @click="goToLogin">立即登录</el-link>
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
import { register } from '../api/auth'
import ParticleBackground from '../components/ParticleBackground.vue'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)
const isDarkMode = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  role: 'staff'
})

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

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const { confirmPassword, ...data } = registerForm
        const res = await register(data)
        if (res.code === 201 || res.code === 200) {
          ElMessage.success('注册成功')
          // 使用 window.location.href 进行跳转
          window.location.href = '/#/login'
        } else {
          ElMessage.error(res.message || '注册失败')
        }
      } catch (error) {
        console.error('注册错误:', error)
        ElMessage.error(error.response?.data?.message || '注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const goToLogin = () => {
  window.location.href = '/#/login'
}
</script>

<style scoped>
.register-container {
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

.register-box {
  width: 900px;
  height: 600px;
  display: flex;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.5s ease-in-out;
  transition: box-shadow 0.3s, background-color 0.3s;
}

.dark-mode .register-box {
  background-color: #1e293b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.register-left {
  flex: 1;
  background: linear-gradient(135deg, #409EFF 0%, #36D1DC 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  transition: background 0.3s;
}

.dark-mode .register-left {
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

.register-image {
  text-align: center;
  animation: fadeIn 1s ease-in-out;
}

.register-image img {
  max-width: 100%;
  height: auto;
}

.register-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  transition: background-color 0.3s;
}

.dark-mode .register-right {
  background-color: #1e293b;
}

.mode-switch {
  position: absolute;
  top: 20px;
  right: 20px;
}

.register-form {
  width: 100%;
}

.register-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  animation: fadeIn 0.5s ease-in-out;
  transition: color 0.3s;
}

.dark-mode .register-form h2 {
  color: #f3f4f6;
}

.custom-input {
  margin-bottom: 20px;
  animation: fadeIn 0.7s ease-in-out;
}

.register-button {
  width: 100%;
  height: 40px;
  margin-top: 10px;
  animation: fadeIn 0.9s ease-in-out;
  transition: background-color 0.3s, transform 0.2s;
}

.register-button:hover {
  transform: translateY(-2px);
}

.login-link {
  text-align: center;
  margin-top: 20px;
  animation: fadeIn 1s ease-in-out;
  color: #666;
  transition: color 0.3s;
}

.dark-mode .login-link {
  color: #d1d5db;
}

.login-link span {
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

.dark-mode :deep(.el-input__inner) {
  color: #f3f4f6;
}

.dark-mode :deep(.el-select__popper) {
  background-color: #1e293b;
  color: #f3f4f6;
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