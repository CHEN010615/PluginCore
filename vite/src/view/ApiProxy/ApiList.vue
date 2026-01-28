<template>
  <div class="container">
    <TopBar component-title="协议代理" @back="handleBack()">
      <el-button type="danger" plain :icon="Delete" @click="deleteApi">删除</el-button>
      <el-button type="primary" plain :icon="Plus" @click="addApi">添加</el-button>
    </TopBar>
    协议代理
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { Plus, Delete } from '@element-plus/icons-vue'
  // import { ElMessageBox, ElMessage } from 'element-plus'

  import TopBar from '@/components/TopBar.vue'

  import ServerProxy from '../ServerProxy/ServerProxy.js'

  const SP = reactive(ServerProxy);

  const emit = defineEmits(['back'])

  const handleBack = component => {
    emit('back')
  }

  const addApi = () => {
    //
  }

  const deleteApi = () => {
    //
  }
</script>

<style lang="less" scoped>
  @import "@/common/less/global.less";

  .container {
    height: 100%;
    min-width: 600px;
    min-height: 400px;

    .server-container {
      height: calc(100% - 99px);
      width: 100%;

      .empty-data {
        height: 100%;
      }
    }

    .draw-header {
      font-size: 20px;
      font-weight: bold;
    }
  }
</style>