<template>
  <div class="enter-list">
    <el-button
      class="start-btn"
      type="primary"
      @click="handleClick()"
    >开始</el-button>
    <!-- <el-card
      v-else
      v-for="(item, index) in aComponents"
      :key="`${item.component}_${index}`"
      class="component-card"
      @click="handleClick(item.component)"
    >{{ item.name }}</el-card> -->
  </div>
</template>
<script setup>
import { COMPONENTS_INFO } from '@/common/data/constant.js'
import { reactive } from 'vue'

const aComponents = reactive(COMPONENTS_INFO);

const emit = defineEmits(['goTo'])

const handleClick = component => {
  emit('goTo', component)
}

</script>
<style lang="less" scoped>
.enter-list {
  display: flex;
  gap: 50px;
}
.component-card {
  cursor: pointer;
}
.start-btn {
  height: 60px;
  width: 150px;
  border-radius: 10px;
}
</style>