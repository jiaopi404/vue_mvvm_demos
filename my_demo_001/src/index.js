import Observer from "./observer"
import Compiler from "./compiler"

class Vue {
  constructor (options) {
    this.$el = document.querySelector(options.el)
    this.$data = options.data || {}
    this._proxyData(this.$data)
    this._proxyMethod(options.methods)

    new Observer(this.$data)
    new Compiler(this)
  }

  /**
   * data代理到this
   *
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

  /**
   * 函数的代理
   * @param methods
   * @private
   */
  _proxyMethod (methods) {
    if (methods && typeof methods === 'object') {
      Object.keys(methods).forEach(key => {
        this[key] = methods[key]
      })
    }
  }
}

window.Vue = Vue
