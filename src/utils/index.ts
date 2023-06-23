import { ComponentInternalInstance, VNode } from 'vue'

const CAPTURED_TYPE = [
  'ElInput',
  'ElInputNumber',
  'ElRadioGroup',
  'ElCheckboxGroup',
  'ElSelect',
  'ElCascader',
  'ElSwitch',
  'ElSlider',
  'ElTimeSelect',
  'ElTimePicker',
  'ElDatePicker',
  'ElRate',
  'ElColorPicker',
  'ElTransfer'
]

export const DEFAULT_FORMATS_TIME = 'HH:mm:ss'
export const DEFAULT_FORMATS_DATE = 'YYYY-MM-DD'
export const DEFAULT_FORMATS_DATEPICKER = {
  date: DEFAULT_FORMATS_DATE,
  dates: DEFAULT_FORMATS_DATE,
  week: 'gggg[w]ww',
  year: 'YYYY',
  month: 'YYYY-MM',
  datetime: `${DEFAULT_FORMATS_DATE} ${DEFAULT_FORMATS_TIME}`,
  monthrange: 'YYYY-MM',
  daterange: DEFAULT_FORMATS_DATE,
  datetimerange: `${DEFAULT_FORMATS_DATE} ${DEFAULT_FORMATS_TIME}`,
}

export const isTwoDimensionalArray = (arr: any) => Array.isArray(arr) && arr.every((item) => Array.isArray(item))

export const getElFormVNode = (instance: ComponentInternalInstance): ComponentInternalInstance => {
  const TYPE_NAME = 'ElForm'
  if (instance.type.name === TYPE_NAME) {
    return instance
  }

  return getElFormVNode(instance.parent!)
}

export const getFormComponentVNode = (list?: VNode[]): any => {
  if (!list) {
    return
  }

  let vNode
  for (let index = 0; index < list.length; index++) {
    vNode = list[index]
    if (typeof vNode.type === 'object' && CAPTURED_TYPE.includes((vNode.type as any).name)) {
      return vNode
    }
    vNode = getFormComponentVNode(vNode.children as VNode[])
    if (vNode) {
      return vNode
    }
  }
  return vNode
}
