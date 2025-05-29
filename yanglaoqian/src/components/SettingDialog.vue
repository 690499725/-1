<template>
  <el-dialog
    v-model="dialogVisible"
    title="系统设置"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form :model="form" label-width="120px" ref="formRef">
      <el-form-item label="API基础地址">
        <el-input 
          v-model="form.baseURL" 
          placeholder="请输入API基础地址"
          @input="handleInput"
        />
      </el-form-item>
      <el-form-item label="Coze API密钥">
        <el-input 
          v-model="form.apiKey" 
          placeholder="请输入Coze API密钥" 
          show-password
          @input="handleInput"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import service from '../utils/request'
import { getAiConfig } from '../assets/js/config'

const dialogVisible = ref(false)
const formRef = ref(null)
const isDirty = ref(false)

// 使用深拷贝来避免直接修改原始数据
const form = reactive({
  baseURL: '',
  apiKey: ''
})

// 初始化表单数据
const initForm = () => {
  const savedConfig = JSON.parse(localStorage.getItem('apiConfig') || '{}')
  form.baseURL = savedConfig.baseURL || service.defaults.baseURL
  form.apiKey = savedConfig.apiKey || getAiConfig().api_key
  isDirty.value = false
}

// 打开对话框
const open = () => {
  dialogVisible.value = true
  initForm()
}

// 处理输入事件
const handleInput = () => {
  isDirty.value = true
}

// 处理取消
const handleCancel = () => {
  if (isDirty.value) {
    ElMessage.warning('有未保存的更改，请确认是否关闭')
    return
  }
  dialogVisible.value = false
}

// 处理对话框关闭
const handleClosed = () => {
  isDirty.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 保存设置
const handleSave = () => {
  try {
    // 更新request.js中的baseURL
    service.defaults.baseURL = form.baseURL
    
    // 更新config.js中的api_key
    const aiConfig = getAiConfig()
    aiConfig.api_key = form.apiKey
    
    // 保存到localStorage
    localStorage.setItem('apiConfig', JSON.stringify({
      baseURL: form.baseURL,
      apiKey: form.apiKey
    }))
    
    ElMessage.success('设置保存成功')
    dialogVisible.value = false
    isDirty.value = false
  } catch (error) {
    ElMessage.error('设置保存失败：' + error.message)
  }
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  height: 32px;
}
</style> 