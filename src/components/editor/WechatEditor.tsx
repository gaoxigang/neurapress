'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { type RendererOptions } from '@/lib/markdown'
import { useAutoSave } from './hooks/useAutoSave'
import { EditorToolbar } from './components/EditorToolbar'
import { EditorPreview } from './components/EditorPreview'
import { MarkdownToolbar } from './components/MarkdownToolbar'
import { type PreviewSize } from './constants'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { codeThemes, type CodeThemeId } from '@/config/code-themes'
import '@/styles/code-themes.css'
import { templates } from '@/config/wechat-templates'
import { cn } from '@/lib/utils'
import { usePreviewContent } from './hooks/usePreviewContent'
import { useEditorKeyboard } from './hooks/useEditorKeyboard'
import { useScrollSync } from './hooks/useScrollSync'
import { useWordStats } from './hooks/useWordStats'
import { useCopy } from './hooks/useCopy'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { MobileEditor } from './components/MobileEditor'
import { DesktopEditor } from './components/DesktopEditor'
import dynamic from 'next/dynamic'

export default function WechatEditor() {
  const { toast } = useToast()
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  
  // 状态管理
  const [value, setValue] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('xiaogang')
  const [showPreview, setShowPreview] = useState(true)
  const [styleOptions, setStyleOptions] = useState<RendererOptions>({})
  const [previewSize, setPreviewSize] = useState<PreviewSize>('medium')
  const [isDraft, setIsDraft] = useState(false)
  const [codeTheme, setCodeTheme] = useLocalStorage<CodeThemeId>('code-theme', codeThemes[0].id)

  // 使用自定义 hooks
  const { handleEditorChange } = useAutoSave(value, setIsDraft)
  const { handleEditorScroll } = useScrollSync()

  // 清除编辑器内容
  const handleClear = useCallback(() => {
    if (window.confirm('确定要清除所有内容吗？')) {
      setValue('')
      handleEditorChange('')
      toast({
        title: "已清除",
        description: "编辑器内容已清除",
        duration: 2000
      })
    }
  }, [handleEditorChange, toast])

  // 手动保存
  const handleSave = useCallback(() => {
    try {
      localStorage.setItem('wechat_editor_content', value)
      setIsDraft(false)
      toast({
        title: "保存成功",
        description: "内容已保存到本地",
        duration: 3000
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "无法保存内容，请检查浏览器存储空间",
        action: <ToastAction altText="重试">重试</ToastAction>,
      })
    }
  }, [value, toast])

  const { isConverting, previewContent } = usePreviewContent({
    value,
    selectedTemplate,
    styleOptions,
    codeTheme
  })

  const { handleKeyDown } = useEditorKeyboard({
    value,
    onChange: (newValue) => {
      setValue(newValue)
      handleEditorChange(newValue)
    },
    onSave: handleSave
  })

  // 处理编辑器输入
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const currentPosition = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
      scrollTop: e.target.scrollTop
    }
    
    setValue(newValue)
    handleEditorChange(newValue)
    
    // 使用 requestAnimationFrame 确保在下一帧恢复滚动位置和光标位置
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = currentPosition.scrollTop
        textareaRef.current.setSelectionRange(currentPosition.start, currentPosition.end)
      }
    })
  }, [handleEditorChange])

  const { copyToClipboard } = useCopy()

  const handleCopy = useCallback(async (): Promise<boolean> => {
    const contentElement = previewRef.current?.querySelector('.preview-content') as HTMLElement | null
    if (!contentElement) return false

    const success = await copyToClipboard(contentElement)
    if (success) {
      toast({
        title: "复制成功",
        description: "内容已复制，可直接粘贴到公众号编辑器",
        duration: 2000
      })
    } else {
      toast({
        variant: "destructive",
        title: "复制失败",
        description: "无法访问剪贴板，请检查浏览器权限",
        duration: 2000
      })
    }
    return success
  }, [copyToClipboard, toast, previewRef])

  // 处理放弃草稿
  const handleDiscardDraft = useCallback(() => {
    const savedContent = localStorage.getItem('wechat_editor_content')
    localStorage.removeItem('wechat_editor_draft')
    setValue(savedContent || '')
    setIsDraft(false)
    toast({
      title: "已放弃草稿",
      description: "已恢复到上次保存的内容",
      duration: 2000
    })
  }, [toast])

  // 处理文章选择
  const handleArticleSelect = useCallback((article: { content: string, template: string }) => {
    setValue(article.content)
    setSelectedTemplate(article.template)
    setIsDraft(false)
    toast({
      title: "加载成功",
      description: "已加载选中的文章",
      duration: 2000
    })
  }, [toast])

  // 处理新建文章
  const handleNewArticle = useCallback(() => {
    if (isDraft) {
      toast({
        title: "提示",
        description: "当前文章未保存，是否继续？",
        action: (
          <ToastAction altText="继续" onClick={() => {
            setValue('# 新文章\n\n开始写作...')
            setIsDraft(false)
          }}>
            继续
          </ToastAction>
        ),
        duration: 5000,
      })
      return
    }

    setValue('# 新文章\n\n开始写作...')
    setIsDraft(false)
  }, [isDraft, toast])

  // 处理工具栏插入文本
  const handleToolbarInsert = useCallback((text: string, options?: { wrap?: boolean; placeholder?: string; suffix?: string }) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    let newText = ''
    let newCursorPos = 0

    if (options?.wrap && selectedText) {
      newText = value.substring(0, start) + 
                text + selectedText + (options.suffix || text) + 
                value.substring(end)
      newCursorPos = start + text.length + selectedText.length + (options.suffix?.length || text.length)
    } else {
      const insertText = selectedText || options?.placeholder || ''
      newText = value.substring(0, start) + 
                text + insertText + (options?.suffix || '') + 
                value.substring(end)
      newCursorPos = start + text.length + insertText.length + (options?.suffix?.length || 0)
    }

    setValue(newText)
    handleEditorChange(newText)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    })
  }, [value, handleEditorChange])

  // 处理模版选择
  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId)
    setStyleOptions({})
  }, [])

  // 检测是否为移动设备
  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 640
  }, [])

  // 自动切换预览模式
  useEffect(() => {
    const handleResize = () => {
      if (isMobile()) {
        setPreviewSize('full')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  // 加载已保存的内容
  useEffect(() => {
    const draftContent = localStorage.getItem('wechat_editor_draft')
    const savedContent = localStorage.getItem('wechat_editor_content')
    
    if (draftContent) {
      setValue(draftContent)
      setIsDraft(true)
      toast({
        description: "已恢复未保存的草稿",
        action: <ToastAction altText="放弃" onClick={handleDiscardDraft}>放弃草稿</ToastAction>,
        duration: 5000,
      })
    } else if (savedContent) {
      setValue(savedContent)
    }
  }, [toast, handleDiscardDraft])

  const { wordCount, readingTime } = useWordStats(value)

  const handleSaveAsImage = useCallback(async () => {
    if (!previewRef.current) return false

    try {
      // 动态导入 html2canvas
      const html2canvasModule = await import('html2canvas')
      const html2canvas = html2canvasModule.default

      // 获取预览内容元素
      const previewContent = previewRef.current.querySelector('.preview-content') as HTMLElement
      if (!previewContent) {
        throw new Error('找不到预览内容元素')
      }
      
      // 创建一个临时容器，用于放置内容的副本
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = `${previewContent.offsetWidth}px`
      tempContainer.style.background = '#ffffff'
      document.body.appendChild(tempContainer)
      
      // 复制内容的HTML
      tempContainer.innerHTML = previewContent.innerHTML
      
      // 处理所有元素，修复可能导致问题的样式
      const processElements = (elements: NodeListOf<Element>) => {
        elements.forEach(el => {
          if (el instanceof HTMLElement) {
            // 获取计算样式
            const style = window.getComputedStyle(el)
            
            // 处理渐变背景 - 不移除，而是尝试修复
            const background = style.background || style.backgroundImage
            
            if (background && background.includes('gradient')) {
              // 尝试提取渐变颜色，创建一个简化但有效的渐变
              try {
                // 提取渐变类型（线性或径向）
                const isLinear = background.includes('linear-gradient')
                const isRadial = background.includes('radial-gradient')
                
                if (isLinear) {
                  // 提取方向（如果有）
                  let direction = 'to bottom' // 默认方向
                  if (background.includes('to ')) {
                    const dirMatch = background.match(/to\s+([^,]+)/)
                    if (dirMatch && dirMatch[1]) {
                      direction = dirMatch[1].trim()
                    }
                  }
                  
                  // 提取颜色
                  const colorMatches = background.match(/#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g)
                  if (colorMatches && colorMatches.length >= 2) {
                    // 使用提取的颜色创建一个新的简化渐变
                    const startColor = colorMatches[0]
                    const endColor = colorMatches[colorMatches.length - 1]
                    el.style.background = `linear-gradient(${direction}, ${startColor}, ${endColor})`
                  } else {
                    // 如果无法提取颜色，使用安全的替代颜色
                    el.style.background = '#f8f9fa'
                  }
                } else if (isRadial) {
                  // 对于径向渐变，使用一个简化的版本
                  const colorMatches = background.match(/#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g)
                  if (colorMatches && colorMatches.length >= 2) {
                    const startColor = colorMatches[0]
                    const endColor = colorMatches[colorMatches.length - 1]
                    el.style.background = `radial-gradient(circle, ${startColor}, ${endColor})`
                  } else {
                    el.style.background = '#f8f9fa'
                  }
                }
              } catch (e) {
                // 如果处理渐变失败，使用安全的替代颜色
                console.warn('处理渐变背景失败:', e)
                el.style.background = '#f8f9fa'
              }
            }
            
            // 确保内容可见
            el.style.maxHeight = 'none'
            el.style.overflow = 'visible'
            
            // 移除可能导致问题的其他样式
            el.style.boxShadow = 'none'
            el.style.textShadow = 'none'
            
            // 移除所有变换
            el.style.transform = 'none'
            el.style.transition = 'none'
            el.style.animation = 'none'
            
            // 确保所有内容都是静态的
            el.style.position = el.style.position === 'fixed' ? 'absolute' : el.style.position
          }
        })
      }
      
      // 处理临时容器中的所有元素
      processElements(tempContainer.querySelectorAll('*'))
      
      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 尝试使用 html2canvas 生成图片
      try {
        const canvas = await html2canvas(tempContainer, {
          scale: 2, // 提高清晰度
          useCORS: true, // 允许跨域图片
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          removeContainer: true,
          ignoreElements: (element) => {
            return element.classList.contains('ignore-screenshot')
          }
        })
        
        // 移除临时容器
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer)
        }
        
        // 转换为图片并下载
        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `wechat-article-${new Date().toISOString().slice(0, 10)}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        return true
      } catch (html2canvasError) {
        console.error('html2canvas 失败，尝试使用 dom-to-image:', html2canvasError)
        
        // 如果 html2canvas 失败，尝试使用 dom-to-image
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer)
        }
        
        // 创建一个新的临时容器
        const newTempContainer = document.createElement('div')
        newTempContainer.style.position = 'absolute'
        newTempContainer.style.left = '-9999px'
        newTempContainer.style.top = '0'
        newTempContainer.style.width = `${previewContent.offsetWidth}px`
        newTempContainer.style.background = '#ffffff'
        newTempContainer.innerHTML = previewContent.innerHTML
        document.body.appendChild(newTempContainer)
        
        // 处理所有元素
        processElements(newTempContainer.querySelectorAll('*'))
        
        // 等待DOM更新
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // 使用 dom-to-image 生成图片
        const domtoimage = await import('dom-to-image')
        const dataUrl = await domtoimage.toPng(newTempContainer, {
          width: previewContent.offsetWidth,
          height: previewContent.scrollHeight,
          style: {
            'transform': 'none',
            'max-height': 'none',
            'overflow': 'visible'
          },
          filter: (node) => {
            return !(node instanceof Element) || !node.classList.contains('ignore-screenshot')
          }
        })
        
        // 移除临时容器
        document.body.removeChild(newTempContainer)
        
        // 下载图片
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `wechat-article-${new Date().toISOString().slice(0, 10)}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        return true
      }
    } catch (error) {
      console.error('保存图片失败:', error)
      toast({
        variant: "destructive",
        title: "保存失败",
        description: `无法生成图片: ${error instanceof Error ? error.message : '未知错误'}`,
        duration: 3000
      })
      return false
    }
  }, [previewRef, toast])

  return (
    <div className="relative flex flex-col h-screen">
      {/* 工具栏 */}
      <EditorToolbar
        value={value}
        isDraft={isDraft}
        showPreview={showPreview}
        selectedTemplate={selectedTemplate}
        styleOptions={styleOptions}
        codeTheme={codeTheme}
        wordCount={wordCount}
        readingTime={readingTime}
        onSave={handleSave}
        onCopy={handleCopy}
        onCopyPreview={handleCopy}
        onNewArticle={handleNewArticle}
        onArticleSelect={handleArticleSelect}
        onTemplateSelect={(templateId: string) => setSelectedTemplate(templateId)}
        onTemplateChange={() => {}}
        onStyleOptionsChange={setStyleOptions}
        onPreviewToggle={() => setShowPreview(!showPreview)}
        onCodeThemeChange={setCodeTheme}
        onClear={handleClear}
        onImageUploaded={(imageUrl) => {
          const textarea = textareaRef.current
          if (!textarea) return

          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newText = value.substring(0, start) + 
                         `![图片](${imageUrl})` + 
                         value.substring(end)
          
          setValue(newText)
          handleEditorChange(newText)

          requestAnimationFrame(() => {
            textarea.focus()
            const newCursorPos = start + imageUrl.length + 11
            textarea.setSelectionRange(newCursorPos, newCursorPos)
          })
        }}
        onSaveAsImage={handleSaveAsImage}
      />

      {/* 编辑器主体 */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* 移动设备编辑器 */}
        <MobileEditor
          textareaRef={textareaRef}
          previewRef={previewRef}
          value={value}
          selectedTemplate={selectedTemplate}
          previewSize={previewSize}
          codeTheme={codeTheme}
          previewContent={previewContent}
          isConverting={isConverting}
          onValueChange={setValue}
          onEditorChange={handleEditorChange}
          onEditorScroll={handleEditorScroll}
          onPreviewSizeChange={setPreviewSize}
          onCopy={handleCopy}
        />

        {/* 桌面设备编辑器 */}
        <DesktopEditor
          editorRef={editorRef}
          textareaRef={textareaRef}
          previewRef={previewRef}
          value={value}
          selectedTemplate={selectedTemplate}
          showPreview={showPreview}
          previewSize={previewSize}
          isConverting={isConverting}
          previewContent={previewContent}
          codeTheme={codeTheme}
          onValueChange={setValue}
          onEditorChange={handleEditorChange}
          onEditorScroll={handleEditorScroll}
          onPreviewSizeChange={setPreviewSize}
          onToolbarInsert={handleToolbarInsert}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* 底部状态栏 */}
      <div className="h-10 bg-background border-t flex items-center justify-end px-4 gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{wordCount} 字</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
          <span>约 {readingTime}</span>
        </div>
      </div>
    </div>
  )
}