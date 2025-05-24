import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      id: null,
      username: '',
      role: 'normal', // 默认角色为普通用户
      // 其他用户信息字段
    }
  }),

  getters: {
    // 判断是否为管理员
    isAdmin: (state) => state.userInfo?.role === 'admin',
    
    // 获取用户角色
    userRole: (state) => state.userInfo?.role || 'normal'
  },

  actions: {
    // 设置用户信息
    setUserInfo(info) {
      this.userInfo = {
        ...this.userInfo,
        ...info
      }
    },

    // 清除用户信息
    clearUserInfo() {
      this.userInfo = {
        id: null,
        username: '',
        role: 'normal'
      }
    },

    // 更新用户角色
    updateRole(role) {
      if (this.userInfo) {
        this.userInfo.role = role
      }
    }
  }
}) 