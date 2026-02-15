import { createApp } from 'vue'
import './style/global.less'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import Transition from './common/components/Transition.vue'

const app = createApp(App)

app.component('MyTransition', Transition)

app.use(ElementPlus).mount('#app')