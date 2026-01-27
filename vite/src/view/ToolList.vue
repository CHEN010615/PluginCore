<template>
  <div class="container">
    <div class="top-bar">
      <div class="title">自定义代理</div>
      <div class="operation">
        <el-button type="info" plain :icon="Setting" @click="openConfigDraw">配置</el-button>
        <el-button type="danger" plain :icon="Delete" @click="deleteServer">删除</el-button>
        <el-button type="primary" plain :icon="Plus" @click="addServer">添加</el-button>
      </div>
    </div>
    <el-divider />
    <div class="server-container">
      <el-scrollbar view-class="server-list" v-if="serverList.length">
        <ToolCard
          v-for="item in serverList"
          :key="item"
          :shows="cardShowInfo"
          :params="item.params"
          :info="item.info"
          @edit="editServer"
          @open="openDir"
          @update="updateEnable"
        ></ToolCard>
      </el-scrollbar>
      <el-empty v-else class="empty-data" description="无数据" />
    </div>
    <el-drawer
      v-model="editDrawer"
      :title="bAdd ? '添加' : '修改'"
      direction="rtl"
      :before-close="handleEditClose"
    >
      <template #header>
        <div class="draw-header">{{ bAdd ? "添加" : "修改" }}</div>
      </template>
      <template #default>
        <el-form
          ref="serverForm"
          label-position="top"
          label-width="auto"
          :model="serverInfo"
          :rules="rules"
        >
          <el-form-item label="名称" prop="name">
            <el-input v-model="serverInfo.name" />
          </el-form-item>
          <el-form-item label="代理端口" prop="port">
            <el-input v-model="serverInfo.port" />
          </el-form-item>
          <el-form-item label="插件端口" prop="pluginPort" v-if="configInfo.localProxy">
            <el-input v-model="serverInfo.pluginPort" />
          </el-form-item>
          <el-form-item label="设备ip" prop="deviceAddress">
            <el-input v-model="serverInfo.deviceAddress" />
          </el-form-item>
          <el-form-item label="目录" prop="dir">
            <el-input v-model="serverInfo.dir" :title="serverInfo.dir" readonly>
              <template #append>
                <el-button @click="chooseDir">选择</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="handleEditClose">取消</el-button>
          <el-button type="primary" @click="confirm">确认</el-button>
        </div>
      </template>
    </el-drawer>
    <el-drawer
      v-model="configDrawer"
      title="配置"
      direction="rtl"
      :before-close="handleConfigClose"
    >
      <template #header>
        <div class="draw-header">{{ "配置" }}</div>
      </template>
      <template #default>
        <el-form
          ref="configForm"
          label-position="top"
          label-width="auto"
          :model="configInfo"
        >
          <el-form-item label="本地代理">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="使用本地服务器代理设备ip并重定向到本地资源"
              placement="right-start"
            >
              <el-switch v-model="configInfo.localProxy" disabled @change="updateConfig" />
            </el-tooltip>
          </el-form-item>
          <el-form-item label="自动打开页面">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="开启服务自动打开默认浏览器"
              placement="right-start"
            >
              <el-switch v-model="configInfo.autoOpen" @change="updateConfig" />
            </el-tooltip>
          </el-form-item>
        </el-form>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
  import { ref, watch, reactive, nextTick } from 'vue'
  import { Plus, Delete, Setting } from '@element-plus/icons-vue'
  import { ElMessageBox, ElMessage, ElForm } from 'element-plus'
  import ToolCard from './components/ToolCard.vue'
  import { validateNull, validateRange, validateIpAddress } from '@/common/validate.js';

  const vServerListDirective = {
    mounted: () => {
      console.log('list mounted');
    }
  };

  const editDrawer = ref(false);
  const configDrawer = ref(false);
  const serverForm = ref(null);
  const serverList = reactive([]);
  const serverInfo = reactive({
    name: "",
    port: 1,
    pluginPort: 33686,
    deviceAddress: "",
    dir: ""
  });
  const rules = reactive({
    name: [],
    port: [validateNull(), validateRange(1, 65535)],
    pluginPort: [validateNull(), validateRange(1, 65535)],
    deviceAddress: [validateNull(), validateIpAddress()],
    dir: [validateNull()]
  });
  const configInfo = reactive({
    localProxy: false,
    autoOpen: false
  });
  const cardShowInfo = {
    port: "端口",
    deviceAddress: "设备ip",
    dir: "目录",
  };
  let bAdd = ref(true);
  let iCurId = 0;

  const getData = async () => {
    let data = await window.webServer.getServerList();
    // console.log(data);

    serverList.length = 0;

    data.forEach(item => {
      serverList.push({
        params: {
          id: item.id,
          enable: item.running,
          checked: false
        },
        info: {
          name: item.name,
          port: item.port,
          pluginPort: item.pluginPort,
          deviceAddress: item.deviceAddress,
          dir: item.dir
        }
      })
    });
  };
  getData();

  const addServer = async () => {
    await getConfigInfo();
    bAdd.value = true;
    serverInfo.name = "";
    serverInfo.port = 1;
    serverInfo.pluginPort = 33686;
    serverInfo.deviceAddress = "";
    serverInfo.dir = "";
    editDrawer.value = true;
    nextTick(() => {
      serverForm.value.resetFields();
    });
  };

  const deleteServer = () => {
    let deleteId = serverList.filter(item => item.params.checked).map(item => item.params.id);
    if (!deleteId.length) {
      ElMessage({
        type: "warning",
        message: "请选择需要删除的数据"
      });
      return;
    }
    ElMessageBox.confirm('确认删除？').then(() => {
      return window.webServer.deleteServer({ id: deleteId });
    }).then(() => {
      getData();
    });
  };

  const chooseDir = async () => {
    let dir = await window.webServer.chooseDir();
    serverInfo.dir = dir;
  };

  const runServer = (id, value) => {
    return window.webServer.runServer(id);
  };

  const stopServer = (id, value) => {
    return window.webServer.stopServer(id);
  };

  const updateEnable = (id, value) => {
    let server = serverList.find(item => id === item.params.id);
    let pro = value ? runServer(id) : stopServer(id);
    pro.catch(e => {
      console.log(e);
      ElMessage({
        type: "warning",
        message: e
      });
      server.params.enable = !value;
    });
  };

  const handleEditClose = () => {
    editDrawer.value = false;
  };

  const confirm = () => {
    serverForm.value.validate().then(bValid => {
      let data = {
        name: serverInfo.name,
        port: parseInt(serverInfo.port, 10),
        pluginPort: parseInt(serverInfo.pluginPort, 10),
        deviceAddress: serverInfo.deviceAddress,
        dir: serverInfo.dir
      }
      if (bAdd.value) {
        return window.webServer.addServer(data);
      }
      data.id = iCurId;
      return window.webServer.updateServer(data);
    }).then(() => {
      editDrawer.value = false;
      getData();
    }).catch(errorItems => {
      console.log(errorItems);
    });
  };

  const editServer = async (id) => {
    await getConfigInfo();
    iCurId = id;
    bAdd.value = false;
    let server = serverList.find(item => id === item.params.id);
    editDrawer.value = true;
    nextTick(() => {
      serverInfo.name = server.info.name;
      serverInfo.port = server.info.port;
      serverInfo.pluginPort = server.info.pluginPort;
      serverInfo.deviceAddress = server.info.deviceAddress;
      serverInfo.dir = server.info.dir;
    });
  };

  const openDir = (id) => {
    let server = serverList.find(item => item.params.id === id);
    window.webServer.openDir(server.info.dir);
    console.log(server.info.dir);
  };

  const getConfigInfo = async () => {
    let config = await window.webServer.getConfig();
    Object.keys(config).forEach(key => {
      configInfo[key] = config[key];
    });
  };

  const openConfigDraw = async () => {
    await getConfigInfo();
    configDrawer.value = true;
  };

  const handleConfigClose = () => {
    configDrawer.value = false;
  };

  const updateConfig = async () => {
    let data = JSON.parse(JSON.stringify(configInfo));
    await window.webServer.setConfig(data);
    await window.webServer.initServerList();
    getData();
  };
</script>

<style lang="less" scoped>
  .container {
    height: 100%;
    min-width: 600px;
    min-height: 400px;

    .top-bar {
      width: 100%;
      margin-top: 20px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 24px;
        font-weight: bold;
      }

      .operation button {
        float: right;
        margin-left: 20px;
      }
    }

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
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: inherit;
    gap: 10px;
  }
</style>