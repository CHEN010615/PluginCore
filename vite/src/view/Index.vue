<template>
  <MyTrasition :slots="3" :reverse="bReverse">
    <template #slot1 v-if="szShowComponent === 'Start'">
      <Start @goTo="goTo"></Start>
    </template>
    <template #slot2 v-if="szShowComponent === 'ServerProxy'">
      <ServerList class="component-container" @back="lastStep()" @goTo="goTo"></ServerList>
    </template>
    <template #slot3 v-if="szShowComponent === 'ApiProxy'">
      <ApiList class="component-container" @back="lastStep()"></ApiList>
    </template>
  </MyTrasition>
</template>
<script setup>
import { ref, reactive, nextTick, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

import MyTrasition from '@/components/Transition.vue'
import Start from '@/view/Start/Start.vue'
import ServerList from '@/view/ServerProxy/ServerList.vue'
import ApiList from '@/view/ApiProxy/ApiList.vue'

import { COMPONENTS } from '@/common/data/constant.js'

const aComponents = reactive(["Start", ...COMPONENTS]);
const iStep = ref(2);
const szShowComponent = ref(aComponents[iStep.value - 1]);
const bReverse = ref(false);

const nextStep = () => {
  iStep.value++;
}

const lastStep = () => {
  iStep.value--;
}

const goTo = component => {
  if (!component) {
    return nextStep();
  }
  const index = aComponents.findIndex(item => item === component) + 1;
  // if (index >= aComponents.length) {
  //   return ElMessage({
  //     message: '暂不支持',
  //     type: 'warning'
  //   });
  // }
  iStep.value = index;
}

watch(iStep, (to, from) => {
  bReverse.value = to < from;
  nextTick(() => {
    szShowComponent.value = aComponents[to - 1];
  });
});

</script>
<style lang="less" scoped>
  .component-container {
    width: 100%;
    height: 100%;
  }
</style>