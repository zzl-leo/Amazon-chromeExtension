/*
 * @Author: Leo
 * @Date: 2021-12-08 17:00:23
 * @LastEditors: Leo
 * @LastEditTime: 2021-12-08 17:53:10
 * @Description: popup 路由
 */
import Vue from "vue";
import Router from "vue-router";
import login from "./pages/login.vue";
import index from "./pages/index.vue";
import addTask from "./pages/addTask.vue";
import taskList from "./pages/taskList.vue";
import listDetail from "./pages/listDetail.vue";

const routes = [
    {
        path: '/index',
        name: 'index',
        component: index,
    },
    { // 默认进入登录
      path: '*',
      name: 'login',
      component: login,
    },
    {
      path: '/login',
      name: 'login',
      component: login,
    },
    {
      path: '/addTask',
      name: 'addTask',
      component: addTask,
    },
    {
      path: '/taskList',
      name: 'taskList',
      component: taskList
    },
    {
      path: '/listDetail',
      name: 'listDetail',
      component: listDetail
    },
]
Vue.use(Router)
export default new Router({
  mode: 'history',
  routes
})
