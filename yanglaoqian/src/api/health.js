import request from '../utils/request'

// 获取健康数据
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