<template>
  <div class="output-content">
    <el-table :data="tableData" table-layout="fixed" stripe show-overflow-tooltip class="output-table">
      <el-table-column type="index" />
      <el-table-column prop="relativePath" label="源文件" />
      <el-table-column prop="targetPath" label="输出文件" />
      <el-table-column prop="status" label="状态" min-width="12px">
        <template #default="{ row }">
          <el-result v-if="row.success" class="status" :icon="row.status" />
          <el-tooltip v-else class="box-item" effect="dark" :content="row.error">
            <el-result class="status" :icon="row.status" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup>
  import { reactive, onMounted } from 'vue'

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({})
    }
  });

  const tableData = reactive([]);

  onMounted(() => {
    // 从 basicForm 组件获取目标路径，计算根路径并获取文件列表
    const { targetPath = "" } = JSON.parse(sessionStorage.getItem('basicForm') || "{}");
    // 如果没有目标路径，直接返回
    if (!targetPath) {
      return;
    }
    // 计算根路径，获取文件列表
    const rootPath = `${targetPath.split('/').slice(0, -1).join('/')}/`;
    // 获取文件列表并初始化表格数据
    PluginServer.readAllFiles(targetPath).then(fileList => {
      fileList.forEach(file => {
        const relativePath = file.replace(rootPath, '');
        tableData.push({
          filePath: file,
          relativePath,
          status: 'info',
          targetPath: '--',
          success: true
        });
      });
    });
  })

  /**
   * 更新表格数据
   * @param result 压缩结果数组，每个元素包含 filePath、success、outputPath 和 error 字段
   */
  const updateTable = result => {
    result.forEach(item => {
      const { filePath, success, outputPath, error } = item;
      const current = tableData.find(i => i.filePath === filePath);
      if (current) {
        current.success = success;
        current.status = success ? 'success' : 'error';
        current.error = error || '';
        current.targetPath = outputPath || '--';
      }
    })
  }

  defineExpose({
    updateTable
  })
</script>
<style lang="less" scoped>
  .output-content {
    height: 100%;
    width: 100%;
    padding: 10px;

    .output-table {
      height: 100%;
      width: 100%;
  
      ::v-deep(.status) {
        width: 20px;
        height: 20px;
        padding: 5px;

        .el-result__icon {
          width: 20px;
          height: 20px;

          svg {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
  }
</style>