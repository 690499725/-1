<template>
  <div class="ai-assistant-container">
    <!-- 聊天悬浮按钮 -->
    <div v-if="!showChat" class="chat-toggle-btn" @click="toggleChat">
      <el-icon><ChatDotRound /></el-icon>
    </div>
    
    <!-- 聊天窗口 -->
    <transition name="fade">
      <div v-if="showChat" class="chat-window">
        <!-- 聊天窗口头部 -->
        <div class="chat-header">
          <div class="chat-title">
            <el-icon><ChatDotRound /></el-icon>
            <span>智能助手</span>
          </div>
          <el-icon class="close-btn" @click="toggleChat"><Close /></el-icon>
        </div>
        
        <!-- 聊天消息区域 -->
        <div class="chat-body" ref="chatBodyRef">
          <div 
            v-for="(msg, index) in chatMessages" 
            :key="index" 
            :class="['message', msg.type === 'user' ? 'message-user' : 'message-bot']">
            <div class="message-bubble">
              <div v-if="msg.type === 'bot' && msg.loading">
                <div class="loading-dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </div>
              <template v-else>
                {{msg.content}}
              </template>
            </div>
            <div class="message-time">{{msg.time}}</div>
          </div>
        </div>
        
        <!-- 聊天输入区域 -->
        <div class="chat-input">
          <el-input 
            v-model="userInput" 
            placeholder="输入问题..." 
            :disabled="loading"
            @keyup.enter="sendMessage">
          </el-input>
          <button class="send-btn" @click="sendMessage" :disabled="loading || !userInput.trim()">
            <el-icon><Position /></el-icon>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, defineExpose } from 'vue'
import { ElMessage } from 'element-plus'
import { callCozeBotV2 } from '../utils/request.js'
import { getAiConfig } from '../assets/js/config.js'
import { ChatDotRound, Position, Close } from '@element-plus/icons-vue'

// 聊天界面显示状态
const showChat = ref(false)
const toggleChat = () => {
  showChat.value = !showChat.value
  if (showChat.value && chatMessages.length === 0) {
    // 首次打开时添加欢迎消息
    addBotMessage('您好，我是智能助手，有什么可以帮您的？')
  }
}

// 聊天消息区域引用，用于自动滚动
const chatBodyRef = ref(null)

// 用户输入
const userInput = ref('')

// 加载状态
const loading = ref(false)

// 聊天记录 - 限制最大消息数量为20条
const chatMessages = reactive([])
const MAX_MESSAGES = 20

// 获取当前时间格式化字符串
const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 添加用户消息
const addUserMessage = (content) => {
  // 限制消息数量
  if (chatMessages.length >= MAX_MESSAGES) {
    chatMessages.shift() // 移除最旧的消息
  }
  
  chatMessages.push({
    type: 'user',
    content,
    time: getCurrentTime()
  })
  scrollToBottom()
}

// 添加机器人消息
const addBotMessage = (content, isLoading = false) => {
  // 限制消息数量
  if (chatMessages.length >= MAX_MESSAGES) {
    chatMessages.shift() // 移除最旧的消息
  }
  
  chatMessages.push({
    type: 'bot',
    content,
    time: getCurrentTime(),
    loading: isLoading
  })
  scrollToBottom()
}

// 更新最后一条机器人消息（用于加载态）
const updateLastBotMessage = (content) => {
  for (let i = chatMessages.length - 1; i >= 0; i--) {
    if (chatMessages[i].type === 'bot') {
      chatMessages[i].content = content
      chatMessages[i].loading = false
      break
    }
  }
  scrollToBottom()
}

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || loading.value) return
  
  addUserMessage(message)
  userInput.value = ''
  loading.value = true
  
  // 添加机器人加载中消息
  addBotMessage('', true)
  
  try {
    // 获取AI配置
    const aiConfig = getAiConfig()
    
    // 使用V2 API调用Coze智能体
    const response = await callCozeBotV2(
      message,
      aiConfig.assistant.bot_id
    )
    
    if (response && response.code === 0 && response.messages && response.messages.length > 0) {
      // 获取第一条assistant类型的回复消息作为回答
      const assistantMessage = response.messages.find(msg => msg.role === 'assistant' && msg.type === 'answer')
      if (assistantMessage && assistantMessage.content) {
        updateLastBotMessage(assistantMessage.content)
      } else {
        updateLastBotMessage('抱歉，我暂时无法回答您的问题，请稍后再试')
      }
    } else {
      updateLastBotMessage('抱歉，我暂时无法回答您的问题，请稍后再试')
    }
  } catch (error) {
    updateLastBotMessage('抱歉，系统出现错误，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 暴露方法供外部使用
defineExpose({
  toggleChat
})
</script>

<style scoped>
.ai-assistant-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-toggle-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(78, 205, 196, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.chat-toggle-btn:hover {
  transform: scale(1.1);
  background: rgba(78, 205, 196, 0.8);
}

.chat-toggle-btn .el-icon {
  font-size: 24px;
}

.chat-window {
  position: absolute;
  bottom: 65px;
  right: 0;
  width: 350px;
  height: 450px;
  background: rgba(15, 23, 42, 0.65);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform-origin: bottom right;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: rgba(12, 19, 36, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-title {
  font-size: 16px;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
}

.chat-title .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.close-btn {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: white;
}

.chat-body {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message-user {
  align-items: flex-end;
}

.message-bot {
  align-items: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 15px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-user .message-bubble {
  background: rgba(78, 205, 196, 0.8);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bot .message-bubble {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 11px;
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.5);
}

.chat-input {
  padding: 15px;
  display: flex;
  align-items: center;
  background: rgba(12, 19, 36, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input .el-input {
  flex: 1;
}

:deep(.el-input__inner) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 20px;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.send-btn {
  background: rgba(78, 205, 196, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover {
  background: rgba(78, 205, 196, 1);
  transform: scale(1.05);
}

.send-btn:disabled {
  background: rgba(78, 205, 196, 0.3);
  cursor: not-allowed;
}

/* 消息加载动画 */
.loading-dots {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  margin: 0 3px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.7);
  animation: dot-pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0% { transform: scale(0.6); opacity: 0.6; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.6); opacity: 0.6; }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style> 