<template>
  <div class="top-bar">
    <div class="back-title">
      <ArrowLeft v-if="showBack" class="icon-btn" @click="handleBack()" />
      <div class="title">{{ componentTitle }}</div>
    </div>
    <div class="operation">
      <slot name="default" />
    </div>
  </div>
  <el-divider />
</template>

<script setup>
  import { ArrowLeft } from '@element-plus/icons-vue'

  const props = defineProps({
    componentTitle: String,
    showBack: {
      type: Boolean,
      default: true
    }
  })

  const emit = defineEmits(['back'])

  const handleBack = component => {
    emit('back')
  }
</script>

<style lang="less" scoped>
  .top-bar {
    width: 100%;
    margin-top: 20px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .back-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 5px;

      .title {
        font-size: 24px;
        font-weight: bold;
        line-height: 34px;
      }
    }


    .operation button {
      float: right;
      margin-left: 20px;
    }
  }
</style>