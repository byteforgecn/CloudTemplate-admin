<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="请假天数" prop="leaveDays">
            <el-input v-model="queryParams.leaveDays" placeholder="请输入请假天数" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:leave:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:leave:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="leaveList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键" align="center" prop="id" v-if="true" />
        <el-table-column label="标题" align="center" prop="title" />
        <el-table-column label="请假天数" align="center" prop="leaveDays" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column align="center" prop="businessStatusName" label="流程状态" min-width="70">
          <template #default="scope">
            <el-tag type="success">{{scope.row.processInstanceVo.businessStatusName}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip
              content="修改"
              placement="top"
              v-if="scope.row.processInstanceVo.businessStatus === 'draft'||scope.row.processInstanceVo.businessStatus === 'cancel'||scope.row.processInstanceVo.businessStatus === 'back'"
            >
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['demo:leave:edit']"></el-button>
            </el-tooltip>
            <el-tooltip
              content="删除"
              placement="top"
              v-if="scope.row.processInstanceVo.businessStatus === 'draft'||scope.row.processInstanceVo.businessStatus === 'cancel'||scope.row.processInstanceVo.businessStatus === 'back'"
            >
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:leave:remove']"></el-button>
            </el-tooltip>
            <el-tooltip content="撤销" placement="top" v-if="scope.row.processInstanceVo.businessStatus === 'waiting'">
              <el-button link type="primary" icon="Promotion" @click="handleCancelProcessApply(scope.row.processInstanceVo.id)"></el-button>
            </el-tooltip>
            <el-tooltip content="审批记录" placement="top" v-if="scope.row.processInstanceVo.businessStatus === 'waiting'">
              <el-button link type="primary" icon="Document" @click="handleApprovalRecord(scope.row.processInstanceVo.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改请假对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="leaveFormRef" :model="form" :rules="rules" label-width="80px" v-loading="loading">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="请假天数" prop="leaveDays">
          <el-input v-model="form.leaveDays" type="number" placeholder="请输入请假天数" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="info" @click="submitForm('draft')">暂 存</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm('submit')">提 交</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 提交组件 -->
    <submitVerify ref="submitVerifyRef" @submitCallback="submitCallback" />
    <!-- 审批记录 -->
    <approvalRecord ref="approvalRecordRef" />
  </div>
</template>

<script setup name="Leave" lang="ts">
import { listLeave, getLeave, delLeave, addLeave, updateLeave } from '@/api/demo/leave';
import { cancelProcessApply } from '@/api/workflow/processInstance';
import { LeaveVO, LeaveQuery, LeaveForm } from '@/api/demo/leave/types';
import { ComponentInternalInstance } from 'vue';
import { ElForm } from 'element-plus';
import { startWorkFlow } from '@/api/workflow/task';
import SubmitVerify from '@/components/Process/submitVerify.vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const leaveList = ref<LeaveVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
//提交组件
const submitVerifyRef = ref<InstanceType<typeof SubmitVerify>>();
  //审批记录组件
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>();

const queryFormRef = ref(ElForm);
const leaveFormRef = ref(ElForm);

const submitFormData = ref<Record<string, any>>({
  businessKey: '',
  processKey: '',
  variables: {}
});

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LeaveForm = {
  id: undefined,
  title: undefined,
  leaveDays: undefined,
  remark: undefined
};
const data = reactive<PageData<LeaveForm, LeaveQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    leaveDays: undefined
  },
  rules: {
    id: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
    leaveDays: [{ required: true, message: '请假天数不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询请假列表 */
const getList = async () => {
  loading.value = true;
  const res = await listLeave(queryParams.value);
  leaveList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  leaveFormRef.value.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: LeaveVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  dialog.visible = true;
  dialog.title = '添加请假申请';
  nextTick(() => {
    reset();
  });
};

/** 修改按钮操作 */
const handleUpdate = (row?: LeaveVO) => {
  loading.value = true;
  dialog.visible = true;
  dialog.title = '修改请假申请';
  nextTick(async () => {
    reset();
    const _id = row?.id || ids.value[0];
    const res = await getLeave(_id);
    loading.value = false;
    Object.assign(form.value, res.data);
  });
};

/** 提交按钮 */
const submitForm = (status: string) => {
  leaveFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      let res = {};
      if (form.value.id) {
        res = await updateLeave(form.value).finally(() => (buttonLoading.value = false));
      } else {
        res = await addLeave(form.value).finally(() => (buttonLoading.value = false));
      }
      if (status === 'draft') {
        proxy?.$modal.msgSuccess('暂存成功');
        dialog.visible = false;
      } else {
        handleStartWorkFlow(res.data);
      }
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: LeaveVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除请假编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delLeave(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/leave/export',
    {
      ...queryParams.value
    },
    `leave_${new Date().getTime()}.xlsx`
  );
};

//提交申请
const handleStartWorkFlow = async (data: any) => {
  submitFormData.value.processKey = 'test';
  submitFormData.value.businessKey = data.id;
  submitFormData.value.variables = {
    leaveDays: data.leaveDays,
    userList: [1]
  };
  startWorkFlow(submitFormData.value).then((response) => {
    if (submitVerifyRef.value) {
      submitVerifyRef.value.openDialog(true, response.data.taskId);
    }
  });
};
//审批记录
const handleApprovalRecord = (id: string) => {
  if (approvalRecordRef.value) {
    approvalRecordRef.value.init(id);
  }
};
//提交回调
const submitCallback = async (data: any) => {
  dialog.visible = false;
  handleQuery();
};
/** 撤销按钮操作 */
const handleCancelProcessApply = async (id: string) => {
  await proxy?.$modal.confirm('是否确认撤销当前单据？');
  loading.value = true;
  await cancelProcessApply(id).finally(() => (loading.value = false));
  getList();
  proxy?.$modal.msgSuccess('撤销成功');
};
onMounted(() => {
  getList();
});
</script>
