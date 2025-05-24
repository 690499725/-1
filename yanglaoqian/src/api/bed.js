import request from '../utils/request'

// 获取床位列表
export function getBeds(params) {
  return request({
    url: '/beds',
    method: 'get',
    params
  })
}

// 获取床位统计
export function getBedStatistics() {
  return request({
    url: '/beds/statistics',
    method: 'get'
  })
}

// 获取单个床位详情
export function getBedDetail(id) {
  return request({
    url: `/beds/${id}`,
    method: 'get'
  })
}

// 创建床位
export function createBed(data) {
  return request({
    url: '/beds',
    method: 'post',
    data
  })
}

// 更新床位
export function updateBed(id, data) {
  return request({
    url: `/beds/${id}`,
    method: 'put',
    data
  })
}

// 分配床位
export function assignBed(data) {
  return request({
    url: '/beds/assign',
    method: 'post',
    data
  })
}

// 取消床位分配
export function unassignBed(bedId) {
  return request({
    url: `/beds/${bedId}/unassign`,
    method: 'post'
  })
}

// 删除床位
export function deleteBed(id) {
  return request({
    url: `/beds/${id}`,
    method: 'delete'
  })
} 