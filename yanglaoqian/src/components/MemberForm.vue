<template>
  <div>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="form.gender" placeholder="请选择性别">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="form.age" :min="1" :max="150" />
      </el-form-item>
      <el-form-item label="身份证号" prop="id_card">
        <el-input v-model="form.id_card" placeholder="请输入身份证号" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="紧急联系人" prop="emergency_contact">
        <el-input v-model="form.emergency_contact" placeholder="请输入紧急联系人" />
      </el-form-item>
      <el-form-item label="紧急电话" prop="emergency_phone">
        <el-input v-model="form.emergency_phone" placeholder="请输入紧急联系电话" />
      </el-form-item>
      <el-form-item label="护理级别" prop="care_level">
        <el-select v-model="form.care_level" placeholder="请选择护理级别">
          <el-option label="自理" value="自理" />
          <el-option label="介助" value="介助" />
          <el-option label="介护" value="介护" />
          <el-option label="特护" value="特护" />
        </el-select>
      </el-form-item>
      <el-form-item label="健康状况" prop="health_conditions">
        <el-select v-model="form.health_conditions" multiple placeholder="请选择健康状况" style="width: 100%">
          <el-option label="高血压" value="高血压" />
          <el-option label="糖尿病" value="糖尿病" />
          <el-option label="心脏病" value="心脏病" />
          <el-option label="老年痴呆" value="老年痴呆" />
          <el-option label="骨质疏松" value="骨质疏松" />
          <el-option label="关节炎" value="关节炎" />
          <el-option label="中风" value="中风" />
          <el-option label="肺炎" value="肺炎" />
          <el-option label="冠心病" value="冠心病" />
          <el-option label="白内障" value="白内障" />
        </el-select>
      </el-form-item>
      <el-form-item label="责任护工" prop="responsibility_worker">
        <el-select v-model="form.responsibility_worker" placeholder="请选择责任护工" filterable allow-create>
          <el-option
            v-for="item in workerOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="健康详情" prop="health_detail">
        <el-input type="textarea" v-model="form.health_detail" placeholder="请输入健康状况详细描述" rows="3" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  initialForm: {
    type: Object,
    default: () => ({
      name: '',
      gender: '',
      age: 60,
      id_card: '',
      phone: '',
      emergency_contact: '',
      emergency_phone: '',
      care_level: '',
      health_conditions: [],
      responsibility_worker: '',
      health_detail: ''
    })
  },
  workerOptions: {
    type: Array,
    default: () => [
      { label: '张护工', value: '张护工' },
      { label: '王护工', value: '王护工' },
      { label: '李护工', value: '李护工' },
      { label: '赵护工', value: '赵护工' },
      { label: '刘护工', value: '刘护工' }
    ]
  }
})

const emit = defineEmits(['update:form'])

// 表单数据 - 使用传入的初始值
const form = reactive({ ...props.initialForm })

// 验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 1, max: 150, message: '年龄必须在1-150之间', trigger: 'blur' }
  ],
  id_card: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  emergency_phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  care_level: [
    { required: true, message: '请选择护理级别', trigger: 'change' }
  ]
}

const formRef = ref(null)

// 向父组件暴露的方法
defineExpose({
  validate: () => {
    return new Promise((resolve) => {
      formRef.value?.validate((valid) => {
        resolve(valid ? form : null)
      })
    })
  },
  resetFields: () => {
    formRef.value?.resetFields()
  },
  getForm: () => form
})
</script>

<style scoped>
/* 自定义样式可以在这里添加 */
</style> 