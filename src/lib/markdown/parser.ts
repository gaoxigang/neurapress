import { marked } from 'marked'
import type { RendererOptions } from './types'
import { MarkdownRenderer } from './renderer'
import { baseStylesToString } from './styles'

export class MarkdownParser {
  private options: RendererOptions
  private renderer: MarkdownRenderer

  constructor(options: RendererOptions) {
    this.options = options
    this.renderer = new MarkdownRenderer(options)
    this.initializeMarked()
  }

  private initializeMarked() {
    marked.use({
      gfm: true,
      breaks: true,
      async: false,
      pedantic: false
    })

    marked.use({
      breaks: true,
      gfm: true,
      walkTokens(token) {
        // 确保列表项被正确处理
        if (token.type === 'list') {
          (token as any).items.forEach((item: any) => {
            if (item.task) {
              item.checked = !!item.checked
            }
          })
        }
      }
    })

    // 添加脚注支持
    const options = this.options // 在闭包中保存 options 引用
    marked.use({
      extensions: [{
        name: 'footnote',
        level: 'inline',
        start(src: string) { 
          const match = src.match(/^\[\^([^\]]+)\]/)
          return match ? match.index : undefined 
        },
        tokenizer(src: string) {
          const match = /^\[\^([^\]]+)\]/.exec(src)
          if (match) {
            const token = {
              type: 'footnote',
              raw: match[0],
              text: match[1],
              tokens: []
            }
            return token as any
          }
          return undefined
        },
        renderer(token: any) {
          const footnoteStyle = (options?.inline?.footnote || {})
          const styleStr = Object.entries(footnoteStyle)
            .map(([key, value]) => `${key}:${value}`)
            .join(';')
          return `<sup${styleStr ? ` style="${styleStr}"` : ''}><a href="#fn-${token.text}">[${token.text}]</a></sup>`
        }
      }]
    })

    // 添加 Mermaid 支持
    marked.use({
      extensions: [{
        name: 'mermaid',
        level: 'block',
        start(src: string) {
          return src.match(/^```mermaid\s*\n/)?.index
        },
        tokenizer(src: string) {
          const match = /^```mermaid\s*\n([\s\S]*?)\n\s*```/.exec(src)
          if (match) {
            return {
              type: 'mermaid',
              raw: match[0],
              text: match[1].trim(),
              tokens: []
            }
          }
          return undefined
        },
        renderer(token: any) {
          try {
            const lines = token.text.split('\n')
              .map((line: string) => line.trim())
              .filter(Boolean) // 移除空行

            if (lines.length === 0) {
              return '<pre class="mermaid-error">Empty diagram content</pre>'
            }

            // 获取第一行作为图表类型
            const firstLine = lines[0].toLowerCase()
            let formattedContent: string

            if (firstLine.startsWith('pie')) {
              // 处理饼图
              formattedContent = 'pie\n' + lines.slice(1).map((line: string) => {
                if (line.toLowerCase().startsWith('title')) {
                  return `    title ${line.substring(5).trim()}`
                }
                if (line.includes(':')) {
                  const [key, value] = line.split(':').map((part: string) => part.trim())
                  const formattedKey = key.startsWith('"') && key.endsWith('"') ? key : `"${key}"`
                  return `    ${formattedKey}:${value}`
                }
                return `    ${line}`
              }).join('\n')
            } else {
              // 其他类型的图表
              formattedContent = lines.map((line: string, index: number) => {
                if (index === 0) {
                  // 处理第一行（图表类型）
                  if (line.toLowerCase().includes('sequence')) {
                    return 'sequenceDiagram'
                  }
                  if (line.toLowerCase().includes('flow') || line.toLowerCase().includes('graph')) {
                    return line.toLowerCase().startsWith('graph') ? line : `graph ${line.split(' ')[1] || 'TD'}`
                  }
                  return line
                }
                // 其他行添加缩进
                return `    ${line}`
              }).join('\n')
            }

            console.log('Formatted Mermaid content:', formattedContent)
            return `<div class="mermaid">\n${formattedContent}\n</div>`
          } catch (error: unknown) {
            console.error('Error processing Mermaid content:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            return `<pre class="mermaid-error">Error rendering diagram: ${errorMessage}</pre>`
          }
        }
      }]
    })
  }

  public parse(markdown: string): string {
    const preprocessed = this.preprocessMarkdown(markdown)
    const html = marked.parse(preprocessed, { renderer: this.renderer.getRenderer() }) as string
    const baseStyles = baseStylesToString(this.options.base)
    return baseStyles ? `<section style="${baseStyles}">${html}</section>` : html
  }

  // 预处理 markdown 文本
  private preprocessMarkdown(markdown: string): string {
    return markdown
      // 处理 ** 语法，但排除已经是 HTML 的部分
      .replace(/(?<!<[^>]*)\*\*([^*]+)\*\*(?![^<]*>)/g, '<strong>$1</strong>')
      // 处理无序列表的 - 标记，但排除代码块内的部分
      .replace(/^(?!\s*```)([ \t]*)-\s+/gm, '$1• ')
      // 处理自定义颜色语法 {color:#rrggbb}text{/color}，使用!important确保覆盖全局颜色
      .replace(/\{color:(#[0-9a-fA-F]{3,8})\}([\s\S]*?)\{\/color\}/g, '<span style="color: $1 !important">$2</span>')
  }
} 