<!--
 * @Author: Leo
 * @Date: 2021-12-08 11:40:44
 * @LastEditors: Leo
 * @LastEditTime: 2022-01-21 11:08:08
 * @Description: file content
-->
<template>
  <div
    id="app"
    class="pop-container"
  >
    <div
      v-if="$route.name !== 'login'"
      class="pop-header"
    >
      <span>亚马逊报表自动化下载管理器</span>
      <div class="user-logout">
        <span class="user">用户：{{ user.phone }}</span>
        <span
          class="logout"
          @click="logout"
        >退出</span>
      </div>
    </div>
    <router-view class="page-view" />

    <div
      v-if="$route.name !== 'login' && $route.name !== 'listDetail'"
      class="footer-main"
    >
      <el-tabs
        tab-position="bottom"
        @tab-click="toggleTab"
      >
        <el-tab-pane label="任务列表" />
        <el-tab-pane label="生成任务" />
      </el-tabs>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {}
    }
  },
  mounted() {
    this.getUser()
    chrome.runtime.onMessage.addListener((request) => {
      if (request.msg === "token_cancel") {
        this.logout()
      }
    })
  },
  methods: {
    toggleTab(tab) {
      if(tab.label === '任务列表') {
        this.$router.push('/taskList')
        return
      }
      if(tab.label === '生成任务') {
        this.$router.push('/addTask')
      }
    },
    logout() {
      chrome.storage.local.get(['userData'], async v => {
        if(v.userData) {
          // eslint-disable-next-line no-undef
          fetch(`${baseUrl}reportUser/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8;',
              'Authorization': v.userData.token
            }
          }).then(response => response.json()).then(res => {
            if(res.code === 0) {
              this.$tool.logOut()
              this.$router.push('/login')
            } else {
              this.$message.error('退出登录失败')
            }
          })
        }
      })
    },
    getUser() {
      chrome.storage.local.get(['userData'], v => {
        if(v && v.userData) {
          this.user = v.userData
        } else {
          setTimeout(() => {
            this.getUser()
          }, 1500)
        }
      })
    }
  }
}
</script>

<style scoped>
@import url('../assets/css/normalize.css');
.pop-container {
  width: 380px;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.page-view {
  flex: 1;
}

.pop-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  font-size: 13px;
  color: #000;
  font-weight: bold;
  margin-bottom: 10px;
}
.footer-main {
  border-top: solid 1px #eaeefb;
  /* margin-top: -20px; */
}
.footer-main /deep/ .el-tabs {
  height: 30px;
}
.footer-main /deep/ .el-tabs__header {
  margin-top: 0;
}
.footer-main /deep/ .el-tabs__nav-scroll {
  display: flex;
  justify-content: center;
}
.user-logout {
  width: 140px;
  cursor: pointer;
  text-align: right;
}
.user-logout .logout {
  display: none;
}
.user-logout:hover .logout {
  display: block;
}
.user-logout:hover .user {
  display: none;
}
</style>
