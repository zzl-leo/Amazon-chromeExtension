/**
* bsr下载
*/
export async function getDocUrl(params, token = '', domain = 'sellercentral.amazon.com') {
  const qq = `
    query reportDataDownloadQuery($input: GetReportDataInput) {
      getReportDataDownload(input: $input) {
        url
      }
    }
    `
  const variables = {
    "input": {
      "legacyReportId": "102:DetailSalesTrafficBySKU",
      "startDate": params.startDate,
      "endDate": params.endDate,
      "userSelectedRows": [],
      "selectedColumns": [
        "SC_MA_ParentASIN_25990",
        "SC_MA_ChildASIN_25991",
        "sc_mat-ss_colDef_title",
        "SC_MA_SKU_25959",
        "SC_MA_Sessions_25920",
        "SC_MA_SessionPercentage_25960",
        "SC_MA_PageViews_25955",
        "SC_MA_PageViewsPercentage_25961",
        "SC_MA_BuyBoxPercentage_25956",
        "SC_MA_UnitsOrdered_40590",
        "SCA_BR_UnitsOrdered_BB",
        "SC_MA_UnitSessionPercentage_25957",
        "SCA_BR_UnitSessionPercentage_BB"
      ]
    }
  }

  const res = await fetch(`https://${domain}/business-reports/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/graphql',
      "Access-Control-Origin": "*",
      "cookie": token ? token : "session-token=68VvN/2oXbBiNoK9we6VqACFIFpOaolQKHb6hL3SRqJz4P5c09F5SxMrNMlVVdHW5skIMpPyV38bPfoQ0s1LT3/nUMnoFL+H7LirZDmQclxuyAGK7fiFcUJ78FfXJsDXGUdLVAMMFS+p0mzFgDgO50zGlIMX0OcccOh1gvGLzEJAN24oe972kTdegsDRx+J7UbEMIDLYwbevXcLbvsXtyCOl1nX7RzPm5CFO+MaYWUU="
    },
    body: JSON.stringify({
      query: qq,
      variables,
      operationName: "reportDataDownloadQuery"
    })
  }).then(response => response.json()).then(json => json)
  return res
}

export async function generateReports(params, domain) { // 生成payments报表
  const res = await fetch(`https://${domain}/payments/reports/custom/submit/generateReports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...params })
  }).then(response => response.json()).then(json => json)

  return res
}

/**
* 获取亚马逊登录账号的信息
*/
export async function getAccounts(domain) {
  const res = await fetch(`https://${domain}/global-picker/data/get-partner-accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      delegationContext: "",
      pageSize: 10
    })
  }).then(response => response.json()).then(json => json)
  return res
}

/**
* 获取亚马逊登录账号下国家地区列表
*/
export async function getGlobals(id, domain = 'sellercentral.amazon.com') {
  const res = await fetch(`https://${domain}/global-picker/data/get-merchant-marketplaces-for-partner-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      delegationContext: "",
      partnerAccountId: id
    })
  }).then(response => response.json()).then(json => json)
  return res
}

/**
* 获取亚马逊登录账号的国家地区列表
*/
export const getAccountGlobals = async (domain = 'sellercentral.amazon.com', errCb) => {
  const account = await getAccounts(domain)
  if (account.partnerAccounts && account.partnerAccounts.length > 0) {
    let promiseAll = []
    account.partnerAccounts.forEach(item => {
      promiseAll.push(getGlobals(item.id, domain))
    })
    return Promise.all(promiseAll).then(res => {
      let areas = []
      res.forEach(resItem => {
        if (resItem.merchantMarketplaces && resItem.merchantMarketplaces.length > 0) {
          areas = areas.concat(resItem.merchantMarketplaces)
        }
      })
      promiseAll = null
      return areas
    }).catch(() => {
      errCb && errCb()
    })
  } else {
    errCb && errCb()
  }
}
