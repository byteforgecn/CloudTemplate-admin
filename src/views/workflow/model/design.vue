<template>
  <el-dialog title="Flowable工作流在线流程设计器" width="90%" height="100%" v-model="visible" v-if="visible" :before-close="handleClose">
    <div class="modeler">
      <iframe class="iframe" :src="src"></iframe>
    </div>
  </el-dialog>
</template>

<script lang="ts">
const baseURL = import.meta.env.VITE_APP_BASE_API;
import { getToken } from '@/utils/auth';
export default {
  props: {
    modelId: String
  },

  data() {
    return {
      visible: false
    };
  },
  computed: {
    src() {
      return `/static/flowable-modeler/index.html#/editor/${this.modelId}`;
    },
    apiUrl() {
      return baseURL;
    },
    token() {
      return getToken();
    }
  },
  mounted(){
      //全局存入当前vue实例
      window.this = this;
  },
  methods: {
    handleClose() {
      this.$modal
        .confirm('请记得点击左上角保存按钮，确定关闭设计窗口?', '确认关闭')
        .then(() => {
          this.visible = false;
          // 刷新数据
          this.$emit("handleClose")
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>
<style scoped>
.iframe {
  width: 100%;
  height: calc(100vh - 120px);
  border: 0px;
}
</style>
