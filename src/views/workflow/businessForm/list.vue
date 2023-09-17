<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
      :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="申请编码" prop="applyCode">
            <el-input v-model="queryParams.applyCode" placeholder="请输入申请编码" clearable @keyup.enter="handleQuery" />
          </el-form-item>
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

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              v-hasPermi="['workflow:businessForm:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              v-hasPermi="['workflow:businessForm:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
              v-hasPermi="['workflow:businessForm:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="businessFormList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键" align="center" prop="id" v-if="true" />
        <el-table-column label="申请编码" align="center" prop="applyCode" />
        <el-table-column label="表单id" align="center" prop="formId" />
        <el-table-column label="表单名称" align="center" prop="formName" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['workflow:businessForm:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                v-hasPermi="['workflow:businessForm:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
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
  </div>
</template>

<script setup name="BusinessForm" lang="ts">
import { listBusinessForm, getBusinessForm, delBusinessForm, addBusinessForm, updateBusinessForm } from '@/api/workflow/businessForm';
import { BusinessFormVO, BusinessFormQuery, BusinessFormForm } from '@/api/workflow/businessForm/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const businessFormList = ref<BusinessFormVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const fromLoading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const applyCodes = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const vfRenderRef = ref(null);

const render = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: BusinessFormForm = {
  id: undefined,
  applyCode: undefined,
  formId: undefined,
  formName: undefined,
  content: undefined,
  contentValue: undefined
}
const data = reactive<PageData<BusinessFormForm, BusinessFormQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    applyCode: undefined,
    formName: undefined,
    params: {
    }
  },
  rules: {}
});

const { queryParams, form, rules } = toRefs(data);

/** 查询发起流程列表 */
const getList = async () => {
  loading.value = true;
  const res = await listBusinessForm(queryParams.value);
  businessFormList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}


/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: BusinessFormVO[]) => {
  ids.value = selection.map(item => item.id);
  applyCodes.value = selection.map(item => item.applyCode);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 修改按钮操作 */
const handleUpdate = async (row?: BusinessFormVO) => {
  const _id = row?.id || ids.value[0]
  fromLoading.value = true
  render.visible = true;
  const res = await getBusinessForm(_id);
  Object.assign(form.value, res.data);
  render.title = "修改单据";
  if (vfRenderRef.value) {
    fromLoading.value = false
    vfRenderRef.value.setFormJson(res.data.content);
    vfRenderRef.value.setFormData(JSON.parse(res.data.contentValue))
  }
}

/** 提交按钮 */
const submitData = (status: string) => {
  if (vfRenderRef.value) {
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

      }
    })
  }
}
/** 删除按钮操作 */
const handleDelete = async (row?: BusinessFormVO) => {
  const _ids = row?.id || ids.value;
  const _applyCode = row?.applyCode || applyCodes.value;
  await proxy?.$modal.confirm('是否确认删除流程编号为【' + _applyCode + '】的数据项？').finally(() => loading.value = false);
  await delBusinessForm(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('workflow/businessForm/export', {
    ...queryParams.value
  }, `businessForm_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
