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
          <div class="mb-[10px]" v-show="showSearch">
            <el-card shadow="hover">
              <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="120px">
                <el-form-item label="流程定义名称" prop="name">
                  <el-input v-model="queryParams.name" placeholder="请输入流程定义名称" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="流程定义KEY" prop="key">
                  <el-input v-model="queryParams.key" placeholder="请输入流程定义KEY" clearable @keyup.enter="handleQuery" />
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
              <el-col :span="1.5"> </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" :data="processDefinitionList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column fixed align="center" type="index" label="序号" width="50"></el-table-column>
            <el-table-column fixed align="center" prop="name" label="流程定义名称"></el-table-column>
            <el-table-column align="center" prop="key" label="标识Key"></el-table-column>
            <el-table-column align="center" prop="version" label="版本号" width="90">
              <template #default="scope"> v{{ scope.row.version }}.0</template>
            </el-table-column>
            <el-table-column align="center" prop="resourceName" label="流程XML" min-width="80" :show-overflow-tooltip="true">
              <template #default="scope">
                <el-link type="primary" @click="clickPreviewXML(scope.row.id)">{{ scope.row.resourceName }}</el-link>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="diagramResourceName" label="流程图片" min-width="80" :show-overflow-tooltip="true">
              <template #default="scope">
                <el-link type="primary" @click="clickPreviewImg(scope.row.id)">{{ scope.row.diagramResourceName }}</el-link>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="suspensionState" label="状态" min-width="70">
              <template #default="scope">
                <el-tag type="success" v-if="scope.row.suspensionState==1">激活</el-tag>
                <el-tag type="danger" v-else>挂起</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="deploymentTime" label="部署时间" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column fixed="right" label="操作" align="center" width="200" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button link type="primary" :icon="scope.row.suspensionState === 1?'Lock':'Unlock'" @click="handleProcessDefState(scope.row)">
                      {{ scope.row.suspensionState === 1?"挂起流程":"激活流程" }}
                    </el-button>
                  </el-col>
                  <el-col :span="1.5">
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                  </el-col>
                </el-row>
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button link type="primary" icon="Sort" @click="handleConvertToModel(scope.row)"> 转换模型 </el-button>
                  </el-col>
                  <el-col :span="1.5">
                    <el-button link type="primary" icon="Pointer" @click="openHandleStartWorkFlow(scope.row)">启动流程</el-button>
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
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>
    <!-- 预览图片或xml -->
    <process-preview ref="previewRef" :url="url" :type="type" />

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="30%">
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleStartWorkFlow"> 提交流程 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="processDefinition">
import {
  listProcessDefinition,
  processDefinitionImage,
  processDefinitionXml,
  deleteProcessDefinition,
  updateProcessDefState,
  convertToModel
} from '@/api/workflow/processDefinition';
import { startWorkFlow, completeTask } from '@/api/workflow/task';
import { ComponentInternalInstance } from 'vue';
import ProcessPreview from './components/processPreview.vue';
import { listCategory } from '@/api/workflow/category';
import { CategoryVO } from '@/api/workflow/category/types';
import { ElTree } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const previewRef = ref<InstanceType<typeof ProcessPreview>>();
const queryFormRef = ref(ElForm);

type CategoryOption = {
  categoryCode: string;
  categoryName: string;
  children?: CategoryOption[];
};

const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const processDefinitionList = ref<Record<string, any>>([]);
const url = ref<Array<string>>([]);
const type = ref<string>('');
const categoryOptions = ref<CategoryOption[]>([]);
const categoryName = ref('');
const categoryTreeRef = ref(ElTree);

const dialog = reactive<DialogOption>({
  visible: false,
  title: '启动'
});

// 查询参数
const queryParams = ref<Record<string, any>>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  key: undefined,
  categoryCode: undefined
});

const submitFormData = ref<Record<string, any>>({
  businessKey: '',
  processKey: '',
  variables: {}
});

onMounted(() => {
  getList();
  getTreeselect();
});

/** 节点单击事件 */
const handleNodeClick = (data: CategoryVO) => {
  queryParams.value.categoryCode = data.categoryCode;
  if (data.categoryCode === 'ALL') {
    queryParams.value.categoryCode = '';
  }
  handleQuery();
};
/** 通过条件过滤节点  */
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.categoryName.indexOf(value) !== -1;
};
/** 根据名称筛选部门树 */
watchEffect(
  () => {
    categoryTreeRef.value.filter(categoryName.value);
  },
  {
    flush: 'post' // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);

/** 查询流程分类下拉树结构 */
const getTreeselect = async () => {
  const res = await listCategory();
  categoryOptions.value = [];
  const data: CategoryOption = { categoryCode: 'ALL', categoryName: '顶级节点', children: [] };
  data.children = proxy?.handleTree<CategoryOption>(res.data, 'id', 'parentId');
  categoryOptions.value.push(data);
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
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
const getList = () => {
  loading.value = true;
  listProcessDefinition(queryParams.value).then((resp) => {
    processDefinitionList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};
//预览图片
const clickPreviewImg = (id: string) => {
  if (previewRef.value) {
    url.value = [];
    type.value = 'png';
    url.value.push(processDefinitionImage(id));
    previewRef.value.init();
  }
};
//预览xml
const clickPreviewXML = (id: string) => {
  loading.value = true;
  type.value = 'xml';
  processDefinitionXml(id).then((response) => {
    if (previewRef.value) {
      url.value = [];
      url.value = response.data.xml;
      loading.value = false;
      previewRef.value.init();
    }
  });
};
/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  await proxy?.$modal.confirm('是否确认删除流程定义key为【' + row.key + '】的数据项？');
  loading.value = true;
  await deleteProcessDefinition(row.deploymentId, row.id).finally(() => (loading.value = false));
  getList();
  proxy?.$modal.msgSuccess('删除成功');
};
/** 挂起/激活 */
const handleProcessDefState = async (row: any) => {
  let msg = '';
  if (row.suspensionState === 1) {
    msg = `暂停后，此流程下的所有任务都不允许往后流转，您确定挂起【${row.name || row.key}】吗？`;
  } else {
    msg = `启动后，此流程下的所有任务都允许往后流转，您确定激活【${row.name || row.key}】吗？`;
  }
  await proxy?.$modal.confirm(msg);
  loading.value = true;
  await updateProcessDefState(row.id).finally(() => (loading.value = false));
  getList();
  proxy?.$modal.msgSuccess('操作成功');
};
/** 流程定义转换为模型 */
const handleConvertToModel = async (row: any) => {
  await proxy?.$modal.confirm('是否确认转换流程定义key为【' + row.key + '】的数据项？');
  await convertToModel(row.id).finally(() => (loading.value = false));
  getList();
  proxy?.$modal.msgSuccess('操作成功');
};

/** 打开启动流程弹窗 */
const openHandleStartWorkFlow = async (row: any) => {
  submitFormData.value.processKey = row.key;
  submitFormData.value.businessKey = Date.parse(new Date());
  submitFormData.value.variables = {
    userList:[1,2]
  }
  dialog.visible = true;
};
/** 启动流程 */
const handleStartWorkFlow = async () => {
  await proxy?.$modal.confirm('是否确认启动流程？');
  startWorkFlow(submitFormData.value).then((response) => {
    handleCompleteTask(response.data.taskId);
  });
};
/** 办理流程 */
const handleCompleteTask = async (taskId: string) => {
  let param = {
    taskId: taskId
  };
  await completeTask(param).finally(() => (loading.value = false));
  getList();
  proxy?.$modal.msgSuccess('操作成功');
  dialog.visible = false;
};
</script>
