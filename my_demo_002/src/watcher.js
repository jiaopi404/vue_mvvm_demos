import Dep from "./dep"

let $uid = 0

export default class Watcher {
  /**
   * expression, scope(context), callback
   * @param exp
   * @param scope
   * @param cb
   */
  constructor (exp, scope, cb) {
    this.exp = exp
    this.scope = scope
    this.cb = cb
    this.uid = $uid++
    this.update()
  }

  update () {
    let newValue = this.get()
    this.cb && this.cb(newValue)
  }

  /**
   * for calc value of exp
   */
  get () {
    Dep.target = this
    // 执行 this.exp 时, 会触发 data 中变量的 getter
    // 因此在 getter 中添加订阅者
    let newValue = Watcher.computeExpression(this.exp, this.scope)
    Dep.target = null
    return newValue
  }

  static computeExpression (exp, scope) {
    let fn = new Function('scope', 'with(scope){return ' + exp + '}')
    return fn(scope)
  }
}
