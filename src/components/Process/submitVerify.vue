<template>
  <el-dialog v-model="dialog.visible" v-loading="loading" :title="dialog.title" width="30%" draggable>
    <span>It's a draggable Dialog</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleCompleteTask"> 提交 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ComponentInternalInstance } from 'vue';
import { ElForm } from 'element-plus';
import { completeTask } from '@/api/workflow/task';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps({
  taskId: {
    type: String,
    required: true,
    default: ''
  }
});

// 遮罩层
const loading = ref(true);

const dialog = reactive<DialogOption>({
  visible: false,
  title: '提示'
});

const openDialog = (visible?: any) => {
  dialog.visible = visible;
};

onMounted(() => {});
const emits = defineEmits(['submitCallback']);

/** 办理流程 */
const handleCompleteTask = async () => {
  await proxy?.$modal.confirm('是否确认提交？');
  let param = {
    taskId: props.taskId
  };
  await completeTask(param).finally(() => (loading.value = false));
  dialog.visible = false
  emits('submitCallback');
  proxy?.$modal.msgSuccess('操作成功');
};
/**
 * 对外暴露子组建方法
 */
defineExpose({
  openDialog
});
</script>
  