export default class Dep {
  constructor () {
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
