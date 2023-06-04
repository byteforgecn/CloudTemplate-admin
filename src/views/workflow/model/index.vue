<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
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
      </div>
    </transition>
    <el-card shadow="never">
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
          <template #default="scope"> v{{scope.row.version}}.0</template>
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
                <el-button type="text" size="small" icon="el-icon-c-scale-to-original" @click="clickDeploy(scope.row.id,scope.row.key)"
                  >流程部署</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button type="text" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 设计流程开始 -->
    <design ref="designModel" :modelId="modelId" />
    <!-- 设计流程结束 -->
    <!-- 添加模型对话框 -->
    <el-dialog v-model="open" v-if="open" title="新增模型" width="650px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
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

<script>
import { listModel, addModel, delModel, modelDeploy } from '@/api/workflow/model';
import design from './design';
export default {
  name: 'Model', // 和对应路由表中配置的name值一致
  components: { design },
  data() {
    return {
      // 按钮loading
      buttonLoading: false,
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 模型定义表格数据
      modelList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        key: undefined
      },
      modelId: null, //
      //模型表单
      form: {},
      open: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {}
      this.queryParams.pageNum = 1;
      this.queryParams.pageSize = 10;
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    //分页
    getList() {
      this.loading = true;
      listModel(this.queryParams).then((response) => {
        this.modelList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除模型id为"' + ids + '"的数据项？')
        .then(() => {
          this.loading = true;
          return delModel(ids);
        })
        .then(() => {
          this.loading = false;
          this.getList();
          this.$modal.msgSuccess('删除成功');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 流程部署
    clickDeploy(id, key) {
      this.$modal
        .confirm('是否部署模型key为【' + key + '】流程？')
        .then(() => {
          this.loading = true;
          return modelDeploy(id);
        })
        .then(() => {
          this.loading = false;
          this.getList();
          this.$modal.msgSuccess('部署成功');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleAdd() {
      this.form = {};
      this.open = true;
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.buttonLoading = true;
          addModel(this.form).then((response) => {
            this.$modal.msgSuccess('新增成功');
            this.open = false;
            this.getList();
          });
        }
      });
    },
    // 打开设计流程
    clickDesign(id) {
      this.modelId = id;
      this.$refs.designModel.visible = true;
    },
    // 关闭设计流程
    closeBpmn() {
      this.getList();
      this.$refs.designModel.visible = false;
    },
    handleClose() {
      this.$confirm('请记得点击保存按钮，确定关闭设计窗口?', '确认关闭', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$refs.designModel.visible = false;
          // 刷新数据
          this.getList();
        })
        .catch(() => {});
    },
    // 导出流程模型
    clickExportZip(data) {
      this.$download.zip('/workflow/model/export/zip/' + data.id, data.name + '-' + data.key);
    }
  }
};
</script>
