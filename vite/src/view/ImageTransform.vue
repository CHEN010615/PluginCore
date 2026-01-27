<template>
  <div class="container">
    <MyTransition :slots="2" :reverse="bLastStep">
      <template #slot1 v-if="!bStart">
        <el-button v-show="!bStart" class="start-btn" @click="handleStartChange" type="primary" round>
          开&nbsp;&nbsp;始
        </el-button>
      </template>
      <template #slot2 v-else-if="bStart">
        <el-card class="basic-form">
          <el-form ref="basic_form" :model="basicFrom" label-position="top">
            <el-form-item label="是否批量处理">
              <el-switch v-model="basicFrom.bBatch"></el-switch>
            </el-form-item>
            <el-form-item :label="basicFrom.bBatch ? '选择目录' : '选择文件'">
              <el-input v-model="basicFrom.szDealPath" :title="basicFrom.szDealPath" readonly>
                <template #append>
                  <el-button @click="chooseDir">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="handleStartChange">返回</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </template>
    </MyTransition>
  </div>
</template>

<script setup>
  import { ref, watch, reactive, nextTick } from 'vue'

  import MyTransition from './components/Transition.vue'

  const bStart = ref(false);
  const bLastStep = ref(false);

  const handleStartChange = () => {
    bStart.value = !bStart.value;
    nextTick(() => {
      bLastStep.value = bStart.value;
    });
  }

  const basicFrom = reactive({
    bBatch: false,
    szDealPath: ""
  });

  const chooseDir = () => {
    //
  }
  
</script>

<style lang="less" scoped>
  @import "@/style/global.less";
  
  .container {
    height: calc(100vh - (@body-padding-top * 2));
    width: calc(100vw - (@body-padding-left * 2));
  }

  @start-btn-width: 150px;
  @start-btn-height: 64px;

  .start-btn {
    width: @start-btn-width;
    height: @start-btn-height;
    font-size: 20px;
    border-radius: (@start-btn-height / 2) !important;
  }

  .basic-form {
    width: 400px;
  }
</style>