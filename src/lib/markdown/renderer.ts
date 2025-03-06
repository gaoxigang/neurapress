import { marked } from 'marked'
import type { Tokens, TokenizerAndRendererExtension } from 'marked'
import type { RendererOptions, StyleOptions } from './types'
import { cssPropertiesToString } from './styles'
import { highlightCode } from './code-highlight'
import katex from 'katex'

// 自定义 LaTeX 块的 Token 类型
interface LatexBlockToken extends Tokens.Generic {
  type: 'latexBlock'
  raw: string
  text: string
}

// 自定义 Mermaid 块的 Token 类型
interface MermaidBlockToken extends Tokens.Generic {
  type: 'mermaidBlock'
  raw: string
  text: string
}

export class MarkdownRenderer {
  private renderer: typeof marked.Renderer.prototype
  private options: RendererOptions

  constructor(options: RendererOptions) {
    this.options = options
    this.renderer = new marked.Renderer()
    this.initializeRenderer()
    this.initializeLatexExtension()
    this.initializeMermaidExtension()
  }

  private initializeLatexExtension() {
    // 添加 LaTeX 块的 tokenizer
    const latexBlockTokenizer: TokenizerAndRendererExtension = {
      name: 'latexBlock',
      level: 'block',
      start(src: string) {
        return src.match(/^\$\$\n/)?.index
      },
      tokenizer(src: string) {
        const rule = /^\$\$\n([\s\S]*?)\n\$\$/
        const match = rule.exec(src)
        if (match) {
          return {
            type: 'latexBlock',
            raw: match[0],
            tokens: [],
            text: match[1].trim()
          }
        }
      },
      renderer: (token) => {
        try {
          const latexStyle = (this.options.block?.latex || {})
          const style = {
            ...latexStyle,
            display: 'block',
            margin: '1em 0',
            textAlign: 'center' as const
          }
          const styleStr = cssPropertiesToString(style)
          const rendered = katex.renderToString(token.text, {
            displayMode: true,
            throwOnError: false
          })
          return `<div${styleStr ? ` style="${styleStr}"` : ''}>${rendered}</div>`
        } catch (error) {
          console.error('LaTeX rendering error:', error)
          return token.raw
        }
      }
    }

    // 注册扩展
    marked.use({ extensions: [latexBlockTokenizer] })
  }

  private initializeMermaidExtension() {
    // 添加 Mermaid 块的 tokenizer
    const mermaidBlockTokenizer: TokenizerAndRendererExtension = {
      name: 'mermaidBlock',
      level: 'block',
      start(src: string) {
        // 支持两种格式：```mermaid 和 ``` 后面跟 mermaid 内容
        return src.match(/^```(?:mermaid\s*$|[\s\n]*pie\s+|[\s\n]*graph\s+|[\s\n]*sequenceDiagram\s+|[\s\n]*gantt\s+|[\s\n]*classDiagram\s+|[\s\n]*flowchart\s+)/)?.index
      },
      tokenizer(src: string) {
        // 匹配两种格式
        const rule = /^```(?:mermaid\s*\n)?([\s\S]*?)\n*```(?:\s*\n|$)/
        const match = rule.exec(src)
        if (match) {
          const content = match[1].trim()
          // 检查内容是否是 mermaid 图表
          if (content.match(/^(?:pie\s+|graph\s+|sequenceDiagram\s+|gantt\s+|classDiagram\s+|flowchart\s+)/)) {
            // 如果是饼图，添加 showData 选项
            const processedContent = content.startsWith('pie') 
              ? `pie showData\n${content.replace(/^pie\s*/, '').trim()}`
              : content
            return {
              type: 'mermaidBlock',
              raw: match[0],
              tokens: [],
              text: processedContent
            }
          }
        }
      },
      renderer: (token) => {
        try {
          const mermaidStyle = (this.options.block?.mermaid || {})
          const style = {
            ...mermaidStyle,
            display: 'block',
            margin: '1em 0',
            textAlign: 'center' as const,
            background: 'transparent'
          }
          const styleStr = cssPropertiesToString(style)
          
          // Remove the random ID generation since it's not needed
          // Return a simple div with the mermaid class and content
          return `<div${styleStr ? ` style="${styleStr}"` : ''} class="mermaid">${token.text}</div>`
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          return `<pre><code class="language-mermaid">${token.text}</code></pre>`
        }
      }
    }

    // 注册扩展
    marked.use({ extensions: [mermaidBlockTokenizer] })
  }

  private initializeRenderer() {
    // 重写 text 方法来处理行内 LaTeX 公式
    this.renderer.text = (token: Tokens.Text | Tokens.Escape) => {
      // 处理行内公式 $...$ 和行间公式 $$`...`$$ 
      return token.text.replace(/\$\$`([^`]+)`\$\$|\$([^$\n]+?)\$/g, (match, backtick, inline) => {
        try {
          const formula = backtick || inline
          const isDisplayMode = !!backtick
          return katex.renderToString(formula.trim(), {
            displayMode: isDisplayMode,
            throwOnError: false
          })
        } catch (error) {
          console.error('LaTeX rendering error:', error)
          return match
        }
      })
    }

    // 重写 heading 方法
    this.renderer.heading = ({ text, depth }: Tokens.Heading) => {
      const { block, base } = this.options
      const headingKey = `h${depth}` as keyof typeof block
      const headingStyle = (block?.[headingKey] || {}) as StyleOptions
      const globalColor = base?.color
      
      // 如果没有特定颜色设置，则使用全局颜色
      if (globalColor && !headingStyle.color) {
        headingStyle.color = globalColor
      }
      
      const style = cssPropertiesToString(headingStyle)
      const tokens = marked.Lexer.lexInline(text)
      const content = marked.Parser.parseInline(tokens, { renderer: this.renderer })
      return `<h${depth} style="${style}">${content}</h${depth}>`
    }

    // 重写 paragraph 方法
    this.renderer.paragraph = ({ text, tokens }: Tokens.Paragraph) => {
      const { block, base } = this.options
      const pStyle = block?.p || {}
      const globalColor = base?.color
      
      // 如果没有特定颜色设置，则使用全局颜色
      if (globalColor && !pStyle.color) {
        pStyle.color = globalColor
      }
      
      const style = cssPropertiesToString(pStyle)

      // 处理段落中的内联标记
      let content = text
      if (tokens) {
        content = tokens.map(token => {
          if (token.type === 'text') {
            const inlineTokens = marked.Lexer.lexInline(token.text)
            return marked.Parser.parseInline(inlineTokens, { renderer: this.renderer })
          }
          return marked.Parser.parseInline([token], { renderer: this.renderer })
        }).join('')
      } else {
        const inlineTokens = marked.Lexer.lexInline(text)
        content = marked.Parser.parseInline(inlineTokens, { renderer: this.renderer })
      }

      return `<p style="${style}">${content}</p>`
    }

    // 重写 blockquote 方法
    this.renderer.blockquote = ({ text }: Tokens.Blockquote) => {
      const { block, base } = this.options
      const blockquoteStyle = block?.blockquote || {}
      const globalColor = base?.color
      
      // 如果没有特定颜色设置，则使用全局颜色
      if (globalColor && !blockquoteStyle.color) {
        blockquoteStyle.color = globalColor
      }
      
      const style = cssPropertiesToString(blockquoteStyle)
      const tokens = marked.Lexer.lexInline(text)
      const content = marked.Parser.parseInline(tokens, { renderer: this.renderer })
      
      return `<blockquote style="${style}">${content}</blockquote>`
    }

    // 重写 code 方法
    this.renderer.code = ({ text, lang }: Tokens.Code) => {  
      const codeStyle = (this.options.block?.code_pre || {}) as StyleOptions
      const style = {
        ...codeStyle
      }
      const styleStr = cssPropertiesToString(style)
      
      const highlighted = highlightCode(text, lang || '', this.options.codeTheme || 'github')
      
      return `<pre${styleStr ? ` style="${styleStr}"` : ''}><code class="language-${lang || ''}">${highlighted}</code></pre>`
    }

    // 重写 codespan 方法
    this.renderer.codespan = ({ text }: Tokens.Codespan) => {  
      const codespanStyle = (this.options.inline?.codespan || {}) as StyleOptions
      const styleStr = cssPropertiesToString(codespanStyle)
      return `<code${styleStr ? ` style="${styleStr}"` : ''}>${text}</code>`
    }

    // 重写 em 方法
    this.renderer.em = ({ text }: Tokens.Em) => {
      const { inline, base } = this.options
      const emStyle = inline?.em || {}
      const globalColor = base?.color
      
      // 如果没有特定颜色设置，则使用全局颜色
      if (globalColor && !emStyle.color) {
        emStyle.color = globalColor
      }
      
      const style = cssPropertiesToString(emStyle)
      const tokens = marked.Lexer.lexInline(text)
      const content = marked.Parser.parseInline(tokens, { renderer: this.renderer })
      
      return `<em style="${style}">${content}</em>`
    }

    // 重写 strong 方法
    this.renderer.strong = ({ text }: Tokens.Strong) => {
      const { inline, base } = this.options
      const strongStyle = inline?.strong || {}
      const globalColor = base?.color
      
      // 如果没有特定颜色设置，则使用全局颜色
      if (globalColor && !strongStyle.color) {
        strongStyle.color = globalColor
      }
      
      // 确保保留粗体设置
      if (!strongStyle.fontWeight) {
        strongStyle.fontWeight = 'bold'
      }
      
      const style = cssPropertiesToString(strongStyle)
      const tokens = marked.Lexer.lexInline(text)
      const content = marked.Parser.parseInline(tokens, { renderer: this.renderer })
      
      return `<strong style="${style}">${content}</strong>`
    }

    // 重写 link 方法
    this.renderer.link = ({ href, title, text }: Tokens.Link) => {
      const { inline, base } = this.options
      const linkStyle = inline?.link || {}
      const globalColor = base?.color
      
      // 如果没有特定颜色设置，则使用全局颜色
      if (globalColor && !linkStyle.color) {
        linkStyle.color = globalColor
      }
      
      const style = cssPropertiesToString(linkStyle)
      const titleAttr = title ? ` title="${title}"` : ''
      
      return `<a href="${href}"${titleAttr} style="${style}">${text}</a>`
    }

    // 重写 image 方法
    this.renderer.image = ({ href, title, text }: Tokens.Image) => {
      const imageStyle = (this.options.block?.image || {}) as StyleOptions
      const style = {
        ...imageStyle
      }
      const styleStr = cssPropertiesToString(style)
      return `<img src="${href}"${title ? ` title="${title}"` : ''} alt="${text}"${styleStr ? ` style="${styleStr}"` : ''}>`
    }

    // 重写 list 方法
    this.renderer.list = (token: Tokens.List) => {
      const { block, base } = this.options
      const tag = token.ordered ? 'ol' : 'ul'
      const listStyle = (block?.[tag as keyof typeof block] || {}) as StyleOptions
      const globalColor = base?.color
      
      // 如果没有特定颜色设置，则使用全局颜色
      if (globalColor && !listStyle.color) {
        listStyle.color = globalColor
      }
      
      const style = cssPropertiesToString(listStyle)
      const startAttr = token.ordered && token.start !== 1 ? ` start="${token.start}"` : ''
      
      const items = token.items.map(item => {
        let itemText = item.text
        if (item.task) {
          const checkbox = `<input type="checkbox"${item.checked ? ' checked=""' : ''} disabled="" /> `
          itemText = checkbox + itemText
        }
        return this.renderer.listitem({ ...item, text: itemText })
      }).join('')
      
      return `<${tag}${startAttr}${style ? ` style="${style}"` : ''}>${items}</${tag}>`
    }

    // 重写 listitem 方法
    this.renderer.listitem = (item: Tokens.ListItem) => {
      const { inline, base } = this.options
      // listitem在inline中而不是block中
      const liStyle = (inline?.listitem || {}) as StyleOptions
      const globalColor = base?.color
      
      // 如果没有特定颜色设置，则使用全局颜色
      if (globalColor && !liStyle.color) {
        liStyle.color = globalColor
      }
      
      const style = cssPropertiesToString(liStyle)
      
      // 处理嵌套列表
      let content = ''
      if (item.task) {
        const checked = item.checked ? 'checked' : ''
        content += `<input type="checkbox" ${checked} disabled> `
      }
      
      if (item.tokens) {
        content += marked.Parser.parseInline(item.tokens, { renderer: this.renderer })
      }
      
      return `<li style="${style}">${content}</li>`
    }

    // 添加删除线支持
    this.renderer.del = ({ text }: Tokens.Del) => {
      const { inline, base } = this.options
      const delStyle = inline?.del || {}
      const globalColor = base?.color
      
      // 如果没有特定颜色设置，则使用全局颜色
      if (globalColor && !delStyle.color) {
        delStyle.color = globalColor
      }
      
      const style = cssPropertiesToString(delStyle)
      return `<del style="${style}">${text}</del>`
    }
  }

  public getRenderer(): typeof marked.Renderer.prototype {
    return this.renderer
  }
}