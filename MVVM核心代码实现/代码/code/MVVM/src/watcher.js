import Dep from "./dep";

var $uid = 0;
export default class Watcher {
  constructor(exp, scope, cb) {
    this.exp = exp;
    this.scope = scope;
    this.cb = cb;
    this.uid = $uid++;
    this.update();
  }

  /**
   * 计算表达式的值
   */
  get() {
    Dep.target = this;
    let newValue = Watcher.computeExpression(this.exp, this.scope);
    Dep.target = null;
    return newValue;
  }

  /**
   * 调用回调函数
   * 把最新的值传递给回调函数
   */
  update() {
    let newValue = this.get();
    this.cb && this.cb(newValue);
  }

  static computeExpression(exp, scope) {
    // 创建函数
    // scope当作参数传递尽其
    // 在函数内部使用with指明作用域
    // 通过函数执行得到最新的值
    let fn = new Function("scope", "with(scope){return " + exp + "}");
    return fn(scope);
  }
}
