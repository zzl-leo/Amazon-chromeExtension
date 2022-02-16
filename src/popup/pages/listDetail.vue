<template>
    <div class="content">
        <div class="table">
            <el-button style="margin-left: 10px;margin-bottom: 10px" type="primary" @click="$router.push('/taskList')">返回列表</el-button>
            <el-table
                :data="tableData"
                style="width: 100%"
                height="350"
                stripe
                :header-cell-style="header_style"
            >
                <el-table-column
                    type="index"
                    width="45"
                />
                <el-table-column
                    prop="name"
                    label="待下载任务"
                    :show-overflow-tooltip="true"
                />
            </el-table>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tableData: [],
        }
    },
    mounted() {
        this.initList()
    },
    methods: {
        header_style() {
            const borderLine = "background-color:#ecf5ff;border-bottom:2px solid #e3eef4;color:#409eff;font-size: 13px;font-weight: normal;padding: 2px 0;";
            return borderLine;
        },
        initList() {
            chrome.storage.local.get(['data'], t => {
                if(t.data && JSON.parse(t.data).length > 0) {
                    this.tableData = []
                    JSON.parse(t.data).forEach(k => {
                        this.tableData.push({
                            name: `${k.taskType}_${k.countryCode}_${k.sellerId}_${k.countryCode}_${k.id}_${k.startDate}.csv`
                        })
                    })
                }
            })
        }
    }
}
</script>

<style scoped>
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
</style>