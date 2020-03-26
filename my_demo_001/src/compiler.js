import Watcher from "./watcher"

export default class Compiler {
  constructor (context) {
    this.$el = context.$el // 转存
    this.context = context // 将来频繁使用
    if (this.$el) {
      // 1. 把原始的 dom 转换为文档片段 documentFragment
      this.$fragment = this.nodeToFragment(this.$el)
      // 2. 执行编译模板
      this.compiler(this.$fragment)
      // 3. 把文档片段添加到页面中
      this.$el.appendChild(this.$fragment)
    }
  }

  /**
   * 把所有的元素转为文档片段
   * @param node
   */
  nodeToFragment (node) {
    let fragment = document.createDocumentFragment()
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        // 去掉没有用的节点
        // 判断是不是需要添加的节点
        // 如果是注释节点, 或无用的换行, 不添加
        if (!this.ignorable(child)) {
          fragment.appendChild(child) // 把页面的东西挪过来了
        }
      })
    }
    return fragment
  }

  /**
   * 忽略哪些节点不添加到文档片段中
   * @param node
   */
  ignorable (node) {
    let reg = /^[\t\n\r]+/
    return (node.nodeType === 8 || (node.nodeType === 3 && reg.test(node.textContent)))
  }
  /**
   * compile 用于模板编译
   * @param node 即 el
   */
  compiler (node) {
    // 创建一个空白的文档片段
    // 子元素插入文档片段时不会引起回流, 性能棒
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if (child.nodeType === 1) {
          this.compilerElementNode(child)
        } else if (child.nodeType === 3) {
          // 进行编译
          this.compilerTextNode(child)
        }
      })
    }
  }

  /**
   * 编译元素节点
   * @param node
   */
  compilerElementNode (node) {
    // node type === 1 元素节点, 因此需要递归编译
    let attrs = [...node.attributes] // 节点上的所有属性
    attrs.forEach(attr => {
      // 属性节点
      let { name: attrName, value: attrValue } = attr
      if (attrName.indexOf('v-') === 0) {
        // 自己的指令
        let dirName = attrName.slice(2)
        switch (dirName) {
          case 'text':
            // 还是添加 watcher
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
        this.compilerMethods(this.context, node, attrName, attrValue)
      }
    })
    this.compiler(node)
  }

  /**
   * compile text node
   * @param node
   */
  compilerTextNode (node) {
    // TODO: 完成文本的编译
    let text = node.textContent.trim()
    if (text) {
      // 1. 文本要变成表达式, 如 111{{ msg + 1 }}222
      let exp = this.parseTextExp(text)
      // 2. 添加订阅者, 计算表达式的值
      new Watcher(exp, this.context, (newValue) => {
        node.textContent = newValue
      })
      // 2.1 当表达式依赖的数据发生变化时
      // 2.1.1 重新计算表达式的值
      // 2.1.2 node.textContent 给最新的值
      // 即可完成 Model -> View 的响应式
    }
  }

  /**
   * 函数编译
   * @param scope
   * @param node
   * @param attrName
   * @param attrValue
   */
  compilerMethods (scope, node, attrName, attrValue) {
    // 获取类型
    let type = attrName.slice(1) // 不要 @
    let fn = scope[attrValue] // 函数, 已进行过代理
    node.addEventListener(type, fn.bind(scope))
  }

  /**
   * 该函数完成文本 -> 表达式 的转换
   * 111 {{ msg + '---' }} 222
   * @param text
   */
  parseTextExp (text) {
    // 1. 匹配差值表达式的正则
    let regText = /\{\{(.+?)\}\}/ // ? 贪婪匹配和非贪婪匹配
    // 2. 分割插值表达式前后的 内容
    let pieces = text.split(regText)
    // 3. 匹配插值表达式
    let matches = text.match(regText)
    // 4. tokens 存最后的结果的数组, 表达式数组, 将来就是表达式
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
}
