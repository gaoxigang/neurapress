import type { StyleOptions, RendererOptions } from './types'
import { codeThemes, type CodeThemeId } from '@/config/code-themes'

// 将样式对象转换为 CSS 字符串
export function cssPropertiesToString(style: StyleOptions = {}): string {
  if (!style) return ''

  return Object.entries(style)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      // 处理媒体查询
      if (key === '@media (max-width: 768px)') {
        return ''  // 我们不在内联样式中包含媒体查询
      }
      
      // 转换驼峰命名为连字符命名
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      
      // 处理数字值
      if (typeof value === 'number' && !cssKey.includes('line-height')) {
        value = `${value}px`
      }

      return `${cssKey}: ${value}`
    })
    .filter(Boolean)  // 移除空字符串
    .join(';')
}

// 将基础样式选项转换为 CSS 字符串
export function baseStylesToString(base: RendererOptions['base'] = {}): string {
  if (!base) return ''

  const {
    themeColor,
    fontFamily,
    textAlign,
    lineHeight,
    padding,
    margin,
    wordBreak,
    whiteSpace,
    fontSize,
    color,
    background
  } = base;

  const styles: string[] = []

  if (lineHeight) {
    styles.push(`line-height: ${lineHeight}`)
  }
  if (fontSize) {
    styles.push(`font-size: ${fontSize}`)
  }
  if (textAlign) {
    styles.push(`text-align: ${textAlign}`)
  }
  if (themeColor) {
    styles.push(`--theme-color: ${themeColor}`)
  }
  if (color) {
    styles.push(`color: ${color} !important`)
  }
  if (background) {
    styles.push(`background: ${background}`)
  }
  if (padding) {
    styles.push(`padding: ${padding}`)
  }
  if (fontFamily) {
    styles.push(`font-family: ${fontFamily}`)
  }
  if (margin) {
    styles.push(`margin: ${margin}`)
  }
  if (wordBreak) {
    styles.push(`word-break: ${wordBreak}`)
  }
  if (whiteSpace) {
    styles.push(`white-space: ${whiteSpace}`)
  }

  return styles.join(';')
}

// 获取代码主题的样式
export function getCodeThemeStyles(theme: CodeThemeId): StyleOptions {
  const themeConfig = codeThemes.find(t => t.id === theme)
  if (!themeConfig) return {}

  return {
    background: themeConfig.theme.background,
    color: themeConfig.theme.text,
  }
}

// 获取代码token的样式
export function getTokenStyles(theme: CodeThemeId, tokenType: string): string {
  const themeConfig = codeThemes.find(t => t.id === theme)
  if (!themeConfig) return ''

  const tokenColor = themeConfig.theme[tokenType as keyof typeof themeConfig.theme]
  if (!tokenColor) return ''
  return `color: ${tokenColor};`
} 