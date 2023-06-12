<template>
  <div class="p-2">
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
            <el-button type="primary" plain icon="Plus" size="mini" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
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
        <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="text" size="small" icon="el-icon-thumb" @click="clickDesign(scope.row.id)">设计流程</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="text" size="small" icon="el-icon-download" @click="clickExportZip(scope.row)">导出</el-button>
              </el-col>
            </el-row>
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="text" size="small" icon="el-icon-c-scale-to-original" @click="clickDeploy(scope.row.id, scope.row.key)">
                  流程部署
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="text" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 设计流程开始 -->
    <design ref="designModel" :modelId="modelId" />
    <!-- 设计流程结束 -->
    <!-- 添加模型对话框 -->
    <el-dialog v-model="open" v-if="open" title="新增模型" width="650px" append-to-body :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模型名称：" prop="name">
          <el-input v-model="form.name" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="标识Key：" prop="key">
          <el-input v-model="form.key" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="备注：" prop="description">
          <el-input type="textarea" v-model="form.description" maxlength="30" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="Model">
import { listModel, addModel, delModel, modelDeploy } from '@/api/workflow/model';
import Design from "./design.vue";
import { ComponentInternalInstance } from "vue";

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const designModel = ref<InstanceType<typeof Design>>();
const formRef = ref(ElForm);

// 按钮loading
const buttonLoading = ref(false);
// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref<Array<any>>([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 模型定义表格数据
const modelList = ref([]);
// 查询参数
const queryParams = ref<Record<string, any>>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  key: undefined
});
const modelId = ref<string>('')
//模型表单
const form = ref<Record<string, any>>({})
const open = ref(false)

const rules = ref();

onMounted(() => {
  getList();
});
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {}
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  handleQuery();
}
// 多选框选中数据
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}
//分页
const getList = () => {
  loading.value = true;
  listModel(queryParams.value).then((resp) => {
    modelList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
}
/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  const id = row.id || ids;
  await proxy?.$modal.confirm('是否确认删除模型id为"' + id + '"的数据项？');
  loading.value = true;
  await delModel(id).finally(() => loading.value = false);
  getList();
  proxy?.$modal.msgSuccess('删除成功');
};
// 流程部署
const clickDeploy = async (id: string, key: string) => {
  await proxy?.$modal.confirm('是否部署模型key为【' + key + '】流程？');
  loading.value = true;
  await modelDeploy(id).finally(() => loading.value = false);
  getList();
  proxy?.$modal.msgSuccess('部署成功');
};
const handleAdd = () => {
  form.value = {};
  open.value = true;
};
/** 提交按钮 */
const submitForm = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      await addModel(form.value);
      proxy?.$modal.msgSuccess('新增成功');
      open.value = false;
      getList();
    }
  });
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
</script>
