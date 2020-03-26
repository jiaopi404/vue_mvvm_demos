import Dep from "./dep";

export default class Observer {
  constructor(data) {
    // 数据转存
    this.data = data;
    // 遍历data中的所有数据，完成数据劫持
    this.walk(data);
  }

  /**
   * 遍历data对象
   * @param {*} data
   */
  walk(data) {
    if (!data || typeof data !== "object") {
      return;
    }
    Object.keys(data).forEach(key => {
      // 在这里完成数据劫持
      this.defineReactive(data, key, data[key]);
    });
  }

  /**
   * 动态响应式数据
   * @param {*} data 对象
   * @param {*} key 键
   * @param {*} value 值
   */
  defineReactive(data, key, value) {
    var dep = new Dep();
    Object.defineProperty(data, key, {
      // 可遍历
      enumerable: true,
      // 不可再配置
      configurable: false,
      get: () => {
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set: (newValue) => {
        if (value === newValue) {
            return;
        }
        console.log("触发了set")
        value = newValue
        dep.notify();
      }
    });
    this.walk(value);
  }
}
