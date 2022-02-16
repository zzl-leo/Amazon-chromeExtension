/*
 * @Author: Leo
 * @Date: 2021-12-31 15:30:39
 * @LastEditors: Leo
 * @LastEditTime: 2021-12-31 18:19:32
 * @Description: tool
 */
export default {
  // 获取插件缓存
  getLocal: (key, callback) => {
    chrome.storage.local.get([key], result => {
      if (result[key]) {
        // eslint-disable-next-line no-unused-expressions
        callback && callback()
      }
    })
  },
  // 设置插件缓存
  setLocal: (params) => {
    chrome.storage.local.set(params)
  },

  // 登录退出 - 登录信息等重置
  logOut: () => {
    chrome.storage.local.set({
      "userData": {}, // 登录信息清空
      "taskNum": 0,
      "fileName": "",
      "data": JSON.stringify([]),
      "tasking": false
    })
  },

  // 下载任务出错处理
  taskHandleError: () => {
    chrome.storage.local.set({
      "taskNum": 0,
      "fileName": "",
      "data": JSON.stringify([]),
      "tasking": false
    })
  }
}
