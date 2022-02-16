/*
 * @Author: Leo
 * @Date: 2021-12-08 15:51:52
 * @LastEditors: Leo
 * @LastEditTime: 2022-01-04 11:00:46
 * @Description: axios - 请求
 */
import axios from 'axios'
import router from '../router'
import bus from "./bus"
import tool from './tool'

let token = null
bus.$on('userData', v => {
  if(v) {
    // eslint-disable-next-line no-unused-vars
    token = v.token
  }
})
// 请求拦截器
axios.interceptors.request.use(config => { // 让每个请求携带token
  // eslint-disable-next-line no-param-reassign
  config.headers.Authorization = token
  return config
}, error => {
  return Promise.reject(error)
})


// 响应拦截器
axios.interceptors.response.use(response => {
  // 登录失效
  if(response.data.code !== 0 && response.data.msg === '登录超时，请重新登录') {
    tool.logOut()
    router.replace('/login')
  }
  return response;
}, error => {
  return Promise.reject(error)
})
// eslint-disable-next-line no-undef
axios.defaults.baseURL = baseUrl
export default axios
