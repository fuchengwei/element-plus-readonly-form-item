import { App } from 'vue'
import ReadonlyFormItem from '@/components/readonly-form-item.vue'

interface IOptions {
  emptyText?: string
  separator?: string
  rangeSeparator?: string
  dateFormat?: string
}

const install = (app: App, options: IOptions = {}) => {
  app.config.globalProperties.$ReadonlyFormItem = options
  app.component(ReadonlyFormItem.name, ReadonlyFormItem)
}

ReadonlyFormItem.install = (app: App) => {
  app.component(ReadonlyFormItem.name, ReadonlyFormItem)
}

export default {
  install,
  ReadonlyFormItem
}
