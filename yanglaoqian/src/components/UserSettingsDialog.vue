<template>
  <el-dialog
    v-model="dialogVisible"
    title="个人设置"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-tabs v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-form :model="userForm" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="userForm.username" disabled />
          </el-form-item>
          <el-form-item label="角色">
            <el-tag :type="userForm.role === 'admin' ? 'danger' : 'success'">
              {{ userForm.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 权限管理（仅管理员可见） -->
      <el-tab-pane v-if="isAdmin" label="权限管理" name="permissions">
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入用户名或姓名搜索"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>

        <el-table 
          v-loading="loading"
          :data="users" 
          style="width: 100%; margin-top: 20px"
          height="400"
          :row-key="row => row.id"
          border
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'success'" size="small">
                {{ row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="权限" min-width="300">
            <template #default="{ row }">
              <el-checkbox-group 
                v-model="row.permissions"
                @change="handlePermissionChange(row)"
              >
                <el-checkbox label="bed">床位管理</el-checkbox>
                <el-checkbox label="member">老人管理</el-checkbox>
                <el-checkbox label="health">健康监控</el-checkbox>
                <el-checkbox label="video">安防监控</el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                link 
                :loading="row.saving"
                @click="handleSavePermissions(row)"
              >
                保存
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            layout="total, sizes, prev, pager, next"
            background
          />
        </div>
      </el-tab-pane>

      <!-- 非管理员显示提示 -->
      <el-tab-pane v-else label="权限管理" name="permissions">
        <el-result
          icon="warning"
          title="权限不足"
          sub-title="只有管理员可以管理用户权限"
        >
          <template #extra>
            <el-button type="primary" @click="closeDialog">关闭</el-button>
          </template>
        </el-result>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import service from '../utils/request'
import { debounce } from 'lodash-es'
import { hasPermission as checkPermission, isAdmin as checkIsAdmin } from '../utils/permission'

const dialogVisible = ref(false)
const activeTab = ref('basic')
const searchKeyword = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(4)
const total = ref(0)
const loading = ref(false)

// 当前用户信息
const userForm = ref({
  username: '',
  role: '',
  permissions: []
})

// 用户列表
const users = ref([])

// 检查是否为管理员
const isAdmin = computed(() => {
  return checkIsAdmin()
})

// 检查是否有特定权限
const hasPermission = (permission) => {
  return checkPermission(permission)
}

// 使用防抖处理搜索
const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchEmployees()
}, 300)

// 获取普通员工数据
const fetchEmployees = async () => {
  if (!isAdmin.value) return

  try {
    loading.value = true
    const response = await service.get('/root/getEmployee', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        keyword: searchKeyword.value
      }
    })
    
    if (response.code === 200) {
      users.value = response.data.map(employee => ({
        ...employee,
        permissions: Array.isArray(employee.permissions) ? employee.permissions : 
                    (typeof employee.permissions === 'string' ? JSON.parse(employee.permissions) : []),
        saving: false,
        hasChanges: false
      }))
      total.value = response.total
    } else {
      ElMessage.error(response.message || '获取员工数据失败')
    }
  } catch (error) {
    console.error('获取员工数据失败:', error)
    if (error.response?.status === 403) {
      ElMessage.warning('权限不足，无法执行此操作')
    } else {
      ElMessage.error('获取员工数据失败：' + (error.response?.data?.message || error.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchEmployees()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchEmployees()
}

// 处理权限变化
const handlePermissionChange = (user) => {
  // 标记用户有未保存的更改
  user.hasChanges = true
}

// 处理保存权限
const handleSavePermissions = async (user) => {
  if (!isAdmin.value) {
    ElMessage.warning('权限不足，无法执行此操作')
    return
  }

  if (!user.hasChanges) {
    ElMessage.info('没有需要保存的更改')
    return
  }

  try {
    user.saving = true
    const response = await service.post('/root/updatePermissions', {
      userId: user.id,
      permissions: user.permissions
    })
    
    if (response.code === 200) {
      user.hasChanges = false
      ElMessage.success('权限保存成功')
    }
  } catch (error) {
    console.error('保存权限失败:', error)
    // 如果是超时错误，但数据可能已经保存成功
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      user.hasChanges = false
      ElMessage.success('权限已更新')
      return
    }
    
    if (error.response?.status === 403) {
      ElMessage.warning('权限不足，无法执行此操作')
    } else {
      ElMessage.error('保存权限失败：' + (error.response?.data?.message || error.message || '未知错误'))
    }
  } finally {
    user.saving = false
  }
}

// 初始化数据
const initData = async () => {
  // 从localStorage获取当前用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  userForm.value = {
    username: userInfo.username || '',
    role: userInfo.role || 'user',
    permissions: userInfo.permissions || []
  }

  // 获取普通员工数据
  await fetchEmployees()
}

// 打开对话框
const open = () => {
  dialogVisible.value = true
  initData()
}

// 监听对话框关闭
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    // 重置所有状态
    searchKeyword.value = ''
    currentPage.value = 1
    users.value = []
  }
})

// 初始化时获取数据
onMounted(() => {
  fetchEmployees()
})

// 暴露方法给父组件
defineExpose({
  open
})

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 20px;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: var(--el-fill-color-light);
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

:deep(.el-table__header-wrapper) {
  overflow: hidden;
}
</style> 
