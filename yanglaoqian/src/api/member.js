import request from '../utils/request'

// 获取老人列表
export function getMembers(params) {
  return request({
    url: '/members',
    method: 'get',
    params
  })
}

// 获取单个老人信息
export function getMember(id) {
  return request({
    url: `/members/${id}`,
    method: 'get'
  })
}

// 创建老人信息
export function createMember(data) {
  return request({
    url: '/members',
    method: 'post',
    data
  })
}

// 更新老人信息
export function updateMember(id, data) {
  return request({
    url: `/members/${id}`,
    method: 'put',
    data
  })
}

// 删除老人信息
export function deleteMember(id) {
  return request({
    url: `/members/${id}`,
    method: 'delete'
  })
}

// 获取老人健康数据
export function getHealthData(params) {
  return request({
    url: '/health/monitor',
    method: 'get',
    params
  })
}

// 添加健康数据
export function addHealthData(data) {
  return request({
    url: '/health/monitor',
    method: 'post',
    data
  })
}

// 获取健康预警
export function getHealthAlerts(params) {
  return request({
    url: '/health/alerts',
    method: 'get',
    params
  })
}

// 更新预警状态
export function updateAlertStatus(id, data) {
  return request({
    url: `/health/alerts/${id}`,
    method: 'put',
    data
  })
} 