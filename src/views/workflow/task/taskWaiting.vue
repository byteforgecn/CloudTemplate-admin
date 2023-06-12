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
        <el-table-column align="center" prop="version" label="版本号" width="90">
          <template #default="scope"> v{{ scope.row.version }}.0</template>
        </el-table-column>
        <el-table-column align="center" prop="createTime" label="创建时间" width="160"></el-table-column>
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="text" size="small" icon="el-icon-thumb" @click="approvalRecord(scope.row)">审批记录</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <approvalRecord ref="approvalRecordRef" :processInstanceId="processInstanceId"/>
  </div>
</template>

<script lang="ts" setup>
import { getTaskWaitByPage } from '@/api/workflow/task';
import { ComponentInternalInstance } from 'vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';

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
const processInstanceId = ref<string>('')

onMounted(() => {
  getList();
});
const approvalRecord = (row: any) => {
  if (approvalRecordRef.value) {
    processInstanceId.value = row.processInstanceId
    approvalRecordRef.value.visible = true
    console.log(processInstanceId.value)
    console.log(approvalRecordRef.value.visible)
  }
}
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
</script>
