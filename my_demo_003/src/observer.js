import Dep from "./dep"

export default class Observer {
  constructor (data) {
    console.log('in observer constructor, data is: ', data)
    this.data = data

    this.__walk__(data)
  }

  __walk__ (data) {
    // 必有, 判断是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach(key => {
      this.__defineReactive__(data, key, data[key])
    })
  }

  /**
   * define reactive
   * @param data
   * @param key
   * @param value
   * @returns {*}
   * @private
   */
  __defineReactive__ (data, key, value) {
    let dep = new Dep()
    console.log('args are: ', arguments)
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get: () => {
        Dep.target && dep.addSub(Dep.target)
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

    this.__walk__(value)
  }
}
