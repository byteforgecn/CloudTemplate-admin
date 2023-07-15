<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]">
        <el-card shadow="hover">
          <center>
            <el-radio-group v-model="tab" @change="changeTab(tab)">
              <el-radio-button label="waiting">待办任务</el-radio-button>
              <el-radio-button label="finish">已办任务</el-radio-button>
            </el-radio-group>
          </center>
        </el-card>
      </div>
    </transition>
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="任务名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入任务名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="流程定义名称" label-width="100" prop="name">
              <el-input v-model="queryParams.processDefinitionName" placeholder="请输入流程定义名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="流程定义KEY" label-width="100" prop="name">
              <el-input v-model="queryParams.processDefinitionKey" placeholder="请输入流程定义KEY" clearable @keyup.enter="handleQuery" />
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
          <right-toolbar v-model:showSearch="showSearch" @queryTable="handleQuery"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column fixed align="center" type="index" label="序号" width="50"></el-table-column>
        <el-table-column fixed align="center" prop="processDefinitionName" label="流程定义名称"></el-table-column>
        <el-table-column fixed align="center" prop="processDefinitionKey" label="流程定义KEY"></el-table-column>
        <el-table-column fixed align="center" prop="name" label="任务名称"></el-table-column>
        <el-table-column fixed align="center" prop="assigneeName" label="办理人">
          <template #default="scope" v-if="tab === 'waiting'">
            <template v-if="scope.row.participantVo && scope.row.assignee === null">
              <el-tag type="success" v-for="(item,index) in scope.row.participantVo.candidateName" :key="index">
                {{ item }}
              </el-tag>
            </template>
            <template v-else>
              <el-tag type="success">
                {{ scope.row.assigneeName }}
              </el-tag>
            </template>
          </template>
          <template #default="scope" v-else-if="tab === 'finish'">
            <el-tag type="success">
              {{ scope.row.assigneeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="businessStatusName" label="流程状态" min-width="70">
          <template #default="scope">
            <el-tag type="success" v-if="tab === 'waiting'">{{scope.row.businessStatusName}}</el-tag>
            <el-tag type="success" v-else>已完成</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="createTime" label="创建时间" width="160"></el-table-column>
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="text" size="small" icon="el-icon-thumb" @click="handleApprovalRecord(scope.row)">审批记录</el-button>
              </el-col>
              <el-col :span="1.5" v-if="scope.row.multiInstance">
                <el-button type="text" size="small" icon="el-icon-thumb" @click="addMultiInstanceUser(scope.row)">加签</el-button>
              </el-col>
              <el-col :span="1.5" v-if="scope.row.multiInstance">
                <el-button type="text" size="small" icon="el-icon-thumb" @click="deleteMultiInstanceUser(scope.row)">减签</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>
    <!-- 审批记录 -->
    <approvalRecord ref="approvalRecordRef" />
    <!-- 提交组件 -->
    <submitVerify ref="submitVerifyRef" :taskId="taskId" @submitCallback="handleQuery" />
    <!-- 加签组件 -->
    <multiInstanceUser ref="multiInstanceUserRef" :title="title" @submitCallback="handleQuery" />
  </div>
</template>

<script lang="ts" setup>
import { getAllTaskWaitByPage, getAllTaskFinishByPage } from '@/api/workflow/task';
import { ComponentInternalInstance } from 'vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
import SubmitVerify from '@/components/Process/submitVerify.vue';
import MultiInstanceUser from '@/components/Process/multiInstance-user.vue';
//提交组件
const submitVerifyRef = ref<InstanceType<typeof SubmitVerify>>();
//审批记录组件
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>();
//加签组件
const multiInstanceUserRef = ref<InstanceType<typeof MultiInstanceUser>>();
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
// 任务id
const taskId = ref('');
const title = ref('');
const userIdList = ref<Array<any>>([]);
// 查询参数
const queryParams = ref<Record<string, any>>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  processDefinitionName: undefined,
  processDefinitionKey: undefined
});
const tab = ref('waiting');
onMounted(() => {
  getWaitingList();
});
//审批记录
const handleApprovalRecord = (row: any) => {
  if (approvalRecordRef.value) {
    approvalRecordRef.value.init(row.processInstanceId);
  }
};
//加签
const addMultiInstanceUser = (row: any) => {
  if (multiInstanceUserRef.value) {
    title.value = '加签人员';
    multiInstanceUserRef.value.getAddMultiInstanceList(row.id, []);
  }
};
//减签
const deleteMultiInstanceUser = (row: any) => {
  if (multiInstanceUserRef.value) {
    title.value = '减签人员';
    multiInstanceUserRef.value.getDeleteMultiInstanceList(row.id);
  }
};
/** 搜索按钮操作 */
const handleQuery = () => {
  if ('waiting' === tab.value) {
    getWaitingList();
  } else {
    getFinishList();
  }
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
const changeTab = async (data: string) => {
  queryParams.value.pageNum = 1;
  if ('waiting' === data) {
    getWaitingList();
  } else {
    getFinishList();
  }
};
//分页
const getWaitingList = () => {
  loading.value = true;
  getAllTaskWaitByPage(queryParams.value).then((resp) => {
    taskList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};
const getFinishList = () => {
  loading.value = true;
  getAllTaskFinishByPage(queryParams.value).then((resp) => {
    taskList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};
</script>
