import { App, DefineComponent } from 'vue'

interface IOptions {
  emptyText?: string
  separator?: string
  rangeSeparator?: string
  dateFormat?: string
}

declare namespace ElementPlusReadonlyFormItem {
  export function install(app: App, options?: IOptions): void
  export const ReadonlyFormItem: DefineComponent
}

export as namespace ElementPlusReadonlyFormItem

export = ElementPlusReadonlyFormItem
