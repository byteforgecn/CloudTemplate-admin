<template>
  <el-dialog v-model="dialog.visible" :title="dialog.title" width="50%" draggable :close-on-click-modal="false">
    <el-form :model="form" label-width="120px" v-loading="loading">
      <el-form-item label="消息提醒">
        <el-checkbox-group v-model="form.messageType">
          <el-checkbox label="1" name="type" disabled>站内信</el-checkbox>
          <el-checkbox label="2" name="type">邮件</el-checkbox>
          <el-checkbox label="3" name="type">短信</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="审批意见">
        <el-input v-model="form.message" type="textarea" resize="none" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleCompleteTask"> 提交 </el-button>
        <el-button type="danger" @click="handleBackProcess" v-if="businessStatus === 'waiting'"> 退回 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ComponentInternalInstance } from 'vue';
import { ElForm } from 'element-plus';
import { completeTask, backProcess, getBusinessStatus } from '@/api/workflow/task';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

//遮罩层
const loading = ref(true);
//流程状态
const businessStatus = ref('');
//任务id
const taskId = ref('');

const dialog = reactive<DialogOption>({
  visible: false,
  title: '提示'
});

const form = ref<Record<string, any>>({
  taskId: undefined,
  message: undefined,
  variables: {},
  messageType: ['1']
});
//打开弹窗
const openDialog = (visible?: any,id?: string) => {
  taskId.value = id
  form.value.message = undefined;
  dialog.visible = visible;
  loading.value = true;
  nextTick(() => {
    getBusinessStatus(taskId.value).then((response) => {
      businessStatus.value = response.data;
      loading.value = false;
    });
  });
};

onMounted(() => {});
const emits = defineEmits(['submitCallback']);

/** 办理流程 */
const handleCompleteTask = async () => {
  form.value.taskId = taskId.value;
  await proxy?.$modal.confirm('是否确认提交？');
  loading.value = true
  await completeTask(form.value).finally(() => (loading.value = false));
  dialog.visible = false;
  emits('submitCallback');
  proxy?.$modal.msgSuccess('操作成功');
};

/** 驳回流程 */
const handleBackProcess = async () => {
  form.value.taskId = taskId.value;
  await proxy?.$modal.confirm('是否确认驳回到申请人？');
  loading.value = true
  await backProcess(form.value).finally(() => (loading.value = false));
  dialog.visible = false;
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
  