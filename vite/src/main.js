import { createApp } from 'vue'
import './style/global.less'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import Transition from './common/components/Transition/Transition.vue'
import Guide from './common/components/Guide/Guide.js'

const app = createApp(App)

app.component('MyTransition', Transition)

app.use({
  install(app) {
    app.provide('guide', Guide)
  }
})

app.use(ElementPlus).mount('#app')