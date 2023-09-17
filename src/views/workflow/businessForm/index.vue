<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
      :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="表单名称" prop="formName">
            <el-input v-model="queryParams.formName" placeholder="请输入表单名称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never" v-loading="loading">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <right-toolbar v-model:showSearch="showSearch" @queryTable="queryFromList"></right-toolbar>
        </el-row>
      </template>
      <el-row :gutter="12">
        <el-col :span="8" style="padding-top: 15px;" v-for="(item, index) in formList" :key="index">
          <el-card shadow="hover" style="cursor: pointer;" @click="handleAppay(item)">
            <div style="display: flex;justify-content:flex-start;">
              <div>
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAABwBAMAAAA0zul4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAeUExURf///zKW+ur0/nO4+6XR/YvE/Eqi+5DG/Nnr/sPg/brnfYAAAAFMSURBVFjD7dfPSsNAEAbwNTGtuXVM09pbqCAeFV8gwYNXtU+wioI3FcFrLorH+OeBncYuSnYl+wUKEueDNmHhR8rO7myqqGOUQIECBQoUaDK5dsQD3ihXNtth6YTqtQ0mbqcGbXD8C4z6BYPFUSP3ftCawOVU+8ANezH5QXuVzDwnJ5g38nfruP/SSOYHh9bkjNdcjrDrAghOHhvJe7ettlab6RaFA9fDkTpOURivbi963OX+H/x4qLrA4IzHzjvA57pzVDCMsU7+nT0eKfiTofCQKF2SAxAGPLBdf4GQz63LXB1rHsVgRDtfD05BGLKofQJDOuXLHQyHdQm5mOhPjQ2coXXUXIiM6zFCYUGj3aTUlKMwpIQPOd9j7ufS0abDotsqMu+wcAd40nRV+sCp1W0ysxbW9GpNlRsWrTB9mzvyLn/KBAoUKFCgyScZMYmWkzKSDQAAAABJRU5ErkJggg=="
                  width="60">
              </div>
              <div style="display: inline-block;padding-left: 15px;">
                <div class="from-font">{{ item.formName }}</div>
                <div class="from-time">{{ item.updateTime }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty description="暂无可用表单" v-if="formList.length === 0" />
    </el-card>
    <!-- 流程表单设计器对话框 -->
    <el-dialog :title="render.title" v-if="render.visible" v-model="render.visible" width="80%" append-to-body>
      <div v-loading="fromLoading">
        <v-form-render :form-json="{}" :form-data="{}" ref="vfRenderRef" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-loading="buttonLoading" @click="render.visible = false">取消</el-button>
          <el-button type="success" v-loading="buttonLoading" @click="submitData('draft')">暂存</el-button>
          <el-button type="primary" v-loading="buttonLoading" @click="submitData('submit')">提交</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 提交组件 -->
    <submitVerify ref="submitVerifyRef" @submitCallback="submitCallback" @cancelCallback="cancelCallback" />
  </div>
</template>

<script setup name="BusinessForm" lang="ts">
import { queryList, getForm } from "@/api/workflow/form";
import { FormVO } from "@/api/workflow/form/types";
import { addBusinessForm } from '@/api/workflow/businessForm';
import { BusinessFormForm } from '@/api/workflow/businessForm/types';
import { startWorkFlow } from '@/api/workflow/task';
import SubmitVerify from '@/components/Process/submitVerify.vue';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
//提交组件
const submitVerifyRef = ref<InstanceType<typeof SubmitVerify>>();

const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const formList = ref<FormVO[]>([]);
const loading = ref(true);
const fromLoading = ref(true);
const buttonLoading = ref(false);
const processDefinitionKey = ref<string>('');

const queryFormRef = ref<ElFormInstance>();
const vfRenderRef = ref(null);

const render = reactive<DialogOption>({
  visible: false,
  title: ''
})

const queryParams = ref<Record<string, any>>({
  formName: ''
});

const initFormData: BusinessFormForm = {
  id: undefined,
  applyCode: undefined,
  formId: undefined,
  formName: undefined,
  content: undefined,
  contentValue: undefined
}

const submitFormData = ref<Record<string, any>>({
  businessKey: '',
  processKey: '',
  variables: {}
});

/** 搜索按钮操作 */
const handleQuery = () => {
  queryFromList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 查询可用表单 */
const queryFromList = async () => {
  loading.value = true
  const res = await queryList(queryParams.value);
  formList.value = res.data;
  loading.value = false
}
/** 申请单据 */
const handleAppay = async (row?: FormVO) => {
  render.visible = true;
  fromLoading.value = false
  render.title = row?.formName;
  const formId = row?.formId || ids.value[0];
  initFormData.formId = row?.formId
  initFormData.formName = row?.formName
  initFormData.content = row?.content
  const res = await getForm(formId);
  if (vfRenderRef.value) {
    fromLoading.value = false
    if (res.data.wfFormDefinitionVo && res.data.wfFormDefinitionVo.processDefinitionKey) {
      processDefinitionKey.value = res.data.wfFormDefinitionVo.processDefinitionKey
    }
    vfRenderRef.value.setFormJson(res.data.content);
  }
}

/** 提交按钮 */
const submitData = (status: string) => {
  if (vfRenderRef.value) {
    fromLoading.value = true
    buttonLoading.value = true;
    vfRenderRef.value.getFormData().then((formData) => {
      initFormData.contentValue = JSON.stringify(formData)
      if ('draft' === status) {
        addBusinessForm(initFormData).then(res => {
          proxy?.$modal.msgSuccess("暂存成功");
          render.visible = false;
          buttonLoading.value = false;
        })
      } else {
        if (!processDefinitionKey.value) {
          proxy?.$modal.msgError("未绑定流程!");
          buttonLoading.value = false;
          fromLoading.value = false;
        }
        addBusinessForm(initFormData).then(res => {
          handleStartWorkFlow(res.data)
        })
      }
    })
  }
}

//提交申请
const handleStartWorkFlow = async (data: any) => {
  submitFormData.value.processKey = processDefinitionKey.value;
  submitFormData.value.businessKey = data.id;
  submitFormData.value.variables = data.variable;
  startWorkFlow(submitFormData.value).then((response: any) => {
    if (submitVerifyRef.value) {
      submitVerifyRef.value.openDialog(response.data.taskId);
    }
  });
};
//提交回调
const submitCallback = async () => {
  render.visible = false;
  buttonLoading.value = false;
  fromLoading.value = false;
  handleQuery();
};
//取消回调
const cancelCallback = async () => {
  buttonLoading.value = false;
  fromLoading.value = false;
};

onMounted(() => {
  queryFromList();
});
</script>

<style scoped>
.from-font {
  font-size: 18px;
  font-weight: bold;
  vertical-align: top;
  height: 30px;
}

.from-time {
  font-size: 12px;
  vertical-align: bottom;
  height: 30px;
}
</style>
