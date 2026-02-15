<template>
  <el-form ref="basic_form" :model="basicFrom" label-position="top">
    <el-form-item label="是否批量处理">
      <el-switch v-model="basicFrom.multiple"></el-switch>
    </el-form-item>
    <el-form-item :label="basicFrom.multiple ? '选择目录' : '选择文件'">
      <el-input v-model="basicFrom.targetPath" :title="basicFrom.targetPath" readonly>
        <template #append>
          <el-button @click="chooseDir">选择</el-button>
        </template>
      </el-input>
    </el-form-item>
  </el-form>
</template>
<script setup>
  import { watch, reactive, toRaw } from 'vue'
  import { ElMessage } from 'element-plus';

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({})
    }
  })

  const basicFrom = reactive(Object.keys(props.data).length ? props.data : {
    multiple: true,
    targetPath: ""
  });

  watch(() => basicFrom.multiple, () => {
    basicFrom.targetPath = "";
  })

  const chooseDir = () => {
    window.PluginServer[basicFrom.multiple ? 'chooseDir' : 'chooseFile']().then(filePath => {
      if (!filePath) {
        return;
      }
      basicFrom.targetPath = basicFrom.multiple ? filePath : filePath[0];
    });
  }

  const checkValid = () => {
    if (!basicFrom.targetPath) {
      ElMessage.error('请选择文件或目录');
      return false;
    }
    return true;
  }

  const getInfo = () => {
    return toRaw(basicFrom);
  }

  defineExpose({
    checkValid,
    getInfo
  })

</script>
<style lang="less" scoped></style>