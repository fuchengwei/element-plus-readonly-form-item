<template>
  <el-form-item v-bind="formItemProps">
    <template v-for="(_, name) in otherSlots()" #[name]>
      <slot :name="name" />
    </template>
    <span v-if="isReadonly" :style="contentStyle">{{ contentValue }}</span>
    <slot v-else />
  </el-form-item>
</template>

<script setup lang="ts">
import { StyleValue, computed, getCurrentInstance, inject, nextTick, onMounted, onBeforeUnmount, ref, useAttrs, useSlots, watch } from 'vue'
// @ts-ignore
import { formContextKey, formItemContextKey } from 'element-plus/es/components/form/src/constants'
import dayjs from 'dayjs'
import { getElFormVNode, getFormComponentVNode, isTwoDimensionalArray, DEFAULT_FORMATS_TIME, DEFAULT_FORMATS_DATEPICKER } from '@/utils'

defineOptions({
  name: 'ReadonlyFormItem'
})

const instance = getCurrentInstance()
const elForm = getElFormVNode(instance!)
const elFormContext = inject<any>(formContextKey)
const slots = useSlots()
const attrs = useAttrs()

const props = withDefaults(
  defineProps<{
    value?: string
    readonly?: boolean
    emptyText?: string
    separator?: string
    rangeSeparator?: string
    dateFormat?: string
  }>(),
  {
    readonly: undefined
  }
)

const elFormModel = ref((elForm.proxy as any).model)
const contentValue = ref('')

const isReadonly = computed<boolean>(() => (props.readonly !== undefined ? props.readonly : (elForm.proxy as any).$attrs.readonly))
const isTable = computed<boolean>(() => ['ElTableRow', 'ElTableBody'].includes(instance?.parent?.type.name!))
const formItemProps = computed(() => ({
  ...attrs,
  labelWidth: attrs.label ? attrs.labelWidth || elForm.props.labelWidth : 'auto',
  style: {
    ...attrs.style!,
    marginBottom: isTable.value && '0'
  }
}))
const getGlobalConfig = computed(() => instance?.appContext.config.globalProperties.$ReadonlyFormItem || {})
const contentStyle = computed<StyleValue>(() =>
  isTable.value
    ? {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inline-block',
        width: '100%',
        verticalAlign: 'bottom'
      }
    : { wordBreak: 'break-all' }
)

const otherSlots = () => {
  const { default: _, ...rest } = slots
  return rest
}

const componentVNode = () => getFormComponentVNode(slots.default!())

const componentType = (vNode: any) => vNode?.type.name

const componentChildrenVNode = (vNode: any) => vNode?.children.default()?.[0]

const dateComponentType = (vNode: any) => vNode?.props.type ?? 'date'

const getDateFormat = (vNode: any) => {
  const FORMAT_MAP = {
    ElTimePicker: DEFAULT_FORMATS_TIME,
    ElDatePicker: DEFAULT_FORMATS_DATEPICKER[dateComponentType(vNode)]
  }
  return props.dateFormat || getGlobalConfig.value.dateFormat || vNode?.props?.format || FORMAT_MAP[componentType(vNode)]
}

const getOptions = (vNode: any): { label: string; value: string }[] =>
  componentChildrenVNode(vNode)?.children?.map((_vNode: any) => ({
    label: componentChildrenVNode(_vNode).children,
    value: _vNode.props.label
  }))

const getEmptyText = () => props.emptyText || getGlobalConfig.value.emptyText || '-'

const getSeparator = () => props.separator || getGlobalConfig.value.separator || ','

const getRangeSeparator = () => props.rangeSeparator || getGlobalConfig.value.rangeSeparator || '~'

const getValue = () => (attrs.prop as string)?.split('.')?.reduce((pre, cur) => pre?.[cur], elFormModel.value)

const getContentValue = () => {
  if ('value' in instance?.vnode.props!) {
    return props.value
  }

  const value = getValue()

  const vNode = componentVNode()

  switch (componentType(vNode)) {
    case 'ElSelect': {
      const options = componentChildrenVNode(vNode).children?.map((_vNode: any) => _vNode.props)
      return Array.isArray(value)
        ? options
            ?.filter((item: any) => value?.includes(item.value))
            ?.map((item: any) => item.label)
            ?.join(getSeparator())
        : options?.find((item: any) => item.value === value)?.label
    }
    case 'ElRadioGroup':
      return getOptions(vNode)?.find((item) => item.value === value)?.label
    case 'ElCheckboxGroup':
      return getOptions(vNode)
        ?.filter((item) => value?.includes(item.value))
        ?.map((item) => item.label)
        ?.join(getSeparator())
    case 'ElCascader': {
      const { options, separator = '/', props: { label: labelKey = 'label', value: valueKey = 'value', children: childrenKey = 'children' } = {} } = vNode?.props

      const reduceCallback = (pre: any[], cur: any) => {
        pre.push(cur)

        cur[childrenKey] && cur[childrenKey].length && cur[childrenKey].reduce(reduceCallback, pre)

        return pre
      }

      const findLabel = (val: any) => options?.reduce(reduceCallback, []).find((option: any) => option[valueKey] === val)?.[labelKey]

      return isTwoDimensionalArray(value) ? value.map((val: any) => val.map(findLabel)?.join(separator))?.join(getSeparator()) : value.map(findLabel).join(separator)
    }
    case 'ElTransfer': {
      const { data, props: { key = 'key', label = 'label' } = {} } = vNode?.props
      return value.map((val: any) => data.find((item: any) => item[key] === val)?.[label])?.join(getSeparator())
    }
    case 'ElTimePicker':
      return Array.isArray(value) && value.length ? value.map((date) => dayjs(date).format(getDateFormat(vNode))).join(getRangeSeparator()) : value
    case 'ElDatePicker': {
      if (!value) {
        return value
      }
      const dateFormat = getDateFormat(vNode)
      const separator = ['monthrange', 'daterange', 'datetimerange'].includes(dateComponentType(vNode)) ? getRangeSeparator() : getSeparator()
      return Array.isArray(value) ? value.map((date) => dayjs(date).format(dateFormat)).join(separator) : dayjs(value).format(dateFormat)
    }
    case 'ElSwitch': {
      const { activeText, inactiveText } = vNode?.props
      return value ? activeText || vNode?.props['active-text'] || '开' : inactiveText || vNode?.props['inactive-text'] || '关'
    }
    case 'ElSlider':
      return Array.isArray(value) ? value.join(getRangeSeparator()) : value
    default:
      return value
  }
}

const updateContentValue = () => {
  try {
    const value = getContentValue()
    contentValue.value = typeof value === 'number' ? value : value || getEmptyText()
  } catch (_) {}
}

const dispatch = (bool: boolean) => {
  nextTick(() => {
    const context = instance?.proxy?.$el?.__vnode?.ctx?.provides?.[formItemContextKey as any]
    if (context) {
      bool ? elFormContext?.removeField(context) : elFormContext?.addField(context)
    }
  })
}

watch(
  () => (elForm.proxy as any).model,
  (val) => {
    elFormModel.value = val
    updateContentValue()
  },
  { deep: true, immediate: true }
)

watch(() => attrs, updateContentValue, { deep: true })

watch(isReadonly, dispatch)

onMounted(() => {
  isReadonly.value && dispatch(true)
})

onBeforeUnmount(() => {
  isReadonly.value && delete instance?.vnode?.props?.prop
})

let num = 0
let timer = setInterval(() => {
  if (num === 10) {
    clearInterval(timer)
  }
  num++
  updateContentValue()
}, 1000)
</script>
