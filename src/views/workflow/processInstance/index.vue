<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!-- 流程分类树 -->
      <el-col :lg="4" :xs="24" style="">
        <el-card shadow="hover">
          <el-input placeholder="请输入流程分类名" v-model="categoryName" prefix-icon="Search" clearable />
          <el-tree
            class="mt-2"
            ref="categoryTreeRef"
            node-key="id"
            :data="categoryOptions"
            :props="{ label: 'categoryName', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          ></el-tree>
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div class="mb-[10px]">
            <el-card shadow="hover">
              <center>
                <el-radio-group v-model="tab" @change="changeTab(tab)">
                  <el-radio-button label="running">运行中</el-radio-button>
                  <el-radio-button label="finish">已完成</el-radio-button>
                </el-radio-group>
              </center>
            </el-card>
          </div>
        </transition>
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div class="mb-[10px]" v-show="showSearch">
            <el-card shadow="hover">
              <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="120px">
                <el-form-item label="流程定义名称" prop="name">
                  <el-input v-model="queryParams.name" placeholder="请输入流程定义名称" clearable @keyup.enter="handleQuery" />
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
              <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="handleQuery"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" :data="processInstanceList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column fixed align="center" type="index" label="序号" width="50"></el-table-column>
            <el-table-column fixed align="center" prop="id" label="id" v-if="false"></el-table-column>
            <el-table-column fixed align="center" prop="processDefinitionName" label="流程定义名称"></el-table-column>
            <el-table-column fixed align="center" prop="processDefinitionKey" label="流程定义KEY"></el-table-column>
            <el-table-column align="center" prop="processDefinitionVersion" label="版本号" width="90">
              <template #default="scope"> v{{ scope.row.processDefinitionVersion }}.0</template>
            </el-table-column>
            <el-table-column align="center" prop="isSuspended" label="状态" min-width="70" v-if="tab === 'running'">
              <template #default="scope">
                <el-tag type="success" v-if="!scope.row.isSuspended">激活</el-tag>
                <el-tag type="danger" v-else>挂起</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="businessStatusName" label="流程状态" min-width="70">
              <template #default="scope">
                <el-tag type="success">{{scope.row.businessStatusName}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="startTime" label="启动时间" width="160"></el-table-column>
            <el-table-column align="center" v-if="tab === 'finish'" prop="endTime" label="结束时间" width="160"></el-table-column>
            <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button type="text" size="small" icon="el-icon-thumb" @click="handleApprovalRecord(scope.row)">审批记录</el-button>
                  </el-col>
                  <el-col :span="1.5">
                    <el-button type="text" size="small" icon="el-icon-thumb" @click="handleDelete(scope.row)">删除</el-button>
                  </el-col>
                </el-row>
                <el-row :gutter="10" class="mb8" v-if="tab === 'running'">
                  <el-col :span="1.5">
                    <el-popover trigger="click" :ref="`popoverRef${scope.$index}`" placement="left" :width="300">
                      <el-input resize="none" v-model="deleteReason" :rows="3" type="textarea" placeholder="请输入作废原因" />
                      <div style="text-align: right; margin: 5px 0px 0px 0px">
                        <el-button size="small" text @click="cancelPopover(scope.$index)">取消</el-button>
                        <el-button size="small" type="primary" @click="handleInvalid(scope.row)">确认</el-button>
                      </div>
                      <template #reference>
                        <el-button type="text" size="small" icon="el-icon-thumb">作废</el-button>
                      </template>
                    </el-popover>
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
            @pagination="getProcessInstanceRunningList"
          />
        </el-card>
      </el-col>
    </el-row>
    <!-- 审批记录 -->
    <approvalRecord ref="approvalRecordRef" />
  </div>
</template>

<script lang="ts" setup>
import {
  getProcessInstanceRunningByPage,
  getProcessInstanceFinishByPage,
  deleteRuntimeProcessAndHisInst,
  deleteFinishProcessAndHisInst,
  deleteRuntimeProcessInst
} from '@/api/workflow/processInstance';
import { ComponentInternalInstance } from 'vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
import { listCategory } from "@/api/workflow/category";
import { ElTree } from 'element-plus';
import { CategoryVO } from '@/api/workflow/category/types';
//审批记录组件
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const queryFormRef = ref(ElForm);

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
const processInstanceList = ref([]);

const categoryOptions = ref<CategoryOption[]>([]);
const categoryName = ref('');
const categoryTreeRef = ref(ElTree);

type CategoryOption = {
  categoryCode: string;
  categoryName: string;
  children?: CategoryOption[];
}

const tab = ref('running');
// 作废原因
const deleteReason = ref('');
// 查询参数
const queryParams = ref<Record<string, any>>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  categoryCode: undefined
});

onMounted(() => {
  getProcessInstanceRunningList();
  getTreeselect();
});


/** 节点单击事件 */
const handleNodeClick = (data: CategoryVO) => {
    queryParams.value.categoryCode = data.categoryCode;
    if(data.categoryCode === 'ALL'){
        queryParams.value.categoryCode =''
    }
    handleQuery()
}
/** 通过条件过滤节点  */
const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.categoryName.indexOf(value) !== -1
}
/** 根据名称筛选部门树 */
watchEffect(
    () => {categoryTreeRef.value.filter(categoryName.value);},
    {
        flush: 'post' // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
    }
);

/** 查询流程分类下拉树结构 */
const getTreeselect = async () => {
  const res = await listCategory();
  categoryOptions.value = [];
  const data: CategoryOption = { categoryCode: 'ALL', categoryName: '顶级节点', children: [] };
  data.children = proxy?.handleTree<CategoryOption>(res.data, "id", "parentId");
  categoryOptions.value.push(data);
}

//审批记录
const handleApprovalRecord = (row: any) => {
  if (approvalRecordRef.value) {
    approvalRecordRef.value.init(row.id);
  }
};
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  if ('running' === tab.value) {
    getProcessInstanceRunningList();
  } else {
    getProcessInstanceFinishList();
  }
};
/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields();
  queryParams.value.categoryCode = '';
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
const getProcessInstanceRunningList = () => {
  loading.value = true;
  getProcessInstanceRunningByPage(queryParams.value).then((resp) => {
    processInstanceList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};
//分页
const getProcessInstanceFinishList = () => {
  loading.value = true;
  getProcessInstanceFinishByPage(queryParams.value).then((resp) => {
    processInstanceList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};

/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  const id = row.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除id为【' + id + '】的数据项？');
  loading.value = true;
  if ('running' === tab.value) {
    await deleteRuntimeProcessAndHisInst(id).finally(() => (loading.value = false));
    getProcessInstanceRunningList();
  } else {
    await deleteFinishProcessAndHisInst(id).finally(() => (loading.value = false));
    getProcessInstanceFinishList();
  }
  proxy?.$modal.msgSuccess('删除成功');
};
const changeTab = async (data: string) => {
  if ('running' === data) {
    getProcessInstanceRunningList();
  } else {
    getProcessInstanceFinishList();
  }
};
/** 作废按钮操作 */
const handleInvalid = async (row: any) => {
  await proxy?.$modal.confirm('是否确认作废业务id为【' + row.businessKey + '】的数据项？');
  loading.value = true;
  if ('running' === tab.value) {
    let param = {
      processInstanceId: row.id,
      deleteReason: deleteReason.value
    };
    await deleteRuntimeProcessInst(param).finally(() => (loading.value = false));
    getProcessInstanceRunningList();
    proxy?.$modal.msgSuccess('操作成功');
  }
};
const cancelPopover = async (index: any) => {
  (proxy?.$refs[`popoverRef${index}`] as any).hide(); //关闭弹窗
};
</script>
