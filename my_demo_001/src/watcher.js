import Dep from "./dep"
let $uid = 0
export default class Watcher {
  constructor (exp, scope, cb) {
    this.exp = exp
    this.scope = scope
    this.cb = cb
    this.uid = $uid++ // watcher 有很多
    this.update()
  }

  /**
   * 计算表达式
   */
  get () {
    // eval() 进行计算
    // or new Function()
    Dep.target = this
    let newValue = Watcher.computeExpression(this.exp, this.scope)
    Dep.target = null
    return newValue
  }

  /**
   * 完成回调的调用, 且数据变化时, 也完成回调的调用
   */
  update () {
    let newValue = this.get()
    this.cb && this.cb(newValue)
  }

  /**
   * 静态方法, 不new出来, 工具函数, 用于计算
   * @param exp
   * @param scope
   * @returns {*}
   */
  static computeExpression (exp, scope) {
    // 1. 创建函数
    // 2. scope 当做作用于
    // 3. 函数内部使用 with 指定作用域
    // 4. 执行函数, 得到表达式的值, vue2 中也是如此
    let fn = new Function('scope', 'with(scope){return ' + exp + '}')
    return fn(scope)
  }
}
