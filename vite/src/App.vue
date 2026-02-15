<template>
  <div class="index" v-index-directive>
    <el-config-provider :locale="zhCn">
      <ImageTransform></ImageTransform>
    </el-config-provider>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import ImageTransform from '@/view/ImageTransform.vue'
  import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

  let inited = ref(false);

  const vIndexDirective = {
    created: () => {
      inited.value = !!window.PluginServer;
      window.addEventListener('AppInited', () => {
        console.log('AppInited');
        inited.value = true;
      });
    },
    mounted: () => {
      console.log('app mounted');
    },
    beforeDestroy: async () => {
      await window.PluginServer.destroy();
    }
  };
</script>

<style lang="less" scoped>
  @import "@/style/global.less";
  
  .index {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: @body-padding-top @body-padding-left;
  }

  ::v-deep(.server-scroll) {
    height: calc(100% - 20px) !important;
  }

  .server-list {
    width: 100%;
    height: 100%;
  }
</style>
