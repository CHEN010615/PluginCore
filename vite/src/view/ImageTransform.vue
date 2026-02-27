<template>
  <div class="container">
    <el-steps :active="active" finish-status="success" simple>
      <el-step v-for="item in stepList" :key="item.title" :title="item.title" :icon="item.icon" />
    </el-steps>
    <div class="main-content">
      <MyTransition :slots="stepTotal" :step="active">
        <template v-for="(item, index) in stepComponents" :key="item.name" v-slot:[getSlotName(index)]>
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
  import { ElLoading, ElNotification } from 'element-plus'

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

  const transformTime = (date1, date2) => {
    // 计算毫秒差，并取绝对值以确保结果为正
    let diffInMs = Math.abs(date2 - date1);

    // 计算总秒数
    const totalSeconds = Math.floor(diffInMs / 1000);

    // 计算小时：1小时 = 3600秒
    const hours = Math.floor(totalSeconds / 3600);
    // 计算剩余分钟：1分钟 = 60秒
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    // 计算剩余秒数
    const seconds = totalSeconds % 60;
    // 计算剩余毫秒数
    const milliseconds = diffInMs % 1000;

    // 格式化输出，补零到两位
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMilliSeconds = String(milliseconds).padStart(3, '0');

    let str = hours > 0 ? `${formattedHours}小时` : '';
    str += minutes > 0 ? `${formattedMinutes}分` : '';
    str += seconds > 0 ? `${formattedSeconds}秒` : '';
    str += milliseconds > 0 ? `${formattedMilliSeconds}毫秒` : '';
    return str;
  }

  let notification = null;

  const confirm = async () => {
    let options = {};
    steps.forEach(item => {
      options = {
        ...options,
        ...getData(item.name)
      };
      sessionStorage.removeItem(item.name);
    })
    const loading = ElLoading.service({ fullscreen: true, text: '图片压缩中...' })
    //
    const startTime = new Date();
    const result = await PluginServer.imageTransform(options);
    const endTime = new Date();
    //
    const currentComponent = conponentRefs[active.value];
    currentComponent.updateTable(result);
    loading.close();
    bFinish.value = true;

    //
    notification = ElNotification({
      title: '压缩完成',
      message: `总计消耗${transformTime(startTime, endTime)}`,
      duration: 0,
      type: 'info',
      position: 'bottom-left'
    });
  }

  const reset = () => {
    notification?.close();
    notification = null;
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