<!--
 * @Author: Leo
 * @Date: 2021-12-08 17:51:54
 * @LastEditors: Leo
 * @LastEditTime: 2022-01-14 09:58:37
 * @Description: 新建任务-bsr
-->
<template>
  <div class="page-container">
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
    >
      <el-form-item label="日期范围">
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
      areaList: [],
      form: {
        startDate: '',
        endDate: '',
        countryCodes: []
      },
      errorTips: '',
      loading: false
    }
  },
  mounted() {
    this.getCountrys()
  },
  methods: {
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
    },
    createTask() {
      this.loading = true
      this.errorTips = ''
      if(!this.form.startDate) {
        this.errorTips = '请选择任务开始时间'
        return
      }
      if(!this.form.endDate) {
        this.errorTips = '请选择任务结束时间'
        return
      }
      if(this.form.countryCodes.length < 1) {
        this.errorTips = '请勾选国家店铺'
        return
      }
      if(new Date(this.form.startDate).getTime() > new Date(this.form.endDate).getTime()) {
        this.errorTips = '开始时间不能为结束时间之后'
        return
      }
      const params = JSON.parse(JSON.stringify(this.form))
      params.taskType = 'bsrReport'
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
          this.$message.success(res.data.msg)
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
.error-tips {
  height: 14px;
  font-size: 12px;
  color: #c53929;
  margin: -12px 0 15px 10px;
}
</style>
