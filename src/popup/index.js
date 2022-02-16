/*
 * @Author: Leo
 * @Date: 2021-12-08 11:40:44
 * @LastEditors: Leo
 * @LastEditTime: 2022-01-04 11:07:15
 * @Description: file content
 */
// import 'bulma-fluent/bulma.sass'
import "./utils/element"
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from './utils/request'
import bus from "./utils/bus"
import tool from './utils/tool'

router.beforeEach((to, from, next) => {
  if(to.name === 'login' && !from.name) {
    chrome.storage.local.get(['userData'], v => {
      if(v.userData) {
        bus.$emit('userData', v.userData)
        next({name: 'taskList'})
      }
    })
  }
  next()
})

Vue.prototype.$http = axios
Vue.prototype.$tool = tool
new Vue({
  router,
  data: {
      eventHub: new Vue
  },
  render: h => h(App)
}).$mount("#app");
