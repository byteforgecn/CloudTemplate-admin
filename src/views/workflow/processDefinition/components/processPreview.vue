<template>
  <el-dialog title="预览" v-model="data.visible" width="70%" append-to-body>
    <div v-if="data.type === 'png'" style="align:center">
      <el-image :src="data.url[0]" v-if="data.type === 'png'">
        <div>流程图加载中 <i class="el-icon-loading"></i></div>
      </el-image>
    </div>
    <div class="xml-data" v-if="data.type === 'xml'">
      <div v-for="(xml, index) in data.url" :key="index">
        <pre class="font">{{ xml }}</pre>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer" v-if="data.type === 'xml'"> </span>
    </template>
  </el-dialog>
</template>

<script setup>
const data = reactive({
    visible: false,
    url: [],
    type: ''
})
//打开
function openDialog (url, type) {
    data.visible = true
    data.url = url
    data.type = type
}
/**
 * 对外暴露子组件方法
 */
defineExpose({
    openDialog
})
</script>
<style>
.xml-data {
  background-color: #2b2b2b;
  border-radius: 5px;
  color: #c6c6c6;
  word-break: break-all;
  overflow-y: scroll;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 8px 0px;
  height: 500px;
  width: inherit;
  line-height: 1px;
  overflow: auto;
}
.font {
  font-family: '幼圆';
  font-weight: 500;
}
</style>
