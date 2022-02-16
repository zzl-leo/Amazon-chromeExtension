/*
 * @Author: Leo
 * @Date: 2022-02-09 11:35:56
 * @LastEditors: Leo
 * @LastEditTime: 2022-02-09 14:40:17
 * @Description: file content
 */
import {initTaskList} from './common'
import {sleep, creatTab} from './tool'

// setInterval(() => { // 任务轮询 30min/次
//   console.log('任务轮询')
//   // if(handleTime(5, 23)) { // 每日固定时间段执行:上午7点-9点
//     chrome.storage.local.get(['tasking', 'domain'], async v => {
//       console.log(v.tasking)
//       if(v.tasking === false) {
//         creatTab(`https://${v.domain || 'sellercentral.amazon.com'}/gp/homepage.html/ref=xx_home_logo_xx`, true, () => {
//             sleep(1500)
//             initTaskList(null)
//         })
//       }
//     })
//   // }
// }, 1000 * 60 * 15)


let timerId = 1 // 模拟计时器id，唯一性
let timerObj = {} // 计时器存储器

// 轮询开始
export const startTask = () => {
  // eslint-disable-next-line no-plusplus
  const id = timerId++
  timerObj[id] = true
  async function timerFn () {
    console.log(timerObj)
    if (!timerObj[id]) return

    chrome.storage.local.get(['domain'], async v => {
      creatTab(`https://${v.domain || 'sellercentral.amazon.com'}/gp/homepage.html/ref=xx_home_logo_xx`, true, () => {
        sleep(1500)
        initTaskList(null)
      })
    })

    setTimeout(timerFn, 1000 * 60 * 15)
  }
  timerFn()
}

// 暂停轮询
export const stopTask = () => {
  timerObj = {}
}

// 重新开始轮询
export const reStartTask = () => {
  timerObj = {}
  setTimeout(() => {
    startTask()
  }, 1500)
}
