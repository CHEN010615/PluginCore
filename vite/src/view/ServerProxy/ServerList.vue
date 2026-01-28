<template>
  <div class="container">
    <TopBar component-title="本地代理" @back="handleBack()" :show-back="false">
      <el-button type="info" plain :icon="Setting" @click="openConfigDraw">配置</el-button>
      <el-button type="danger" plain :icon="Delete" @click="deleteServer">删除</el-button>
      <el-button type="primary" plain :icon="Plus" @click="addServer">添加</el-button>
    </TopBar>
    <div class="server-container">
      <el-scrollbar view-class="server-list" v-if="SP.serverList.length">
        <ServerCard
          v-for="item in SP.serverList"
          :key="item"
          :params="item.params"
          :info="item.info"
          @edit="editServer"
          @apiProxy="apiProxy"
        ></ServerCard>
      </el-scrollbar>
      <el-empty v-else class="empty-data" description="无数据" />
    </div>
    <ServerDrawer
      ref="serverDrawer"
      :server-info="SP.editInfo"
    />
    <ConfigDrawer
      ref="configDrawer"
    />
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { Plus, Delete, Setting, ArrowLeft } from '@element-plus/icons-vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  
  import TopBar from '@/components/TopBar.vue'
  import ServerDrawer from './ServerDrawer.vue'
  import ServerCard from './ServerCard.vue'
  import ConfigDrawer from './ConfigDrawer.vue'

  import ServerProxy from './ServerProxy.js'

  const SP = reactive(ServerProxy);

  onMounted(() => {
    SP.init();
    SP.getServerList();
  });


  const vServerListDirective = {
    mounted: () => {
      console.log('list mounted');
    }
  };

  const emit = defineEmits(['back', 'goTo'])

  const handleBack = component => {
    emit('back')
  }

  const serverDrawer = ref(null);

  const addServer = () => {
    serverDrawer.value.addServer();
  }

  const editServer = (id) => {
    serverDrawer.value.editServer(id);
  };

  const deleteServer = () => {
    let deleteId = SP.getCheckedList();
    if (!deleteId.length) {
      ElMessage({
        type: "warning",
        message: "请选择需要删除的数据"
      });
      return;
    }
    ElMessageBox.confirm('确认删除？').then(() => {
      return window.PluginServer.deleteServer({ id: deleteId });
    }).then(() => {
      SP.getServerList();
    });
  };

  const configDrawer = ref(null);

  const openConfigDraw = () => {
    configDrawer.value.openConfigDraw();
  };

  const apiProxy = (serverID) => {
    sessionStorage.setItem('serverID', serverID);
    emit('goTo', 'ApiProxy');
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

  ::v-deep(.server-list) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(365px, 365px));
    grid-template-rows: inherit;
    gap: 10px;
  }
</style>