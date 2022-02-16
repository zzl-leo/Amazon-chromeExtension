<!--
 * @Author: Leo
 * @Date: 2021-12-08 17:51:54
 * @LastEditors: Leo
 * @LastEditTime: 2021-12-09 15:46:16
 * @Description: 新建任务
-->
<template>
<!-- bsrReport、summaryReport、transactionReport -->
  <div class="page-container">
    <el-tabs v-model="activeName">
      <el-tab-pane label="Bsr任务" name="bsrReport">
        <addBsr v-if="activeName === 'bsrReport'" />
      </el-tab-pane>
      <el-tab-pane label="Payment任务" name="summaryReport">
        <addPayment v-if="activeName === 'summaryReport'" />
      </el-tab-pane>
      <el-tab-pane label="角色管理" name="transactionReport">角色管理</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import addBsr from '../components/addBsr.vue'
import addPayment from '../components/addPayment.vue'
export default {
  components: {addBsr, addPayment},
  data() {
    return {
      activeName: "bsrReport"
    }
  },
  mounted() {

  },
  methods: {

  }
}
</script>
<style scoped>
.page-container {
  padding: 0 20px 0 0;
  margin-top: 0px;
}
.page-container /deep/ .el-tabs {
  height: 30px;
}
.page-container /deep/ .el-tabs__header {
  margin-top: 0;
}
.page-container /deep/ .el-tabs__nav-scroll {
  display: flex;
  justify-content: center;
}
</style>
