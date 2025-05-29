import request from '../utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function register(data) {
  console.log(data)
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
} 