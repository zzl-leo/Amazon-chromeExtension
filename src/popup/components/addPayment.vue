<!--
 * @Author: Leo
 * @Date: 2021-12-08 17:51:54
 * @LastEditors: Leo
 * @LastEditTime: 2022-01-14 09:57:56
 * @Description: 新建任务-bsr
-->
<template>
  <div class="page-container">
    <el-form
      ref="form"
      :model="form"
      label-width="90px"
    >
      <el-form-item label="Report type">
        <el-radio-group v-model="form.taskType">
          <el-radio label="summaryReport">
            Summary
          </el-radio>
          <el-radio label="transactionReport">
            Transaction
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="国家店铺">
        <el-checkbox-group v-model="form.countryCodes">
          <el-checkbox
            v-for="item in areaList"
            :key="item.countryCode"
            :label="item.countryCode"
            name="type"
          />
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="Time Type">
        <el-radio-group v-model="form.timeRangeType">
          <el-radio label="Month">
            Month
          </el-radio>
          <el-radio label="Custom">
            Custom
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <div
        v-if="form.timeRangeType === 'Month'"
        class="form-item-box"
      >
        <el-date-picker
          v-model="form.yearMonth"
          type="month"
          size="mini"
          value-format="yyyy-MM"
          placeholder="选择月"
        />
      </div>

      <div
        v-if="form.timeRangeType === 'Custom'"
        class="form-item-box"
      >
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="开始时间"
          style="width: 47%;"
          size="mini"
          value-format="yyyy-MM-dd"
        />
        <span style="color: #999;">-</span>
        <el-date-picker
          v-model="form.endDate"
          type="date"
          placeholder="结束时间"
          style="width: 47%;"
          size="mini"
          value-format="yyyy-MM-dd"
        />
      </div>

      <div class="error-tips">
        {{ errorTips }}
      </div>
      <div style="text-align: center;">
        <el-button
          type="primary"
          :loading="loading"
          @click="createTask"
        >
          生成任务
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      form: {
        taskType: 'summaryReport',
        timeRangeType: 'Custom',
        startDate: '',
        endDate: '',
        yearMonth: '2021-08',
        countryCodes: []
      },
      errorTips: '',
      loading: false,
      areaList: []
    }
  },
  mounted() {
    this.getCountrys()
  },
  methods: {
    createTask() {
      this.loading = true
      this.errorTips = ''
      const params = {}
      if(this.form.timeRangeType === 'Custom') {
        if(!this.form.startDate) {
            this.errorTips = '请选择任务开始时间'
            return
        }
        if(!this.form.endDate) {
            this.errorTips = '请选择任务结束时间'
            return
        }
        if(new Date(this.form.startDate).getTime() > new Date(this.form.endDate).getTime()) {
            this.errorTips = '开始时间不能为结束时间之后'
            return
        }
        params.startDate = this.form.startDate
        params.endDate = this.form.endDate
        params.timeRangeType = this.form.timeRangeType
      }
      if(this.form.timeRangeType === 'Month') {
        if(!this.form.yearMonth) {
            this.errorTips = '请选择月份'
            return
        }
        params.yearMonth = this.form.yearMonth
        params.timeRangeType = this.form.timeRangeType
      }
      if(this.form.countryCodes.length < 1) {
        this.errorTips = '请勾选国家店铺'
        return
      }

      params.taskType = this.form.taskType
      params.countryCodes = this.form.countryCodes
      this.$http({
        method: 'post',
        url: '/reportPageTask/create',
        data: params
      }).then(res => {
        if(res.data.code === 0) {
          // chrome.storage.local.get(['tasking'], v => {
          //   if(!v.tasking) {
          //     chrome.storage.local.set({
          //       "tasking": true // 任务列表轮询中
          //     })
          //     setTimeout(() => {
          //       chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          //         chrome.tabs.sendMessage(tabs[0].id, {taskList: true}, () => {})
          //       })
          //     }, 800)
          //   }
          // })
          this.$message.success('任务创建成功')
          setTimeout(() => {
            this.$router.push('/taskList?type=1')
          }, 1000)
        } else {
          this.errorTips = res.data.msg
          this.$message.error(res.data.msg)
        }
      })
    },
    getCountrys() {
      this.$http({
        method: 'post',
        url: '/reportUserConfig/list'
      }).then(res => {
        if(res.data.code === 0) {
          this.areaList = res.data.data
        } else {
          this.errorTips = res.data.msg || '初始化国家店铺出错'
        }
      })
    }
  }
}
</script>
<style scoped>
.page-container {
  padding: 0 20px 0 0;
  margin-top: 60px;
}
.page-container /deep/ .el-date-editor--daterange.el-input__inner {
  max-width: 240px;
}
.page-container /deep/ .el-date-editor .el-input__inner {
  padding-left: 20px;
}
.page-container /deep/ .el-date-editor .el-input__prefix {
  display: none;
}
.page-container /deep/  .el-form-item {
  margin-bottom: 8px;
}
.form-item-box {
    padding-left: 10px;
    margin-bottom: 8px;
}
.error-tips {
  height: 14px;
  font-size: 12px;
  color: #c53929;
  margin: 5px 0 15px 10px;
}
</style>
