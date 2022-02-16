/*
 * @Author: Leo
 * @Date: 2021-12-08 11:40:44
 * @LastEditors: Leo
 * @LastEditTime: 2022-02-09 16:22:59
 * @Description: file content
 */
import Cookies from 'js-cookie'
function getToken() {
  return Cookies.get('session-token')
}

// 判断是否登录并返回  ---  session-token 是否存在
function isLogin() {
  if(getToken()) { return getToken() }
  if(window.location.href.indexOf('/signin') !== -1) { return '' }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { // 接收background，popup发送过来的数据
  console.log(`popup发送过来的数据：${getToken()}`)
  sendResponse("content接收到background/popup数据")
  console.log(request)
  console.log('-----------------  13711112221')

  if(request.taskList) { // 登录创建任务初始化
    chrome.storage.local.set({"domain": document.domain})
    chrome.runtime.sendMessage({ taskList: true,  domain: document.domain}, response => {
      console.log('收到来自后台的回复：' + response)
    });
  }
  if(request.token === 'cookieToken') { // 将cookietoken发送到background
    if(isLogin()) {
      if(request.type === 'transactionReport' || request.type === 'summaryReport') {
        const nowTime =  Date.parse(new Date())
        getPaymentDom({token: `session-token=${isLogin()}`, domain: document.domain, nowTime})
      } else if(request.type === 'bsrReport') {
        chrome.runtime.sendMessage({token: `session-token=${isLogin()}`, domain: document.domain}, response => {
          console.log('收到来自后台的回复-qq：' + response)
        })
      }
    } else { // 未登录 -错误提示 summaryReport
      chrome.storage.local.set({"errorTips": "亚马逊账号未登录或者切换至亚马逊Bsr报表页面操作"})
      chrome.runtime.sendMessage({}, () => {
        console.log('收到来自后台的回复：未登录')
      })
    }
  }
})

function getPaymentDom(params) { // payment 报表下载url
  setTimeout(() => {
    const btnDom = document.getElementById('0-ddrAction')
    if(btnDom && btnDom.querySelector("#downloadButton")) { // 报表已经生成
      if(btnDom.querySelector("#downloadButton").querySelector(".a-button-text")) {
        const target = btnDom.querySelector("#downloadButton").querySelector(".a-button-text").getAttribute('href')
        chrome.runtime.sendMessage({...params, url: target, paymentMsg: 'success'}, response => {
          console.log('收到来自后台的回复：1' + response)
        });
      }
      return
    }
    // cancel-report - 任务暂时未生成
    if(btnDom && btnDom.querySelector(".cancel-report")) {
      // chrome.storage.local.set({
      //   "taskNum": 0,
      //   "fileName": "",
      //   "data": JSON.stringify([]),
      //   "tasking": false
      // })
      chrome.runtime.sendMessage({...params, paymentMsg: 'success', taskStatus: 3}, response => {
        console.log('收到来自后台的回复：1' + response)
      });
      return
    }

    let reClicks = [".request-report", ".drrRefreshTable"]
    reClicks.forEach(item => {
      if(btnDom && btnDom.querySelector(item)) { // 报表需要刷新获取[request/refresh]
        const refBtn = btnDom.querySelector(item)
        refBtn.click()
        if( Date.parse(new Date()) - params.nowTime > 1000 * 7) {
          chrome.runtime.sendMessage({...params, paymentMsg: 'success', taskStatus: 3}, response => {
            console.log('收到来自后台的回复：1' + response)
          });
        } else {
          setTimeout(() => {
            getPaymentDom(params)
          }, 80)
        }
      }
    })
  }, 2000)
}
