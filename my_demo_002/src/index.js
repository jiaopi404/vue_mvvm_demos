import Observer from "./observer"
import Compiler from "./compiler"

class Vue {
  constructor (options) {
    // option 部分绑定到 实例
    this.$el = document.querySelector(options.el)
    this.$data = options.data || {}
    // 代理 数据
    this._proxyData(this.$data)
    // 代理 方法
    this._proxyMethod(options.methods)

    // 观察者
    new Observer(this.$data)
    // 编译
    new Compiler(this)
  }

  /**
   * 代理数据
   * @param data
   * @private
   */
  _proxyData (data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get () {
          return data[key]
        },
        set (newValue) {
          data[key] = newValue
        }
      })
    })
  }


  _proxyMethod (methods) {
    // 1. 判断 methods 字段类型
    if (methods && typeof methods === 'object') {
      Object.keys(methods).forEach(method => {
        this[method] = methods[method]
      })
    }
  }
}

window.Vue = Vue
