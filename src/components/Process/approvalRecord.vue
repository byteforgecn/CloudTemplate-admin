<template>
  <el-dialog v-model="visible" title="审批记录" :width="width" append-to-body :close-on-click-modal="false">
    <div v-loading="loading">
      <div>
        <el-image :src="src" style="font-size: 20px; margin: 50px;"> </el-image>
      </div>
      <div>
        <el-table :data="historyList" style="width: 100%" max-height="570" v-loading="loading">
          <el-table-column label="流程审批历史记录" align="center">
            <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
            <el-table-column prop="name" label="任务名称" align="center"></el-table-column>
            <el-table-column prop="nickName" label="办理人" align="center"></el-table-column>
            <el-table-column prop="status" label="状态" align="center"></el-table-column>
            <el-table-column prop="comment" label="审批意见" align="center"></el-table-column>
            <el-table-column prop="startTime" label="开始时间" align="center"></el-table-column>
            <el-table-column prop="endTime" label="结束时间" align="center"></el-table-column>
            <el-table-column prop="runDuration" label="运行时长" align="center"></el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { getHistoryProcessImage,getHistoryRecord } from '@/api/workflow/processInstance';
export default {
  props: {
    width: {
        type:String,
        default:"70%"
    }
  },
  data() {
    return {
      loading:false,
      src:"",
      visible:false,
      historyList:[]
    };
  },
  methods: {
    init(processInstanceId) {
      this.visible = true
      this.loading = true
      this.src = getHistoryProcessImage(processInstanceId)
      getHistoryRecord(processInstanceId).then(response => {
          this.historyList = response.data
          this.loading = false
      })
    }
  }
};
</script>
