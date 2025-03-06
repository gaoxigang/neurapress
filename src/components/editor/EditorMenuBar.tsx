import { Editor } from '@tiptap/react'
import TextStyle from '@tiptap/extension-text-style'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Image as ImageIcon,
  Settings,
  Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUploader } from './components/ImageUploader'
import StyleSettings from './components/StyleSettings'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from '@/components/ui/input'
import { useState } from 'react'

// 预设文字颜色
const textColors = [
  { name: '黑色', value: '#000000' },
  { name: '白色', value: '#ffffff' },
  { name: '红色', value: '#ef4444' },
  { name: '橙色', value: '#f97316' },
  { name: '黄色', value: '#eab308' },
  { name: '绿色', value: '#22c55e' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '紫色', value: '#a855f7' },
  { name: '粉色', value: '#ec4899' },
  { name: '灰色', value: '#6b7280' },
]

interface EditorMenuBarProps {
  editor: Editor | null
}

export function EditorMenuBar({ editor }: EditorMenuBarProps) {
  const [customColor, setCustomColor] = useState('#000000')

  if (!editor) {
    return null
  }

  const setTextColor = (color: string) => {
    // 使用TextStyle扩展的方式设置颜色
    editor.chain().focus().command(({ chain }) => {
      return chain().setMark('textStyle', { color }).run()
    }).run()
  }

  return (
    <div className="flex items-center gap-1 border-b px-3 py-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        onClick={() => editor.chain().focus().toggleBold().run()}
        data-state={editor.isActive('bold') ? 'on' : 'off'}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      {/* ... 其他现有按钮 ... */}

      {/* 文字颜色按钮 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2">
              {textColors.map((color) => (
                <button
                  key={color.value}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    editor.isActive('textStyle', { color: color.value })
                      ? 'ring-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value, borderColor: color.value === '#ffffff' ? '#e5e7eb' : color.value }}
                  onClick={() => setTextColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={customColor}
                className="w-10 h-8 p-1"
                onChange={(e) => setCustomColor(e.target.value)}
              />
              <Input
                value={customColor}
                className="flex-1"
                onChange={(e) => setCustomColor(e.target.value)}
              />
              <Button 
                size="sm"
                onClick={() => setTextColor(customColor)}
              >
                应用
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <ImageUploader
        onImageUploaded={(url) => {
          editor.chain().focus().command(({ chain }) => {
            return chain().insertContent({
              type: 'image',
              attrs: { src: url }
            }).run()
          }).run()
        }}
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <StyleSettings editor={editor} />
        </PopoverContent>
      </Popover>
    </div>
  )
} 