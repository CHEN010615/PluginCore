<template>
  <el-card class="card" :class="{'check': params.checked}" shadow="hover" @click.stop="params.checked = !params.checked">
    <template #header>
      <div class="card-header">
        <div class="card-title ellipsis" :title="params.name">{{ info.name }}</div>
        <el-switch
          v-model="params.enable"
          @click.stop=""
          @change.self="$emit('update', params.id, params.enable)"
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
        <el-button type="primary" plain @click.stop="$emit('edit', params.id)" :icon="Edit" />
        <el-button type="info" plain @click.stop="$emit('open', params.id)" :icon="FolderOpened" />
      </div>
    </template>
  </el-card>
</template>

<script setup>
  import { Edit, FolderOpened, Select } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  const emit = defineEmits(['edit', 'delete', 'open', 'update'])

  let props = defineProps({
    params: Object,
    info: Object,
    shows: Object
  })

  const showParams = Object.keys(props.shows).map((key, index) => {
    return {
      key,
      title: Object.values(props.shows)[index]
    };
  });

</script>

<style lang="less" scoped>
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
</style>
