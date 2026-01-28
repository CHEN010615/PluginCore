<template>
  <el-drawer
    v-model="drawerVisible"
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
        <el-form-item label="代理端口" prop="proxyPort">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="代理服务器端口"
            placement="right-start"
          >
            <el-input v-model="serverInfo.proxyPort" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="设备ip" prop="deviceAddr">
          <el-input v-model="serverInfo.deviceAddr" />
        </el-form-item>
        <el-form-item label="目录" prop="projectDir">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="代理资源目录，4.0需要指定到webs，5.0需要指定到dist"
            placement="right-start"
          >
            <el-input v-model="serverInfo.projectDir" :title="serverInfo.projectDir" readonly>
              <template #append>
                <el-button @click="chooseDir">选择</el-button>
              </template>
            </el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="插件">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="是否需要使用插件"
            placement="right-start"
          >
            <el-switch v-model="serverInfo.plugin" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="插件端口" prop="pluginPort" v-if="serverInfo.plugin">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="用于转发设备web和插件的交互"
            placement="right-start"
          >
            <el-input v-model="serverInfo.pluginPort" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="VUE">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="是否为5.0项目，用于校验资源目录"
            placement="right-start"
          >
            <el-switch v-model="serverInfo.vue"></el-switch>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="本地端口" prop="localPort" v-if="serverInfo.vue">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="本地项目服务端口，用于校验项目服务是否运行"
            placement="right-start"
          >
            <el-input v-model="serverInfo.localPort"></el-input>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="HTTPS">
          <el-switch v-model="serverInfo.https"></el-switch>
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
</template>
<script setup>
  import { ref, watch, reactive, nextTick, computed } from 'vue'
  import { validateNull, validateRange, validateIpAddress } from '@/common/utils/validate.js'

  import ServerProxy from './ServerProxy.js'

  const SP = reactive(ServerProxy);

  const props = defineProps({
    info: Object,
    shows: Object
  });

  const drawerVisible = ref(false);
  
  const bAdd = computed(() => {
    return SP.curServerID === 0;
  })

  const serverInfo = reactive(SP.server);

  const rules = reactive({
    name: [],
    proxyPort: [validateNull(), validateRange(1, 65535)],
    pluginPort: [validateNull(), validateRange(1, 65535)],
    localPort: [validateNull(), validateRange(1, 65535)],
    deviceAddr: [validateNull(), validateIpAddress()],
    projectDir: [validateNull()]
  });

  
  const serverForm = ref(null);

  const addServer = async () => {
    await SP.updateServerInfo();
    drawerVisible.value = true;
    await nextTick();
    serverForm.value.resetFields();
  };

  const editServer = async (id) => {
    await SP.updateServerInfo(id);
    drawerVisible.value = true;
  };

  defineExpose({
    addServer,
    editServer
  })

  const chooseDir = async () => {
    let dir = await window.PluginServer.chooseDir();
    try {
      await window.PluginServer.checkProjectDir(dir);
    } catch (e) {
      return ElMessage({
        type: "error",
        message: e.message
      });
    }
    serverInfo.projectDir = dir;
  };

  const handleEditClose = () => {
    drawerVisible.value = false;
  };

  const confirm = () => {
    serverForm.value.validate().then(bValid => {
      return SP[bAdd.value ? 'addServer' : 'modifyServer']();
    }).then(() => {
      drawerVisible.value = false;
      SP.getServerList();
    }).catch(errorItems => {
      console.log(errorItems);
    });
  };
</script>
<style lang="less" scoped>

</style>