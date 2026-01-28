<template>
  <el-card class="card" :class="{'check': params.checked}" shadow="hover" @click.stop="params.checked = !params.checked">
    <template #header>
      <div class="card-header">
        <div class="card-title" :title="info.name">
          <div class="icon" :class="info.vue ? 'img-vue' : 'img-angular'"></div>
          <span class="title-txt ellipsis">{{ info.name }}</span>
        </div>
        <el-tooltip
          v-if="info.vue"
          class="box-item"
          effect="dark"
          content="5.0项目需要本地运行代码"
          placement="right-start"
        >
          <el-switch
            v-model="params.enable"
            @click.stop=""
            @change.self="updateEnable(params.id, params.enable)"
          ></el-switch>
        </el-tooltip>
        <el-switch
          v-model="params.enable"
          v-else
          @click.stop=""
          @change.self="updateEnable(params.id, params.enable)"
        ></el-switch>
      </div>
    </template>
    <div class="card-content">
      <el-scrollbar view-class="card-content">
        <el-descriptions border direction="horizontal" size="large" :column="1">
          <el-descriptions-item
            v-for="item in showParams"
            :key="item.key"
            :label="item.title"
          >
            <div class="card-info ellipsis" :title="info[item.key]">{{ info[item.key] }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-scrollbar>
    </div>
    <div class="check-sign">
      <div class="check-bg"></div>
      <el-icon><Select /></el-icon>
    </div>
    <template #footer>
      <div class="card-footer">
        <el-tooltip class="box-item" effect="dark" content="编辑" placement="top">
          <el-button type="primary" plain @click.stop="$emit('edit', params.id)" :icon="Edit" />
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="打开资源目录" placement="top">
          <el-button type="info" plain @click.stop="openDir()" :icon="FolderOpened" :disabled="!info.projectDir" />
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="打开设备页面" placement="top">
          <el-button type="info" plain @click.stop="openDevicePage()" :icon="ChromeFilled" :disabled="!info.deviceAddr" />
        </el-tooltip>
        <el-tooltip class="box-item" effect="dark" content="代理协议" placement="top">
          <el-button type="info" plain @click.stop="$emit('apiProxy', params.id)" :icon="More" :disabled="!info.deviceAddr" />
        </el-tooltip>
      </div>
    </template>
  </el-card>
</template>

<script setup>
  import { reactive } from 'vue'
  import { Edit, FolderOpened, Select, ChromeFilled, More } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  import ServerProxy from './ServerProxy.js'

  const SP = reactive(ServerProxy);

  const emit = defineEmits(['edit', 'apiProxy'])

  const props = defineProps({
    params: Object,
    info: Object
  })

  const shows = {
    proxyPort: "端口",
    deviceAddr: "设备ip",
    projectDir: "目录",
    localPort: "本地端口"
  };

  const showParams = Object.keys(shows).filter(key => {
    let show = true;
    if ("localPort" === key) {
      show = false;
    }
    // if ("projectDir" === key) {
    //   show = !props.info.vue;
    // }
    return show;
  }).map((key, index) => {
    return {
      key,
      title: shows[key]
    };
  });

  const runServer = (id, value) => {
    return window.PluginServer.runServer(id);
  };

  const stopServer = (id, value) => {
    return window.PluginServer.stopServer(id);
  };

  const updateEnable = async (id, value) => {
    let server = await SP.getServerById(id);
    let pro = value ? runServer(id) : stopServer(id);
    pro.catch(e => {
      console.log(e);
      ElMessage({
        type: "warning",
        message: e
      });
      server.params.enable = !value;
    });
  };

  const openDir = async () => {
    let server = await SP.getServerById(props.params.id);
    window.PluginServer.openDir(server.projectDir);
  };

  const openDevicePage = async data => {
    const { https, deviceAddr } = props.info;
    await window.PluginServer.openDeviceWeb(`http${https ? 's' : ''}://${deviceAddr}`);
  }

</script>

<style lang="less" scoped>
  @import "@/common/less/variables.less";

  @check-size: 13px;
  @check-bg: red;
  @check-color: #FFF;

  .card {
    height: 100%;
    width: 100%;
    min-width: 365px;
    display: inline-block;
    position: relative;
    user-select: none;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        max-width: 250px;
        display: flex;
        justify-content: center;
        align-items: center;

        .title-txt {
          max-width: 220px;
          margin-left: 10px;
        }
      }
    }

    .card-content {
      height: 150px;

      .card-info {
        max-width: 200px;
      }
    }

    .check-sign {
      display: none;
      height: calc(@check-size * 2);
      width: calc(@check-size * 2);
      position: absolute;
      top: 0;
      right: 0;

      .check-bg {
        position: absolute;
        height: calc(@check-size * 2);
        width: calc(@check-size * 2);
        border: @check-size solid transparent;
        border-top-color: @check-bg;
        border-right-color: @check-bg;
      }

      .el-icon {
        position: absolute;
        top: 0;
        right: 0;
        color: @check-color;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-around;
    }
  }

  .check .check-sign {
    display: inline-block;
  }

  .ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .icon {
    width: 20px;
    height: 20px;
    background-size: 20px 20px !important;
  }

  .img-vue {
    background: url("@{img-vue}") no-repeat;
  }

  .img-angular {
    background: url("@{img-angular}") no-repeat;
  }
</style>
