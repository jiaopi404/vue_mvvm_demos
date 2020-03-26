import Watcher from "./watcher";

export default class Compiler {
  constructor(context) {
    this.$el = context.$el;
    this.context = context;
    if (this.$el) {
      // 创建
      // 把原始的DOM转换成documentfragment，再插入到页面中渲染
      this.$fragment = this.nodeToFragmeng(this.$el);
      // 编译模板
      this.compiler(this.$fragment);
      // 把文档片段添加到页面中
      this.$el.appendChild(this.$fragment);
    }
  }

  /**
   * 把id为app的div下的所有元素转换为文档片段
   * @param {*} node
   */
  nodeToFragmeng(node) {
    let fragment = document.createDocumentFragment();
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if (!this.ingorable(child)) {
          fragment.appendChild(child);
        }
      });
    }
    return fragment;
  }

  /**
   * 判断是否为注释或者无用的换行等
   * @param {*} node
   */
  ingorable(node) {
    // 建立正则匹配所有tab回车换行
    let reg = /^[\t\n\r]+/;
    // nodeType==8为注释节点
    // nodeType==3为文本节点
    return (
      node.nodeType === 8 || (node.nodeType === 3 && reg.test(node.textContent))
    );
  }

  /**
   * 编译模板
   * @param {*} node
   */
  compiler(node) {
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach(child => {
        if (child.nodeType === 1) {
          // 当nodeType为1时，说明是元素节点
          this.compilerElementNode(child);
        } else if (child.nodeType === 3) {
          // 当nodeType为3时，说明是文本节点
          this.compilerTextNode(child);
        }
      });
    }
  }

  /**
   * 编译元素节点
   * @param {*} node
   */
  compilerElementNode(node) {
    var attrs = [...node.attributes];
    attrs.forEach(attr => {
      let { name: attrName, value: attrValue } = attr;
      if (attrName.indexOf("v-") === 0) {
        let dirName = attrName.slice(2);
        switch (dirName) {
          case "text":
            new Watcher(attrValue, this.context, newValue => {
              node.textContent = newValue;
            });
            break;
          case "model":
            if (node.tagName.toLowerCase() === "input") {
              new Watcher(attrValue, this.context, newValue => {
                node.value = newValue;
              });
              node.addEventListener("input", e => {
                this.context[attrValue] = e.target.value;
              })
            }
            break;
        }
      }
      if (attrName.indexOf("@") === 0) {
        this.compilerMethods(this.context, node, attrName, attrValue);
      }
    });
    this.compiler(node);
  }

  /**
   * 解析函数
   * @param {*} scope 
   * @param {*} node 
   * @param {*} attrName 
   * @param {*} attrValue 
   */
  compilerMethods(scope, node, attrName, attrValue) {
    // 获取事件类型
    let type = attrName.slice(1);
    // 获取函数体，但是，我们先不考虑传参的情况
    let fn = scope[attrValue];
    // 给对应的node添加事件即可
    node.addEventListener(type, fn.bind(scope));
  }

  /**
   * 编译文本节点
   * @param {*} node
   */
  compilerTextNode(node) {
    let text = node.textContent.trim();
    if (text) {
      // 获取表达式
      let exp = this.parseTextExp(text);
      console.log(exp);
      // 添加订阅者，计算表达式的值
      // 当表达式中所依赖的数据发生变化的手
      // 1.重新计算表达式的值
      // 2.node.textContent给到最新的值
      // 即可完成Model -> View的响应式
      new Watcher(exp, this.context, newValue => {
        node.textContent = newValue;
      });
    }
  }

  /**
   * 通过文本获取表达式
   * 111{{msg + '-----'}}2222
   * '111' + (msg + '-----') + '2222'
   * @param {*} text
   */
  parseTextExp(text) {
    // 匹配插值表达式正则
    var regText = /\{\{(.+?)\}\}/g;
    // 分割text内容
    var pices = text.split(regText);
    // 匹配插值表达式
    var matches = text.match(regText);
    // 定义变量，设置表达式的数据
    var tokens = [];
    pices.forEach(item => {
      if (matches && matches.indexOf("{{" + item + "}}") > -1) {
        tokens.push("(" + item + ")");
      } else {
        tokens.push("`" + item + "`");
      }
    });
    return tokens.join("+");
  }
}
