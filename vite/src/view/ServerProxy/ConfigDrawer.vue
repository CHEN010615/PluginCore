<template>
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
        <!-- <el-form-item label="本地代理">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="使用本地服务器代理设备ip并重定向到本地资源"
            placement="right-start"
          >
            <el-switch v-model="configInfo.localProxy" disabled @change="updateConfig" />
          </el-tooltip>
        </el-form-item> -->
        <el-form-item label="自动打开页面">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="开启服务自动使用默认浏览器访问"
            placement="right-start"
          >
            <el-switch v-model="configInfo.autoOpen" @change="updateConfig" />
          </el-tooltip>
        </el-form-item>
      </el-form>
    </template>
  </el-drawer>
</template>
<script setup>
  import { ref, reactive, toRaw } from 'vue'
  import { ElMessage } from 'element-plus'

  const configDrawer = ref(false);
  const configInfo = reactive({
    localProxy: false,
    autoOpen: false
  });

  const getConfigInfo = async () => {
    let config = await window.PluginServer.getConfig();
    Object.keys(config).forEach(key => {
      configInfo[key] = config[key];
    });
  };

  const openConfigDraw = async () => {
    await getConfigInfo();
    configDrawer.value = true;
  };

  defineExpose({
    openConfigDraw
  })

  const handleConfigClose = () => {
    configDrawer.value = false;
  };

  const updateConfig = async () => {
    let data = toRaw(configInfo);
    try {
      await window.PluginServer.setConfig(data);
    } catch {
      return ElMessage({
        message: '保存失败',
        type: 'error'
      });
    }
    ElMessage({
      message: '保存成功',
      type: 'success'
    });
  };
</script>
<style lang="less" scoped>

</style>