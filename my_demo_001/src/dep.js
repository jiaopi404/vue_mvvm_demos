export default class Dep {
  // 客户名单
  constructor () {
    // 存放所有的 watcher
    this.subs = {}
  }

  addSub (target) {
    this.subs[target.uid] = target
  }

  notify () {
    for (let uid in this.subs) {
      this.subs[uid].update()
    }
  }
}
