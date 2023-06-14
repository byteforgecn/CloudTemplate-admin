<template>
  <el-dialog v-model="visible" title="审批记录" :width="width" :height="height" append-to-body :close-on-click-modal="false">
    <div v-loading="loading">
      <div style="width: 100%;height: 300px;overflow-y: auto;position: relative;">
        <div
          v-for="(graphic, index) in graphicInfoVos"
          :key="index"
          :style="{ 
           position: 'absolute',
           left: `${graphic.x}px`,
           top: `${graphic.y}px`,
           width: `${graphic.width}px`,
           height: `${graphic.height}px`,
           cursor: 'pointer',
           zIndex: 99
         }"
          @mouseover="handleMouseOver(graphic)"
          @mouseleave="handleMouseLeave()"
        ></div>
        <!-- 弹出的 div 元素 -->
        <div
          v-show="popupVisible"
          :style="{ 
              position: 'absolute',
              left: `${graphicX}px`,
              top: `${graphicY}px`,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              padding: '10px',
              zIndex: 100
            }"
        >
          <p>审批人员: {{ nodeInfo.nickName }}</p>
          <p>节点状态：{{ nodeInfo.status }}</p>
          <p>开始时间：{{ nodeInfo.startTime }}</p>
          <p>结束时间：{{ nodeInfo.endTime }}</p>
          <p>审批耗时：{{ nodeInfo.runDuration }}</p>
        </div>
        <el-image :src="src" />
      </div>
      <div>
        <el-table :data="historyList" style="width: 100%" border fit max-height="570">
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
import { getHistoryProcessImage, getHistoryRecord } from '@/api/workflow/processInstance';
export default {
  props: {
    width: {
      type: String,
      default: '70%'
    },
    height: {
      type: String,
      default: '100%'
    }
  },
  data() {
    return {
      loading: false,
      src: '',
      visible: false,
      historyList: [],
      graphicInfoVos: [],
      nodeListInfo: [],
      popupVisible: false,
      nodeInfo: {},
      graphicX:'',
      graphicY:''
    };
  },
  methods: {
    init(processInstanceId) {
      this.visible = true;
      this.loading = true;
      this.historyList = [];
      this.graphicInfoVos = [];
      this.src = getHistoryProcessImage(processInstanceId);
      getHistoryRecord(processInstanceId).then((response) => {
        this.historyList = response.data.historyRecordList;
        this.graphicInfoVos = response.data.graphicInfoVos;
        this.nodeListInfo = response.data.nodeListInfo;
        this.loading = false;
      });
    },
    handleMouseOver(graphic) {
      this.graphicX = graphic.x+graphic.width
      this.graphicY = graphic.y-graphic.height
      this.nodeInfo = {};
      if (this.nodeListInfo && this.nodeListInfo.length > 0) {
        let info = this.nodeListInfo.find((e) => (e.taskDefinitionKey == graphic.nodeId));
        if (info) {
          this.nodeInfo = {
            nickName: info.nickName,
            status: info.status,
            startTime: info.startTime,
            endTime: info.endTime,
            runDuration: info.runDuration
          };
        }
      }
      this.popupVisible = true;
    },
    handleMouseLeave() {
      this.popupVisible = false;
    }
  }
};
</script>
