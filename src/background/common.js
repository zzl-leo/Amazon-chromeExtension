// eslint-disable-next-line import/named
import {getDocUrl, getAccountGlobals} from './api'
import {paymentReports} from './payments'
import {
  sleep,
  getFileResponse,
  uploadUrlFile,
  isFunction,
  notify,
  creatTab,
  sendError,
  taskHandleError,
  cancelToken
} from './tool'

/**
* 初始化任务列表-并开始下载
*/
export const initTaskList = async (sDomain) => {
    chrome.storage.local.set({"errorTips": ""})
    chrome.storage.local.get(['userData', 'stopDown'], async userData => {
      if(!userData.stopDown) {
        // eslint-disable-next-line no-undef
        fetch(`${baseUrl}reportPageTask/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8;',
            'Authorization': userData.userData.token
          }
        }).then(response => response.json()).then(res => {
          if(res.code === 0) {
            chrome.storage.local.set({
              "taskNum": res.data.length,
              "data": JSON.stringify(res.data),
            })
            if(res.data.length > 0) {
              if(sDomain) {
                  // eslint-disable-next-line no-use-before-define
                  loginInit(res.data[0], sDomain, () => {sendError("亚马逊接口请求异常，请查看（Bsr下载插件）");reStartTask()})
              } else {
                  chrome.storage.local.get(['domain'], t => {
                    if(t.domain) {
                      // eslint-disable-next-line no-use-before-define
                      loginInit(res.data[0], t.domain, () => {sendError("亚马逊接口请求异常，请查看（Bsr下载插件）");reStartTask()})
                    } else {
                      setTimeout(() => {
                          sendError('请切换至亚马逊页面初始化下载')
                          // eslint-disable-next-line no-use-before-define
                          reStartTask()
                      }, 6000)
                    }
                  })
              }
            } else {
              chrome.storage.local.set({
                "tasking": false, // 任务列表轮询结束
                "fileName": ""
              })
            }
          } else {
            sendError( `任务列表接口ERROR: ${res.msg}(亚马逊报表插件)`)
            // eslint-disable-next-line no-use-before-define
            reStartTask()
          }
        }).catch(err => {
          console.log(`任务列表获取失败${  err}`)
          cancelToken()
          sendError(`任务列表获取失败:${err}(亚马逊报表插件)`)
          // eslint-disable-next-line no-use-before-define
          reStartTask()
        })
      } else {
        sendError(`任务下载已暂停，请开启下载(亚马逊报表插件)`)
        // eslint-disable-next-line no-use-before-define
        reStartTask()
      }
    })
}

/**
* 尝试使用缓存下载
*/
export const downloadTaskHandleError = () => {
    chrome.storage.local.get(['sessionToken', 'domain'], t => {
      if(t.domain) {
        initTaskList(t.domain)
      } else {
        // eslint-disable-next-line no-use-before-define
        reStartTask()
        taskHandleError(() => {
          chrome.storage.local.set({"errorTips": "请切换至亚马逊页面操作(bsr报表插件)"})
        })
      }
    })
}

/**
* 任务下载
*/
export const taskDownload = (req, sendResponse) => {
    // eslint-disable-next-line no-unused-expressions
    sendResponse && sendResponse(`已收到：任务下载`)
    chrome.storage.local.get(['data'], async v => {
      if(v.data && JSON.parse(v.data).length > 0) {
        const request = JSON.parse(v.data)[0]
        let url2
        let fileName
        if(request.taskType === 'bsrReport') { // bsr下载
            const res = await getDocUrl({startDate: request.startDate, endDate: request.endDate}, req.token, req.domain)
            if(res && res.data && res.data.getReportDataDownload) {
              request.url = res.data.getReportDataDownload.url
              url2 = request.url ? request.url.replace(/\\/g, '/') : ''
            } else {
              sendError("亚马逊Bsr报表下载接口ERROR")
              // eslint-disable-next-line no-use-before-define
              reStartTask()
              return
            }
        } else if(request.taskType === 'transactionReport' || request.taskType === 'summaryReport') { // payment下载
            if(req && req.paymentMsg === 'success' && req.url) {
                request.url =  `https://${req.domain}${req.url}`
                url2 = request.url ? request.url.replace(/\\/g, '/') : ''
            } else {
              // eslint-disable-next-line no-use-before-define
              const param = new FormData()
              param.append('file', new Blob([]), fileName)
              param.append('taskId', request.id)
              param.append('taskStatus', '3')
              await uploadUrlFile(param)
              // eslint-disable-next-line no-use-before-define
              reStartTask()
              return
            }
        }
        fileName = `${request.taskType}_${request.countryCode}_${request.sellerId}_${request.id}_${request.startDate || ''}_${Date.parse(new Date())}.csv`
        chrome.storage.local.set({ "fileName": fileName })

        // 开始下载文件并且更换文件名称
        if(request.taskType === 'transactionReport') {
          fileName = `${request.taskType}_${request.countryCode}_${request.sellerId}_${request.id}_${(request.startDate || request.dateMonth)}_${Date.parse(new Date()) || ''}.csv`
        }
        if(request.taskType === 'summaryReport') {
          fileName = `${request.taskType}_${request.countryCode}_${request.sellerId}_${request.id}_${(request.startDate || request.dateMonth)}_${Date.parse(new Date()) || ''}.pdf`
        }
        chrome.downloads.download({
          url: url2,
          conflictAction: "overwrite",
          filename: fileName
        }, async id => {
          // 获取到文件url立即更新到后台
          // 根据url转base64上传后台
          const fileResponse = await getFileResponse(url2)

          // eslint-disable-next-line no-use-before-define
          waitDownload(id, fileName, url2, fileResponse, request, req)
        })
      }
    })
}

/**
* 递归等待下载任务完成
*/
export const waitDownload = (id, fileName, url2, fileResponse, request, req) => {
    chrome.downloads.search({id}, async data => {
      if(data[0].state === "complete") { // 下载完成
        if(fileResponse.ok) {
            fileResponse.blob().then(async blob => {
                const files = new window.File([blob], fileName, {
                    type: request.taskType === 'summaryReport' ? 'pdf' : 'csv'
                })
                const param = new FormData()
                param.append('file', files, fileName)
                param.append('taskId', request.id)
                param.append('taskStatus', '1')
                // 更新当前任务状态 - 发送请求
                const updateRes = await uploadUrlFile(param)

                if(updateRes.code === 0 && updateRes.msg === "OK") {
                    notify(`下载成功!`, `下载文件：${fileName}`)
                    setTimeout(() => {
                        chrome.storage.local.get(["domain"], v => {
                            if(v.domain) {
                                creatTab(`https://${v.domain || 'sellercentral.amazon.com'}/gp/homepage.html/ref=xx_home_logo_xx`, true, () => {
                                    sleep(1500)
                                    initTaskList()
                                }, 3500)
                            } else {
                                setTimeout(() => {
                                    sendError('请切换至亚马逊页面初始化下载')
                                }, 1000)
                            }
                        })
                    }, Math.random()*6000)
                } else {
                    sendError(`文件上传后台失败: ${updateRes.msg}(bsr报表插件)`)
                    // eslint-disable-next-line no-use-before-define
                    reStartTask()
                }
            })
        } else {
          // eslint-disable-next-line no-use-before-define
          reStartTask()
          taskHandleError(() => {
            chrome.storage.local.set({"errorTips": `url获取文件失败`})
          })
        }
        // 发送下载成功文件到已下载任务列表中
        chrome.storage.local.get(["fileList", "data"], getfl => {
          const fileNum = 100
          if (getfl.fileList) {
            // 文件列表展示不允许超过100个
            const arr = getfl.fileList.split(',')
            if (arr.length >= fileNum) {
              getfl.fileList = arr.slice(0, fileNum - 1).toString()
            }
            chrome.storage.local.set({
              "fileList": `${fileName},${getfl.fileList}`
            })
          } else {
            chrome.storage.local.set({
              "fileList": fileName
            })
          }
        })
      } else if(data[0].state === "in_progress") {
        setTimeout(() => {
          waitDownload(id, fileName, url2, fileResponse, request, req)
        }, 1500)
      } else {
        // eslint-disable-next-line no-use-before-define
        reStartTask()
        taskHandleError(() => {
          chrome.storage.local.set({"errorTips": `文件本地下载出错`})
        })
      }
    })
}


/**
* 插件登录-获取账号地区列表信息
*/
export const loginInit = async (params, domain, errCb) => {
    const areas = await getAccountGlobals(domain, errCb) || []
    if(areas && areas.length > 0) {
      areas.forEach(item => {
        if(item.marketplaceId === params.marketplaceId) {
            if(params.taskType === 'transactionReport' || params.taskType === 'summaryReport') {
              const url = `https://${domain}/home?mons_sel_dir_mcid=${item.directedId}&mons_sel_mkid=${item.marketplaceId}`
              creatTab(url, true, () => { // 国家地区切换 - cookie更新后操作
                sleep(1500)
                const purl = `https://${domain}/payments/reports/custom/request?ref_=xx_report_ttab_dash&tbla_daterangereportstable=sort:{"sortOrder":"DESCENDING"};search:undefined;pagination:1;`

                paymentReports({
                  reportType: params.taskType,
                  timeRangeType: params.timeRangeType,
                  endDate: params.endDate,
                  startDate: params.startDate,
                  month: params.dateMonth
                }, domain, () => {
                  creatTab(purl, true, () => { // 国家地区切换后-请求生成报表 - payment任务报表url获取
                    sleep(1500)
                    // eslint-disable-next-line no-use-before-define
                    sendTabMsg({
                      token: 'cookieToken',
                      type: params.taskType
                    }, null, downloadTaskHandleError)
                  }, 15000)
                })
              }, 3500)
            } else {
                const url = `https://${domain}/home?mons_sel_dir_mcid=${item.directedId}&mons_sel_mkid=${item.marketplaceId}`
                creatTab(url, true, () => { // 国家地区切换 - cookie更新后操作
                    sleep(1500)
                    // eslint-disable-next-line no-use-before-define
                    sendTabMsg({
                      token: 'cookieToken',
                      type: params.taskType
                    }, null, downloadTaskHandleError)
                })
            }
        }
      })
    } else {
      sendError("亚马逊获取国家地区接口ERROR")
      // eslint-disable-next-line no-use-before-define
      reStartTask()
    }
}

/**
* 向content传递消息
* @param msg：消息主体
* @param cb：成功回调
*/
export const sendTabMsg = (message, cb) => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      if(tabs && tabs[0]) { // 是否在亚马逊报表页面操作
          if(tabs[0].pendingUrl || tabs[0].url) {
              const zurl = tabs[0].pendingUrl || tabs[0].url
             if( zurl.indexOf('sellercentral.amazon') !== -1) {
                  chrome.tabs.sendMessage(tabs[0].id, message, resp => {
                      // eslint-disable-next-line no-unused-expressions
                      isFunction(cb) && cb(resp)
                  })
             } else {
                  downloadTaskHandleError()
             }
          }
      } else {
          downloadTaskHandleError()
      }
  })
}





/**
* 任务定时轮询
*/
let timerId = 1 // 模拟计时器id，唯一性
let timerObj = {} // 计时器存储器

// 轮询开始
export const startTask = () => {
  // eslint-disable-next-line no-plusplus
  const id = timerId++
  timerObj[id] = true
  async function timerFn () {
    if (!timerObj[id]) return
    sleep(1500)
    chrome.storage.local.get(['domain'], async v => {
      creatTab(`https://${v.domain || 'sellercentral.amazon.com'}/gp/homepage.html/ref=xx_home_logo_xx`, true, () => {
        sleep(1500)
        initTaskList(null)
      })
    })

    setTimeout(timerFn, 1000 * 60 * 15)
  }
  setTimeout(timerFn, 1000 * 10)
}

// 暂停轮询
export const stopTask = () => {
  timerObj = {}
}

// 重新开始轮询
export const reStartTask = () => {
  timerObj = {}
  startTask()
}
