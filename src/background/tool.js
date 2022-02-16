/*
 * @Author: Leo
 * @Date: 2021-12-23 14:19:35
 * @LastEditors: Leo
 * @LastEditTime: 2022-02-09 15:04:08
 * @Description: background-全局方法类
 */

/**
* 休眠等待
*/
export const sleep = (delay) => {
  const start = (new Date()).getTime()
  while ((new Date()).getTime() - start < delay) {
    // eslint-disable-next-line no-continue
    continue
  }
}

/**
* 函数类判断
*/
export const isFunction = obj => {
  return typeof obj === "function"
}

/**
* 下载任务出错处理
*/
export const taskHandleError = (cb) => {
  chrome.storage.local.set({
    "taskNum": 0,
    "fileName": "",
    "data": JSON.stringify([]),
    "tasking": false
  })
  
  // eslint-disable-next-line no-unused-expressions
  isFunction(cb) && cb()
}

/**
* 根据url获取响应内容
*/
export const getFileResponse = url => {
  return fetch(url).then(response => {
    return response
  })
}

/**
* 将下载文件上传到后台
*/
export const uploadUrlFile = (params) => {
  // eslint-disable-next-line no-undef
  return fetch(`${baseUrl}reportPageTask/update`, {
    method: 'POST',
    "body": params
  }).then(response => response.json()).then(json => json)
}

/**
* 桌面右下角信息提示 15S后消失
* @param title
* @param msg
*/
export const notify = (title='下载成功!', msg) => {
  const options = {
      type: 'basic',
      iconUrl: 'assets/icons/icon.png',
      title,
      message: msg
  }
  const notifyCb = notificationId => {
      setTimeout(() => {
          chrome.notifications.clear(notificationId)
      }, 15 * 1000)
  }
  chrome.notifications.create(null, options, notifyCb)
}

/**
* 打开新tab页，最迟5分钟后自动关闭
* 因为有的报表是需要插入代码到网页中运行的，所以不能直接关闭，调用方应在 回调函数中关闭 tab
* 否则为了避免太多tab打开导致电脑卡死，最迟5分钟后也会关闭该tab页
* @param url
* @param autoClose true 16秒后自动关闭
* @param cb 回调
*/
export const creatTab = (url, autoClose, cb, tmun = 15000) => {
  chrome.tabs.create({url}, tab => {
      // eslint-disable-next-line no-unused-expressions
      autoClose && setTimeout(tab => {
          chrome.tabs.remove([tab.id], () => {})
      }, tmun, tab)
      // 避免出现 tab 页打开太多未关闭的情况，最迟5分钟就关闭
      setTimeout(tab => {
           chrome.tabs.remove([tab.id], () => {})
      }, 1000 * 60 * 5, tab)
      // eslint-disable-next-line no-unused-expressions
      isFunction(cb) && cb(tab)
  });
}

/**
* 错误信息发送(钉钉信息提示)-并初始化任务列表
*/
export const sendError = (text) => {
  chrome.storage.local.get(['userData'], async v => {
    if(v.userData) {
      // eslint-disable-next-line no-undef
      fetch(`${baseUrl}reportUser/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8;'
        },
        "body": JSON.stringify({notifyContent: text, dingUserId: v.userData.dingUserId || ''})
      }).then(response => response.json()).then(() => {})

      taskHandleError(() => {
        chrome.storage.local.set({"errorTips": text})
        notify("错误", text)
      })
    }
  })
}

/**
* 检测是否有正在下载的文件
*/
export const hasDownloading = (cb) => {
  chrome.downloads.search({}, results => {
    const flag = results.some(result => {
      return result.state === 'in_progress'
    })
    if(!flag) { // 无下载任务执行回调
      // eslint-disable-next-line no-unused-expressions
      isFunction(cb) && cb()
    }
  })
}


/**
* 判断当前时间是否在固定时间段
* 默认凌晨0点-5点
*/
export const handleTime = (start = 0, end = 5) => {
  const hours = new Date().getHours() // 当前小时
  const minutes = new Date().getMinutes() // 当前分钟
  if (Number(hours) === start || Number(hours) === end) {
    if (Number(hours) === start && Number(minutes) > -1 && Number(minutes) < 60) {
      return true
    } if (Number(hours) === end && Number(minutes) > -1 && Number(minutes) < 60) {
      return true
    }
      return false
  }
    return false
}


/**
* 暂停任务
* false 启动     true 暂停
*/
const stopTask = () => {
  chrome.storage.local.set({ "stopDown": true })
  notify("提示", "已暂停任务下载")
}


/**
* 启动任务
*/
const restartTask = () => {
  chrome.storage.local.set({ "stopDown": false })
  notify("提示", "已启动任务下载")
}


/**
* 自定义菜单更新名称
*/
const updateMenus = (id) => {
  chrome.storage.local.get(['stopDown'], async v => {
    chrome.contextMenus.update(id, {
      title: v.stopDown ? '开启插件后台下载' : '暂停插件任务下载'
    })
  })
}


/**
* 图片icon生成
*/
export const loadImageData = (url) => {
  return new Promise(resolve => {
    const canvas = document.body.appendChild(document.createElement('canvas'));
    const context = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      context.drawImage(img, 0, 0);
      const data = context.getImageData(0, 0, img.width, img.height);
      canvas.remove();
      resolve(data);
    };
    img.src = url;
  });
}

/**
* 左键菜单 - 操作项
*/
export const installContextMenu = async () => {
  chrome.contextMenus.create({
    type: 'normal',
    title: '暂停插件任务下载',
    id: 'menuDemo',
    contexts: ['all'],
    documentUrlPatterns: [
      'https://*.sellercentral.amazon.co.uk/*',
      'https://*.sellercentral.amazon.com/*',
      'https://*.sellercentral.amazon.de/*',
      'https://*.sellercentral.amazon.fr/*',
      'https://*.sellercentral.amazon.pl/*',
      'https://*.sellercentral.amazon.it/*',
      'https://*.sellercentral.amazon.es/*',
      'https://*.sellercentral.amazon.nl/*',
      'https://*.sellercentral.amazon.ca/*',
      'https://*.sellercentral.amazon.sg/*',
      'https://*.sellercentral.amazon.com.br/*',
      'https://*.sellercentral.amazon.com.mx/*',
      'https://*.sellercentral.amazon.com.au/*',
      'https://*.sellercentral-japan.amazon.com/*'
    ],
    onclick: () => {
      chrome.storage.local.get(['stopDown'], async v => {
        if(v.stopDown) {
          restartTask()
        } else {
          stopTask()
        }

        setTimeout(() => {
          updateMenus('menuDemo')
        }, 1000);
      })
    }
  })
}

/**
* 登录失效操作
*/
export const cancelToken = () => {
  chrome.runtime.sendMessage({
    msg: "token_cancel",
    data: {
        logout: true
    }
  })
}
