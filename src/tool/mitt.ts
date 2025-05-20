import mitt, { type Emitter } from 'mitt'

// 定义所有事件类型及参数类型
type Events = {
  heartbeat: undefined // 事件名为 heartbeat，参数为 undefined
  update: string // 事件名为 update，参数为 string
  error: Error // 事件名为 error，参数为 Error 对象
  submit: { id: number } // 事件名为 submit，参数为对象
}

// 创建类型化的 Mitt 实例
const emitter: Emitter<Events> = mitt<Events>()
export default emitter
