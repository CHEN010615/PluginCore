<template>
  <el-form ref="setting_form" :model="settingForm" label-position="top">
    <el-form-item label="压缩图片大小">
      <el-slider v-model="settingForm.fileSize" :min="1" :max="1024" :step="1" show-input
        :format-tooltip="value => `${value} Kb`" />
    </el-form-item>
    <el-form-item label="输出路径">
      <el-input v-model="settingForm.outputPath" :title="settingForm.outputPath" readonly>
        <template #append>
          <el-button @click="chooseDir(true)">选择</el-button>
        </template>
      </el-input>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { reactive, toRaw } from 'vue'
import { ElMessage } from 'element-plus';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

const getDefaultOutputPath = () => {
  const { targetPath = '' } = JSON.parse(sessionStorage.getItem('basicForm') || '{}');
  const defaultPath = `${targetPath.split('/').slice(0, -1).join('/')}/output`;
  return defaultPath;
}

const settingForm = reactive(Object.keys(props.data).length ? props.data : {
  fileSize: 40,
  sizeUnite: 'kb',
  outputPath: getDefaultOutputPath()
})

const chooseDir = () => {
  window.PluginServer.chooseDir().then(filePath => {
    if (!filePath) {
      return;
    }
    settingForm.outputPath = filePath;
  });
}

const checkValid = () => {
  if (!settingForm.outputPath) {
    ElMessage.error('请选择输出目录');
    return false;
  }
  return true;
}

const getInfo = () => {
  return toRaw(settingForm);
}

defineExpose({
  checkValid,
  getInfo
})

</script>
<style lang="less" scoped></style>