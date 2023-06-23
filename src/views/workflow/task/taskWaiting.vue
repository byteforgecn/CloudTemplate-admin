<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="任务名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入模型名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column fixed align="center" type="index" label="序号" width="50"></el-table-column>
        <el-table-column fixed align="center" prop="name" label="任务名称"></el-table-column>
        <el-table-column fixed align="center" prop="assignee" label="办理人"></el-table-column>
        <el-table-column align="center" prop="businessStatusName" label="流程状态" min-width="70">
          <template #default="scope">
            <el-tag type="success">{{scope.row.businessStatusName}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="createTime" label="创建时间" width="160"></el-table-column>
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="text" size="small" icon="el-icon-thumb" @click="handleApprovalRecord(scope.row)">审批记录</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="text" size="small" icon="el-icon-thumb" @click="handleCompleteTask(scope.row.id)">办理</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 审批记录 -->
    <approvalRecord ref="approvalRecordRef" />
  </div>
</template>

<script lang="ts" setup>
import { getTaskWaitByPage, completeTask } from '@/api/workflow/task';
import { ComponentInternalInstance } from 'vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
//审批记录组件
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 遮罩层
const loading = ref(true);
// 选中数组
const ids = ref<Array<any>>([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 模型定义表格数据
const taskList = ref([]);
// 查询参数
const queryParams = ref<Record<string, any>>({
  pageNum: 1,
  pageSize: 10,
  name: undefined
});

onMounted(() => {
  getList();
});
//审批记录
const handleApprovalRecord = (row: any) => {
  if (approvalRecordRef.value) {
    approvalRecordRef.value.init(row.processInstanceId);
  }
};
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {};
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  handleQuery();
};
// 多选框选中数据
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};
//分页
const getList = () => {
  loading.value = true;
  getTaskWaitByPage(queryParams.value).then((resp) => {
    taskList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};
/** 办理流程 */
const handleCompleteTask = async (taskId: string) => {
  await proxy?.$modal.confirm('是否确认办理流程？');
  let param = {
    taskId: taskId
  };
  await completeTask(param).finally(() => (loading.value = false));
  getList();
  proxy?.$modal.msgSuccess('操作成功');
};
</script>
