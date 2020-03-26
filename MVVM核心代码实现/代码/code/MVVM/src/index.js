import Observer from "./observer";
import Compiler from "./compiler";

class Vue {
  constructor(options) {
    // 获取DOM元素对象
    this.$el = document.querySelector(options.el);
    // 转存数据
    this.$data = options.data || {};

    this._proxyData(this.$data);
    this._proxyMethod(options.methods)

    // 数据劫持
    new Observer(this.$data);
    // 模板编译
    new Compiler(this);
  }

  /**
   * 代理数据
   * @param {*} data
   */
  _proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        set(newValue) {
          data[key] = newValue;
        },
        get() {
          return data[key];
        }
      });
    });
  }

  /**
   * 代理函数
   * @param {*} methods
   */
  _proxyMethod(methods) {
    if (methods && typeof methods === "object") {
      Object.keys(methods).forEach(key => {
        this[key] = methods[key];
      });
    }
  }
}
window.Vue = Vue;
