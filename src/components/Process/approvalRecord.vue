<template>
  <el-dialog v-model="visible" v-if="visible" title="审批记录" width="650px" append-to-body :close-on-click-modal="false">
    <div>
      <div>
        <el-image v-if="processInstanceId" :src="src" style="font-size: 20px; margin: 50px;">
          <div slot="placeholder"><i class="el-icon-loading"></i> 流程审批历史图加载中……</div>
        </el-image>
      </div>      
    </div>
  </el-dialog>
</template>
<script >
const baseURL = import.meta.env.VITE_APP_BASE_API;
import { getToken } from '@/utils/auth';
export default {
  props: {
    processInstanceId: String
  },

  data() {
    return {
      visible: false
    };
  },
  computed: {
    src() {
      return baseURL+`/workflow/processInstance/getHistoryProcessImage${this.processInstanceId}?Authorization=Bearer ${getToken}`
    }
  },
  methods: {
    
  }
};
</script>
