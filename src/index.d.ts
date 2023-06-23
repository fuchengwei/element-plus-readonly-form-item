import { App, DefineComponent } from 'vue'

export interface IOptions {
  emptyText?: string
  separator?: string
  rangeSeparator?: string
  dateFormat?: string
}

export function install(app: App, options?: IOptions): void

export const ReadonlyFormItem: DefineComponent
