import Dep from "./dep"
let $uid = 0

export default class Watcher {
  constructor (exp, scope, cb) {
    this.exp = exp
    this.scope = scope
    this.cb = cb
    this.uid = $uid++
    this.update()
  }

  update () {
    let newValue = this.__get__()
    this.cb && this.cb(newValue)
  }

  __get__ () {
    Dep.target = this
    let newValue = Watcher.__computeExpression__(this.exp, this.scope)
    Dep.target = null
    return newValue
  }

  static __computeExpression__ (exp, scope) {
    let fn = new Function('scope', 'with(scope){return ' + exp + '}')
    return fn(scope)
  }
}
