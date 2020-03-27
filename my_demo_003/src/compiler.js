import Watcher from "./watcher"

export default class Compiler {
  constructor (context) {
    this.$el = context.$el
    this.context = context

    if (this.$el) {
      // 1. node to fragment
      this.$fragment = this.__nodeToFragment__(this.$el)
      // 2. compiler
      this.__compiler__(this.$fragment)
      // 3. append to el
      console.log('this.$fragment: ', this.$fragment)
      this.$el.appendChild(this.$fragment)
    }
  }

  /**
   * 1. node to fragment
   * @param node
   * @returns {DocumentFragment}
   * @private
   */
  __nodeToFragment__ (node) {
    let fragment = document.createDocumentFragment()
    // 执行过滤
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if (this.__ignorable__(child)) {
          return
        }
        fragment.appendChild(child)
      })
    }
    return fragment
  }

  /**
   * ignore node
   * @param node
   * @returns {boolean}
   * @private
   */
  __ignorable__ (node) {
    let reg= /^[\t\r\n]+/
    return (
      node.nodeType === 8 || (node.nodeType === 3 && reg.test(node.textContent))
    )
  }

  /**
   * 2. compile node
   * @param node
   * @private
   */
  __compiler__ (node) {
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if (child.nodeType === 3) {
          // text node
          this.__compileTextNode__(child)
        } else if (child.nodeType === 1) {
          // element node
          this.__compileElementNode__(child)
        }
      })
    }
  }

  /**
   * compile text node
   * @param node
   * @private
   */
  __compileTextNode__ (node) {
    let text = node.textContent.trim()
    if (!text) {
      return
    }
    // 1. 生成表达式
    let exp = this.__parseTextExp__(text)
    // 2. 添加 watcher 并更新到界面(触发 reactive 的 get)
    new Watcher(exp, this.context, newValue => {
      node.textContent = newValue
    })
  }

  /**
   * 文本转成表达式
   * @param text
   * @returns {string}
   * @private
   */
  __parseTextExp__ (text) {
    let tokens = []
    let regText = /\{\{(.+?)\}\}/
    let pieces = text.split(regText)
    let matches = text.match(regText)
    pieces.forEach(item => {
      if (matches && matches.indexOf('{{' + item + '}}') > -1) {
        tokens.push('(' + item + ')')
      } else {
        tokens.push('`' + item + '`')
      }
    })
    return tokens.join('+')
  }

  /**
   * compile element node
   * @param node
   * @private
   */
  __compileElementNode__ (node) {
    console.dir(node)
    let attrs = node.attributes // 类数组
    Array.prototype.forEach.call(attrs,attr => {
      let { name: attrName, value: attrValue } = attr
      // 1. directive
      if (attrName.indexOf('v-') === 0) {
        let directive = attrName.slice(2)
        switch (directive) {
          case 'text':
            new Watcher(attrValue, this.context, newValue => {
              node.textContent = newValue
            })
            break
          case 'model':
            new Watcher(attrValue, this.context, newValue => {
              node.value = newValue
            })
            // 通过事件监听 set 回去
            node.addEventListener('input', e => {
              this.context[attrValue] = e.target.value
            })
            break
          default:
            break
        }
        // 2. 事件
        if (attrName.indexOf('@') === 0) {
          this.__compileMethods__(this.context, node, attrName, attrValue)
        }
      }
    })
    // 2. event
    this.__compiler__(node)
  }

  __compileMethods__ (scope, node, attrName, attrValue) {
    let type = attrName.slice(1)
    let fn = scope[attrValue]
    node.addEventListener(type, fn.bind(scope))
  }
}
