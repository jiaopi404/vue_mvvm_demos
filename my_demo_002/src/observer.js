import Dep from "./dep"

export default class Observer {
  constructor (data) {
    console.log('observer')
    this.data = data

    // data hijack
    this.walk(data)
  }

  /**
   * for data HIJACK
   * @param data
   */
  walk (data) {
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  /**
   * dynamic set reactive data
   * @param data
   * @param key
   * @param value
   */
  defineReactive (data, key, value) {
    let dep = new Dep()
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get: () => {
        // TODO: dependency receiver
        // target 是 watcher, addSub 添加订阅者
        Dep.target && dep.addSub(Dep.target)
        console.log('dep in getter is: ', dep)
        return value
      },
      set: newValue => {
        if (value === newValue)  {
          return
        }
        value = newValue
        // notify; when value is changed, notify all subscriber
        dep.notify()
        console.log('dep in setter is: ', dep)
      }
    })

    // recursion for { a: { b: 1 } }
    this.walk(value)
  }
}
