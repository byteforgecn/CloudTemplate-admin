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
              <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
                <el-form-item label="模型名称" prop="name">
                  <el-input v-model="queryParams.name" placeholder="请输入模型名称" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="标识Key" prop="key">
                  <el-input v-model="queryParams.key" placeholder="请输入标识Key" clearable @keyup.enter="handleQuery" />
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
                <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" :data="modelList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column fixed align="center" type="index" label="序号" width="50"></el-table-column>
            <el-table-column fixed align="center" prop="name" label="模型名称"></el-table-column>
            <el-table-column align="center" prop="key" label="标识Key"></el-table-column>
            <el-table-column align="center" prop="version" label="版本号" width="90">
              <template #default="scope"> v{{ scope.row.version }}.0</template>
            </el-table-column>
            <el-table-column align="center" prop="metaInfo" label="备注说明" min-width="130"></el-table-column>
            <el-table-column align="center" prop="createTime" label="创建时间" width="160"></el-table-column>
            <el-table-column align="center" prop="lastUpdateTime" label="更新时间" width="160"></el-table-column>
            <el-table-column fixed="right" label="操作" align="center" width="180" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button link type="primary" icon="Pointer" @click="clickDesign(scope.row.id)">设计流程</el-button>
                  </el-col>
                  <el-col :span="1.5">
                    <el-button link type="primary" icon="Download" @click="clickExportZip(scope.row)">导出</el-button>
                  </el-col>
                </el-row>
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button link type="primary" icon="ScaleToOriginal" @click="clickDeploy(scope.row.id, scope.row.key)"> 流程部署 </el-button>
                  </el-col>
                  <el-col :span="1.5">
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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
    <!-- 设计流程开始 -->
    <design ref="designModel" :modelId="modelId" @handleClose="getList" />
    <!-- 设计流程结束 -->
    <!-- 添加模型对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="650px" append-to-body :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模型名称：" prop="name">
          <el-input v-model="form.name" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="标识Key：" prop="key">
          <el-input v-model="form.key" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="流程分类" prop="categoryCode">
          <el-tree-select
            v-model="form.categoryCode"
            :data="categoryOptions"
            :props="{ value: 'categoryCode', label: 'categoryName', children: 'children' }"
            value-key="categoryCode"
            placeholder="请选择流程分类"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="备注：" prop="description">
          <el-input type="textarea" v-model="form.description" maxlength="30" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="Model">
import { listModel, addModel, delModel, modelDeploy } from '@/api/workflow/model';
import { ModelQuery, ModelForm } from '@/api/workflow/model/types';
import { ComponentInternalInstance } from 'vue';
import Design from './design.vue';
import { listCategory } from "@/api/workflow/category";
import { ElTree } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const designModel = ref<InstanceType<typeof Design>>();
const formRef = ref(ElForm);
const queryFormRef = ref(ElForm);

type CategoryOption = {
  categoryCode: string;
  categoryName: string;
  children?: CategoryOption[];
}

const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const modelList = ref<Record<string, any>>([]);
const categoryOptions = ref<CategoryOption[]>([]);
const categoryName = ref('');
const categoryTreeRef = ref(ElTree);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ModelForm = {
  name: '',
  key: '',
  categoryCode: '',
  description: ''
};
const data = reactive<PageData<ModelForm, ModelQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: '',
    key: ''
  },
  rules: {
    name: [{ required: true, message: '模型不能为空', trigger: 'blur' }],
    key: [{ required: true, message: 'key不能为空', trigger: 'blur' }],
    categoryCode: [{ required: true, message: '流程分类不能为空', trigger: 'blur' }]
  }
});
const { queryParams, form, rules } = toRefs(data);

const modelId = ref<string>('');

onMounted(() => {
  getList();
  getTreeselect();
});

/** 节点单击事件 */
const handleNodeClick = (data: ModelForm) => {
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
  listModel(queryParams.value).then((resp) => {
    modelList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};
/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  const id = row.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除模型id为【' + id + '】的数据项？');
  loading.value = true;
  await delModel(id).finally(() => (loading.value = false));
  getList();
  proxy?.$modal.msgSuccess('删除成功');
};
// 流程部署
const clickDeploy = async (id: string, key: string) => {
  await proxy?.$modal.confirm('是否部署模型key为【' + key + '】流程？');
  loading.value = true;
  await modelDeploy(id).finally(() => (loading.value = false));
  getList();
  proxy?.$modal.msgSuccess('部署成功');
};
const handleAdd = () => {
  getTreeselect();
  form.value = { ...initFormData };
  dialog.visible = true;
  dialog.title = '新增模型';
};
/** 提交按钮 */
const submitForm = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      await addModel(form.value);
      proxy?.$modal.msgSuccess('新增成功');
      dialog.visible = false;
      getList();
    }
  });
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  formRef.value.resetFields();
};

// 打开设计流程
const clickDesign = (id: string) => {
  modelId.value = id;
  if (designModel.value) {
    designModel.value.visible = true;
  }
};
// 导出流程模型
const clickExportZip = (data: any) => {
  proxy?.$download.zip('/workflow/model/export/zip/' + data.id, data.name + '-' + data.key);
};
/** 查询流程分类下拉树结构 */
const getTreeselect = async () => {
  const res = await listCategory();
  categoryOptions.value = [];
  const data: CategoryOption = { categoryCode: 'ALL', categoryName: '顶级节点', children: [] };
  data.children = proxy?.handleTree<CategoryOption>(res.data, "id", "parentId");
  categoryOptions.value.push(data);
}
</script>
