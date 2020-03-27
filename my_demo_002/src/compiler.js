import Watcher from "./watcher"

export default class Compiler {
  constructor (context) {
    console.log('compiler')
    this.$el = context.$el
    this.context = context
    if (this.$el) {
      // 1. node to fragment, efficient
      this.$fragment = this.nodeToFragment(this.$el)
      console.log('this.$fragment is: ', this.$fragment)
      // 2. compile
      this.compiler(this.$fragment)
      // 3. append to page
      this.$el.appendChild(this.$fragment)
    }
  }

  /**
   * node to fragment
   * @param node
   * @returns {*} fragment
   */
  nodeToFragment (node) {
    console.log(node)
    let fragment = document.createDocumentFragment()
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if (this.ignorable(child)) {
          return
        }
        fragment.appendChild(child)
      })
    }
    return fragment
  }

  /**
   * ignore the text(full of enter, tab, return) and comment
   * @param node
   */
  ignorable (node) {
    let reg = /^[\t\n\r]+/
    return (
      node.nodeType === 8 ||
      (node.nodeType === 3 && reg.test(node.textContent))
    )
  }

  /**
   * compile fragment
   * @param node
   */
  compiler (node) {
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if (child.nodeType === 3) {
          this.compileTextNode(child)
        } else if (child.nodeType === 1) {
          this.compileElementNode(child)
        }
      })
    }
  }

  /**
   * compile text node
   * @param node
   */
  compileTextNode (node) {
    // compile text
    let text = node.textContent.trim()
    if (!text) {
      return
    }
    let exp = this.parseTextExp(text)
    new Watcher(exp, this.context, newValue => {
      node.textContent = newValue
    })
  }

  /**
   * parse text to exp
   * @param text
   */
  parseTextExp (text) {
    let regText = /\{\{(.+?)\}\}/
    let pieces = text.split(regText)
    let matches = text.match(regText) // 匹配到的第一个?
    let tokens = []
    pieces.forEach(item => {
      if (matches && matches.indexOf('{{' + item + '}}') > -1) {
        tokens.push('(' + item + ')')
      } else {
        tokens.push('`' + item + '`') // 字符串
      }
    })
    return tokens.join('+')
  }

  /**
   * compile element node
   * @param node
   */
  compileElementNode (node) {
    let attrs = [...node.attributes]
    attrs.forEach(attr => {
      // v-text="msg"
      let { name: attrName, value: attrValue } = attr
      if (attrName.indexOf('v-') === 0) {
        let dirName = attrName.slice(2)
        switch (dirName) {
          case 'text':
            new Watcher(attrValue, this.context, newValue => {
              node.textContent = newValue
            })
            break
          case 'model':
            if (node.tagName.toLowerCase() === 'input') {
              new Watcher(attrValue, this.context, newValue => {
                node.value = newValue
              })
              node.addEventListener('input', e => {
                this.context[attrValue] = e.target.value
              })
            }
            break
          default:
            break
        }
      }
      if (attrName.indexOf('@') === 0) {
        this.compileMethods(this.context, node, attrName, attrValue)
      }
    })
    this.compiler(node)
  }

  compileMethods (scope, node, attrName, attrValue) {
    let type = attrName.slice(1)
    let fn = scope[attrValue]
    node.addEventListener(type, fn.bind(scope))
  }
}
