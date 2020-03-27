import Observer from "./observer"
import Compiler from "./compiler"

class Vue {
  constructor (options) {
    if (!options || typeof options !== 'object') {
      return
    }
    console.log('in vue constructor, options are: ', options)
    this.$el = document.querySelector(options.el)
    if (Object.prototype.toString.call(options.data) === '[object Object]') {
      this.$data = options.data
    } else if (Object.prototype.toString.call(options.data) === '[object Function]') {
      console.log('function')
      let data = options.data()
      if (Object.prototype.toString.call(data) === '[object Object]') {
        this.$data = data
      } else {
        this.$data = {}
      }
    } else {
      this.$data = {}
    }

    this.__proxyData__(this.$data)
    this.__proxyMethod__(options.methods)

    new Observer(this.$data)
    new Compiler(this)
  }

  __proxyData__ (data) {
    console.log('proxy data: ', data)
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

  __proxyMethod__ (methods) {
    if (methods && typeof methods === 'object') {
      Object.keys(methods).forEach(method => {
        this[method] = methods[method]
      })
    }
  }
}

window.Vue = Vue
