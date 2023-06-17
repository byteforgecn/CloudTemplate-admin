<template>
  <el-dialog title="预览" v-model="visible" width="70%" append-to-body>
    <div v-if="type==='png'" style="align:center">
      <el-image :src="url[0]" v-if="type==='png'"> </el-image>
    </div>
    <div class="xml-data" v-if="type==='xml'">
      <div v-for="(xml,index) in url" :key="index">
        <pre class="font">{{xml}}</pre>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    url: {
      type: Array,
      default: () => []
    },
    type: String
  },
  data() {
    return {
      visible: false
    };
  },
  methods: {
    init() {
      this.visible = true;
    }
  }
};
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
}
.font {
  font-family: '幼圆';
  font-weight: 500;
}
</style>
