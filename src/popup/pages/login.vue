<!--
 * @Author: Leo
 * @Date: 2021-12-08 17:05:47
 * @LastEditors: Leo
 * @LastEditTime: 2022-01-25 11:40:26
 * @Description: 用户登录
-->
<template>
  <div class="content">
    <div class="header">
      <img
        class="icon"
        src="https://cdn.shopifycdn.net/s/files/1/0087/8313/4835/files/icon_fbf5215e-d205-45c8-89e8-71bc8795dbad.png?v=1638936213"
        alt="icon"
      >
      <div class="header-title">
        亚马逊报表自动化下载管理器
      </div>
    </div>
    <div class="login-form">
      <el-input
        v-model="form.phone"
        placeholder="账号"
        class="form-phone"
      />
      <el-input
        v-model="form.password"
        type="password"
        placeholder="密码"
      />
      <div class="flex-center">
        <el-button
          type="primary"
          class="login-btn"
          :loading="loading"
          @click="login"
        >
          登录
        </el-button>
      </div>
      <div class="error-tips">
        {{ errorTips }}
      </div>
    </div>
  </div>
</template>

<script>
import md5 from 'md5'
import bus from '../utils/bus'

export default {
  data() {
    return {
      msg: 'Welcome!',
      form: {
        phone: '13760279085',
        password: '123456'
      },
      errorTips: '',
      loading: false
    }
  },
  methods: {
    login() {
      if(!this.form.phone) {
        this.errorTips = '请输入账号！'
        return
      }
      if(!this.form.password) {
        this.errorTips = '请输入密码！'
        return
      }
      this.loading = true
      this.errorTips = ''
      this.$http({
        method: 'post',
        url: '/reportUser/login',
        data: {phone: this.form.phone, password: md5(this.form.password).toUpperCase()}
      }).then(res => {
        if(res.data.code === 0) {
          chrome.storage.local.set({"userData": res.data.data})
          bus.$emit('userData', res.data.data)
          setTimeout(() => {
            this.$router.push('/taskList?type=1')
          }, 1200)


          this.$http({
            method: 'post',
            url: '/reportPageTask/list'
          // eslint-disable-next-line no-shadow
          }).then(res => {
            if(res.data.code === 0) {
              const taskList = JSON.parse(JSON.stringify(res.data.data)) || []

              chrome.storage.local.set({
                "data": JSON.stringify(taskList),
                "taskNum": taskList.length,
                "tasking": true // 任务列表轮询中
              })
              setTimeout(() => {
                chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                  chrome.tabs.sendMessage(tabs[0].id, {taskList: true}, () => {})
                })
              }, 1000)
            }
          })
        } else {
          this.errorTips = res.data.msg
          this.$message.error(res.data.msg)
        }
        this.loading = false
      })
    }
  }
}
</script>
<style scoped>
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}
.header .icon {
  height: 60px;
  width: 60px;
}
.header-title {
  font-size: 14px;
  font-weight: bold;
  color: #000;
}
.login-form {
  margin: 10px 0;
  padding: 0 20px;
}
.form-phone {
  margin-bottom: 10px;
}
.flex-center {
  display: flex;
  justify-content: center;
}
.login-btn {
  width: 100%;
  margin-top: 10px;
}
.error-tips {
  height: 14px;
  font-size: 12px;
  color: #c53929;
}
</style>
