/*
 * @Author: Leo
 * @Date: 2021-12-08 11:40:44
 * @LastEditors: Leo
 * @LastEditTime: 2022-02-09 16:54:06
 * @Description: file content
 */
import {taskDownload, startTask, reStartTask} from './common'
import {loadImageData, installContextMenu} from './tool'
// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  sendResponse('收到来自content-script的消息')

  const req = request
  if(req.taskList) { // popup操作下载
    // initTaskList(req.domain)
    reStartTask()
    return
  }

  if(req.token) { // 请求下载任务
    chrome.storage.local.set({
      "sessionToken": req.token, // 保存cookie到本地
      "domain": req.domain
    })
    taskDownload(req, sendResponse)
  }
})

setTimeout(() => {
  startTask()
}, 1000*60*5)

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, async () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [ // 只有打开亚马逊才显示pageAction
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            urlContains: 'sellercentral.amazon'
          }
        })
      ],
      actions: [
        new chrome.declarativeContent.ShowPageAction(),
          new chrome.declarativeContent.SetIcon({
            imageData: {
              16: await loadImageData('assets/icons/icon.png'),
              32: await loadImageData('assets/icons/icon.png'),
              64: await loadImageData('assets/icons/icon.png'),
              128: await loadImageData('assets/icons/icon.png')
            },
          }),
      ]
    }])
    installContextMenu()
  })
})
