<template>
  <div class="container">
    <el-steps :active="active" finish-status="success" simple>
      <el-step v-for="item in stepList" :title="item.title" :icon="item.icon" />
    </el-steps>
    <div class="main-content">
      <MyTransition :slots="stepTotal" :step="active">
        <template v-for="(item, index) in stepComponents" v-slot:[getSlotName(index)]>
          <component
            :is="item.component"
            :ref="el => setRef(el, index)"
            :data="getData(item.name)"
            :class="index === (stepTotal - 1) ? 'output-list' : 'basic-form'"
          />
        </template>
      </MyTransition>
    </div>
    <el-button-group class="btn-group">
      <el-tooltip class="box-item" effect="dark" content="上一步" v-if="active !== 0 && !bFinish">
        <el-button @click="lastStep" type="default" :icon="ArrowLeft" />
      </el-tooltip>
      <el-tooltip class="box-item" effect="dark" content="下一步" v-if="!bLastStep && !bFinish">
        <el-button @click="nextStep" type="primary" :icon="ArrowRight" />
      </el-tooltip>
      <el-tooltip class="box-item" effect="dark" content="开始压缩" v-if="bLastStep && !bFinish">
        <el-button @click="confirm" type="success">
          <img src="@/common/assets/compress.svg" />
        </el-button>
      </el-tooltip>
      <el-tooltip class="box-item" effect="dark" content="重置" v-if="bFinish">
        <el-button @click="reset" type="info">
          <img src="@/common/assets/reset.svg" />
        </el-button>
      </el-tooltip>
    </el-button-group>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  import { ArrowLeft, ArrowRight, FolderAdd, Picture, Setting } from '@element-plus/icons-vue';
  import { ElLoading } from 'element-plus'

  import BasicForm from './components/basicForm.vue';
  import SettingForm from './components/settingForm.vue';
  import OutputList from './components/outputList.vue';

  const steps = [{
    name: 'basicForm',
    title: '选择文件',
    icon: FolderAdd,
    component: BasicForm
  }, {
    name: 'settingForm',
    title: '参数配置',
    icon: Setting,
    component: SettingForm
  }, {
    name: 'outputList',
    title: '输出',
    icon: Picture,
    component: OutputList
  }];

  const stepList = steps.map(item => {
    const { title, icon } = item;
    return { title, icon };
  })

  const stepComponents = steps.map(item => {
    const { name, component } = item;
    return { name, component };
  })

  const conponentRefs = [];

  const setRef =  (el, index) => {
    conponentRefs[index] = el;
  }

  const getSlotName = index => {
    return `slot${(index + 1)}`;
  }

  const stepTotal = computed(() => stepComponents.length);
  const active = ref(0);
  const bFinish = ref(false);

  const nextStep = () => {
    const currentComponent = conponentRefs[active.value];
    if (!currentComponent.checkValid()) {
      return;
    }
    sessionStorage.setItem(steps[active.value].name, JSON.stringify(currentComponent.getInfo()));
    if (++active.value >= stepTotal.value) {
      active.value = 0;
    }
  }

  const lastStep = () => {
    if (--active.value <= 0) {
      active.value = 0;
    }
  }

  const getData = name => {
    return JSON.parse(sessionStorage.getItem(name) || '{}');
  }

  const confirm = async () => {
    let options = {};
    steps.forEach(item => {
      options = {
        ...options,
        ...getData(item.name)
      };
      sessionStorage.removeItem(item.name);
    })
    const loading = ElLoading.service({ fullscreen: true })
    const result = await PluginServer.imageTransform(options);
    const currentComponent = conponentRefs[active.value];
    currentComponent.updateTable(result);
    loading.close();
    bFinish.value = true;
  }

  const reset = () => {
    active.value = 0;
    bFinish.value = false;
  }

  const bLastStep = computed(() => {
    return active.value === (stepTotal.value - 1)
  })
  
</script>

<style lang="less" scoped>
  @import "@/style/global.less";
  
  .container {
    height: calc(100vh - (@body-padding-top * 2));
    width: calc(100vw - (@body-padding-left * 2));
  }

  .main-content {
    height: calc(100% - 78px);
    width: 100%;
  }

  .basic-form {
    width: 400px;
  }

  .output-list {
    width: 100%;
    height: 100%;
  }

  .btn-group {
    float: right;
    
    ::v-deep(.el-icon) {
      font-size: 20px;
      font-weight: bold;
    }
  }
</style>