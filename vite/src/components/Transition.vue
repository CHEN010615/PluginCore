<template>
  <div class="animation-wrapper">
    <transition 
      v-for="slotName in slotNames" 
      :key="slotName"
      :name="transitionName"
      mode="out-in"
    >
      <slot :name="slotName" />
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 简化参数，保持易用性
  slots: {
    type: Number,
    default: 3
  },
  reverse: {
    type: Boolean,
    default: false
  },
  direction: {
    type: String,
    default: 'horizontal',
    validator: (val) => ['horizontal', 'vertical'].includes(val)
  }
})

// 计算属性
const slotNames = computed(() => 
  Array.from({ length: props.slots }, (_, i) => `slot${i + 1}`)
)

const transitionName = computed(() => 
  `${props.direction}-${props.reverse ? 'prev' : 'next'}`
)
</script>

<style lang="less" scoped>
// 变量
@duration: 0.5s;
@easing: cubic-bezier(0.55, 0, 0.1, 1);
@distance: 30px;
@delay: 0.1s;

// 容器
.animation-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

// 动画基础
.transition-base() {
  &-enter-active,
  &-leave-active {
    transition: all @duration @easing;
  }
  
  &-enter-active { transition-delay: @delay; }
  &-leave-active { position: absolute; }
  
  &-enter-to,
  &-leave-from {
    opacity: 1;
    transform: translate(0, 0);
  }
}

// 动画生成器
.create-anim(@enter-x, @enter-y, @leave-x, @leave-y) {
  .transition-base();
  
  &-enter-from {
    opacity: 0;
    transform: translate(@enter-x, @enter-y);
  }
  
  &-leave-to {
    opacity: 0;
    transform: translate(@leave-x, @leave-y);
  }
}

// 具体动画
.horizontal-next { .create-anim(@distance, 0, -@distance, 0); }
.horizontal-prev { .create-anim(-@distance, 0, @distance, 0); }
.vertical-prev { .create-anim(0, -@distance, 0, @distance); }
.vertical-next { .create-anim(0, @distance, 0, -@distance); }
</style>