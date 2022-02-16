<!--
 * @Author: Leo
 * @Date: 2021-12-08 17:52:27
 * @LastEditors: Leo
 * @LastEditTime: 2022-01-21 11:06:48
 * @Description: 任务列表
-->
<template>
  <div class="taskList-container">
    <div class="content">
      <div class="badge-list">
        <el-badge
          :value="taskNum"
          class="item item-num"
        >
          <div
            class="badge-content"
            @click="$router.push('/listDetail')"
          >
            任务列表
          </div>
        </el-badge>

        <div class="flex-box">
          <el-badge
            class="item item-num item-num-flex"
          >
            <div class="badge-content">
              {{ taskStatus }}
            </div>
          </el-badge>
          <div class="task-now">
            {{ taskNowName }}
          </div>
        </div>
      </div>

      <div class="table">
        <el-table
          :data="tableData"
          style="width: 100%"
          height="220"
          stripe
          :header-cell-style="header_style"
        >
          <el-table-column
            type="index"
            width="45"
          />
          <el-table-column
            prop="name"
            label="已下载任务"
            :show-overflow-tooltip="true"
          />
        </el-table>
      </div>
    </div>
    <div
      class="tasklist-footer"
      @click="reStart"
    >
      注：任务已经开始下载，请暂时停止切换站点操作!
      <div
        v-if="errorhandle"
        class="errorHandle"
        @click="reStart"
      >
        <span v-if="taskNum > 0">点击重新开始任务：</span>{{ errorhandle }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      tableData: [],
      taskNowName: '暂无下载任务',
      taskStatus: '当前下载任务',
      taskNum: 0,
      loginEnter: false,
      errorhandle: ''
    }
  },
  mounted() {
    this.statusInit()
    // 监听缓存变化
    chrome.storage.onChanged.addListener((changes) => {
      console.log(changes)
      if(changes.taskNum) { // 任务数量变更
        this.taskNum = changes.taskNum.newValue
      }

      if(changes.fileName) { // 当前任务名称变更
        this.taskNowName = changes.fileName.newValue
      } else {
        this.taskNowName = '暂无下载任务'
      }

      if(changes.fileList) { // 下载完成列表
        this.tableDataInit(changes.fileList.newValue)
      }

      if(changes.errorTips) { // 后台报错
        if(changes.errorTips.newValue.indexOf('登录超时') !== -1) {
          this.$router.push('/login')
        }
      }
    });
  },
  methods: {
    header_style() {
      const borderLine = "background-color:#ecf5ff;border-bottom:2px solid #e3eef4;color:#409eff;font-size: 13px;font-weight: normal;padding: 2px 0;";
      return borderLine;
    },
    tableDataInit(arr) {
      this.tableData = []
      arr.split(',').forEach(k => {
        const item = {}
        item.name = k
        this.tableData.push(item)
      })
    },
    statusInit() {
      chrome.storage.local.get(['taskNum', 'fileName', 'fileList', 'errorTips'], t => {
        this.taskNum = t.taskNum || 0
          if(t.fileName) {
            this.taskNowName = t.fileName
          } else {
             this.taskNowName = '暂无下载任务'
          }
          if(t.fileList) { // 下载完成列表
            this.tableDataInit(t.fileList)
          }
          if(t.errorTips) { // 后台错误
            if(t.errorTips.indexOf('登录超时') !== -1) {
              this.$router.push('/login')
              return
            }
            this.errorhandle = t.errorTips
          } else {
            this.errorhandle = ''
          }
      })
    },
    reStart() {
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { taskList: true }, () => {
          console.log(tabs[0].id)
          chrome.storage.local.get(['tasking', 'domain'], async v => {
            console.log(v.domain)
            console.log(v.tasking)
          })
        })
      })
    }
  }
}
</script>
<style scoped>
.taskList-container {
  display: flex;
  flex-direction: column;
}
.content {
  flex: 1;
  padding: 0 10px;
}
.tasklist-footer {
  height: 30px;
  line-height: 30px;
  text-align: center;
  font-size: 12px;
  background: #fef0f0;
  color: #f56c6c;
  position: relative;
}
.errorHandle {
  height: 100%;
  line-height: 30px;
  right: 0;
  left: 0;
  top: 0;
  font-size: 12px;
  background: #fef0f0;
  color: #f56c6c;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  cursor: pointer;
  position: absolute;
}

.badge-list {
  display: flex;
  flex-direction: column;
}
.item-num {
  margin-bottom: 15px;
}
.content /deep/ .el-badge {
  width: 90px;
}
.badge-content {
  display: inline-block;
  width: 90px;
  background: #ecf5ff;
  font-size: 12px;
  color: #409eff;
  padding: 5px 0;
  cursor: pointer;
  text-align: center;
}

.content /deep/ .el-table .cell {
  font-size: 12px;
  color:#616d74;
}
.content /deep/ .el-table .el-table__cell {
  padding: 4px 0;
}

.flex-box {
  display: flex;
  align-items: center;
}
.task-now {
  flex: 1;
  font-size: 13px;
  height: 28px;
  line-height: 28px;
  margin-bottom: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  padding-left: 15px;
}
</style>
