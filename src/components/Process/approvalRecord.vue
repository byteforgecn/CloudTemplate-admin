<template>
  <el-dialog v-model="visible" title="审批记录" width="60%" append-to-body :close-on-click-modal="false">
    <div>
        <el-image :src="src" style="font-size: 20px; margin: 50px;">
        </el-image>
    </div>
  </el-dialog>
</template>
<script >
import { getHistoryProcessImage } from '@/api/workflow/processInstance';
export default {
  data() {
    return {
      src:"",
      visible:false
    };
  },
  methods: {
    init(processInstanceId) {
      this.visible = true
      this.src = getHistoryProcessImage(processInstanceId)
    }
  }
};
</script>
