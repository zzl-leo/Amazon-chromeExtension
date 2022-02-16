/*
 * @Author: Leo
 * @Date: 2022-01-04 10:52:15
 * @LastEditors: Leo
 * @LastEditTime: 2022-01-05 11:19:30
 * @Description: file content
 */
// eslint-disable-next-line import/named
import {generateReports} from './api'
import {taskHandleError, sendError} from './tool'

function CustomDateFormat(sDate) {
  const res = {}
  const splitDate = sDate.split('-')
  if(splitDate.length === 3) {
      res.year = Number(splitDate[0])
      res.month = Number(splitDate[1])
      res.date = Number(splitDate[2])
  } else {
      res.year =  Number(splitDate[0])
      res.month = Number(splitDate[1])
  }
  return res
}

/**
* payment报表请求参数处理
*/
const paymentParamsFormat = (params) => {
    params.reportType = params.reportType === "summaryReport" ? "Summary" : params.reportType
    if(params.reportType === 'transactionReport') {
        params.reportType = 'Transaction'
    }
    if(params.timeRangeType === 'Custom') {
        params.endDate = CustomDateFormat(params.endDate)
        params.startDate = CustomDateFormat(params.startDate)
    }
    if(params.timeRangeType === 'Month') {
        params.year = CustomDateFormat(params.month).year
        params.month = CustomDateFormat(params.month).month
        params.timeRangeType = 'Monthly'
        delete params.endDate
        delete params.startDate
    }
    // params.selectedAccountTypeDropdownValue = "All"
    return params
}

// eslint-disable-next-line import/prefer-default-export
export const paymentReports = async (params, domain, cb) => {
    const res = await generateReports(paymentParamsFormat(params), domain)

    if(res && res.status === 'SUCCESS') {
      // eslint-disable-next-line no-unused-expressions
      cb && cb()
    } else {
      taskHandleError(() => {
        sendError("亚马逊Payment生成任务接口ERROR")
      })
    }
}
