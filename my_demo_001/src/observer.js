import Dep from "./dep"

export default class Observer {
  constructor (data) {
    this.data = data
    // 遍历对象完成所有数据的劫持
    this.walk(data)
  }

  // 为了遍历对象
  walk (data) {
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach(key => {
      // 数据劫持
      this.defineReactive(data, key, data[key])
    })
  }

  /**
   * 动态设置响应式数据
   * @param data
   * @param key
   * @param value
   */
  defineReactive (data, key, value) {
    let dep = new Dep()
    Object.defineProperty(data, key, {
      enumerable: true, // 可遍历的
      configurable: false, // 不可再配置
      get: () => {
        Dep.target && dep.addSub(Dep.target) // 一个数据 -> 一个依赖列表 -> 多个watcher
        return value
      },
      set: (newValue) => {
        if (value === newValue) {
          return
        }
        value = newValue
        dep.notify()
      }
    })
    // 递归, 为了让所有层的 data 都响应式
    this.walk(value)
  }
}
