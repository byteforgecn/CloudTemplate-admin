
<template>
  <el-dialog title="Flowable工作流在线流程设计器" v-model="visible" v-if="visible" :before-close="handleClose" fullscreen>
    <div class="modeler">
      <iframe class="iframe" :src="src"></iframe>
    </div>
  </el-dialog>
</template>
  
  <script>
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
    }
  },
  methods: {
    handleClose() {
      this.$modal
        .confirm('请记得点击左上角保存按钮，确定关闭设计窗口?', '确认关闭')
        .then(() => {
          this.visible = false
          // 刷新数据
          this.$parent.getList();
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
  