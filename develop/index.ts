import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import ReadonlyFormItem from '@/index'
import App from './App.vue'

import 'element-plus/dist/index.css'

createApp(App).use(ElementPlus).use(ReadonlyFormItem, { emptyText: '-' }).mount('#app')
