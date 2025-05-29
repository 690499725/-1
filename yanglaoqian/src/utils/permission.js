import { ElMessage } from 'element-plus'

// 获取用户权限
export const getUserPermissions = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return Array.isArray(userInfo.permissions) 
    ? userInfo.permissions 
    : (typeof userInfo.permissions === 'string' ? JSON.parse(userInfo.permissions) : [])
}

// 检查是否为管理员
export const isAdmin = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.role === 'admin'
}

// 检查是否有指定权限
export const hasPermission = (permission) => {
  if (isAdmin()) return true
  const permissions = getUserPermissions()
  
  // 如果permission是数组，检查是否包含任意一个权限
  if (Array.isArray(permission)) {
    return permission.some(p => permissions.includes(p))
  }
  
  // 如果permission是字符串，直接检查
  return permissions.includes(permission)
}

// 检查是否有多个权限中的任意一个
export const hasAnyPermission = (permissions) => {
  if (isAdmin()) return true
  const userPermissions = getUserPermissions()
  return permissions.some(permission => userPermissions.includes(permission))
}

// 检查是否同时拥有多个权限
export const hasAllPermissions = (permissions) => {
  if (isAdmin()) return true
  const userPermissions = getUserPermissions()
  return permissions.every(permission => userPermissions.includes(permission))
}

// 权限检查失败处理
export const handlePermissionDenied = () => {
  ElMessage.error('您没有执行此操作的权限')
  return false
} 