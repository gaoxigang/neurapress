'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { type RendererOptions } from '@/lib/markdown'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const themeColors = [
  { name: '经典黑', value: '#1a1a1a' },
  { name: '深蓝', value: '#1e40af' },
  { name: '墨绿', value: '#065f46' },
  { name: '深紫', value: '#5b21b6' },
  { name: '酒红', value: '#991b1b' },
  { name: '海蓝', value: '#0369a1' },
  { name: '森绿', value: '#166534' },
  { name: '靛蓝', value: '#1e3a8a' },
  { name: '玫红', value: '#9d174d' },
  { name: '橙色', value: '#c2410c' },
  { name: '棕褐', value: '#713f12' },
  { name: '石墨', value: '#374151' },
]

// 预设背景颜色
const backgroundColors = [
  { name: '清除背景', value: 'transparent' },
  { name: '默认白色', value: '#ffffff' },
  { name: '温暖米色', value: '#f5f5dc' },
  { name: '淡雅灰', value: '#f8f9fa' },
  { name: '薄荷绿', value: '#f0fff4' }
]

// 预设渐变色
const gradientColors = [
  { name: '日落渐变', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
  { name: '清新渐变', value: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
  { name: '紫罗兰渐变', value: 'linear-gradient(to right, #c471f5 0%, #fa71cd 100%)' },
  { name: '深海渐变', value: 'linear-gradient(120deg, #0093E9 0%, #80D0C7 100%)' },
  { name: '晨雾渐变', value: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)' },
  { name: '极光渐变', value: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' },
  { name: '霞光渐变', value: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)' },
  { name: '星空渐变', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' }
]

interface StyleConfigDialogProps {
  value: RendererOptions
  onChangeAction: (options: RendererOptions) => void
}

export function StyleConfigDialog({ value, onChangeAction }: StyleConfigDialogProps) {
  const [currentOptions, setCurrentOptions] = useState<RendererOptions>(value)
  const [customizedFields, setCustomizedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    setCurrentOptions(value)
    setCustomizedFields(new Set())
  }, [value])

  const handleOptionChange = (
    category: keyof RendererOptions,
    subcategory: string,
    value: string | null
  ) => {
    setCustomizedFields(prev => {
      const next = new Set(prev)
      if (value === null) {
        next.delete(`${category}.${subcategory}`)
      } else {
        next.add(`${category}.${subcategory}`)
      }
      return next
    })

    const newOptions = {
      ...currentOptions,
      [category]: {
        ...(currentOptions[category] as object || {}),
        [subcategory]: value === null ? undefined : value
      }
    }

    // 如果是主题颜色变更，同时更新标题颜色
    if (category === 'base' && subcategory === 'themeColor') {
      if (value === null) {
        // 重置为模板默认值
        newOptions.block = {
          ...newOptions.block,
          h1: { ...(newOptions.block?.h1 || {}), color: undefined },
          h2: { ...(newOptions.block?.h2 || {}), color: undefined },
          h3: { ...(newOptions.block?.h3 || {}), color: undefined }
        }
      } else {
        newOptions.block = {
          ...newOptions.block,
          h1: { ...(newOptions.block?.h1 || {}), color: value },
          h2: { ...(newOptions.block?.h2 || {}), color: value },
          h3: { ...(newOptions.block?.h3 || {}), color: value }
        }
      }
    }

    setCurrentOptions(newOptions)
    onChangeAction(newOptions)
  }

  const resetToDefault = (field: string) => {
    const [category, subcategory] = field.split('.')
    handleOptionChange(category as keyof RendererOptions, subcategory, null)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          样式设置
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>样式配置</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>主题颜色（标题）</Label>
                {customizedFields.has('base.themeColor') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => resetToDefault('base.themeColor')}
                  >
                    重置
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {themeColors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      currentOptions.base?.themeColor === color.value
                        ? 'border-primary scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleOptionChange('base', 'themeColor', color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={currentOptions.base?.themeColor || '#1a1a1a'}
                  className="w-16 h-8 p-1"
                  onChange={(e) => handleOptionChange('base', 'themeColor', e.target.value)}
                />
                <Input
                  value={currentOptions.base?.themeColor || '#1a1a1a'}
                  onChange={(e) => handleOptionChange('base', 'themeColor', e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                此颜色将应用于一级到三级标题
              </p>
            </div>

            {/* 全局字体颜色选择 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>全局字体颜色</Label>
                {customizedFields.has('base.color') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => resetToDefault('base.color')}
                  >
                    重置
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {[
                  { name: '黑色', value: '#000000' },
                  { name: '深灰', value: '#333333' },
                  { name: '中灰', value: '#666666' },
                  { name: '浅灰', value: '#999999' },
                  { name: '深蓝', value: '#0f172a' },
                  { name: '深棕', value: '#422006' }
                ].map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      currentOptions.base?.color === color.value
                        ? 'border-primary scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleOptionChange('base', 'color', color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={currentOptions.base?.color || '#000000'}
                  className="w-16 h-8 p-1"
                  onChange={(e) => handleOptionChange('base', 'color', e.target.value)}
                />
                <Input
                  value={currentOptions.base?.color || '#000000'}
                  onChange={(e) => handleOptionChange('base', 'color', e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                此颜色将应用于所有正文文本，但不会覆盖特定设置的文字颜色
              </p>
            </div>

            {/* 背景颜色选择 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>背景颜色</Label>
                {customizedFields.has('base.background') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => resetToDefault('base.background')}
                  >
                    重置
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">纯色</p>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {backgroundColors.map((color) => (
                      <button
                        key={color.value}
                        className={`h-8 w-full rounded-md border ${
                          currentOptions.base?.background === color.value
                            ? 'ring-2 ring-primary'
                            : 'hover:scale-105'
                        } transition-all`}
                        style={{ background: color.value }}
                        onClick={() => handleOptionChange('base', 'background', color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={currentOptions.base?.background?.startsWith('#') ? currentOptions.base?.background : '#ffffff'}
                      className="w-16 h-8 p-1"
                      onChange={(e) => handleOptionChange('base', 'background', e.target.value)}
                    />
                    <Input
                      value={currentOptions.base?.background?.startsWith('#') ? currentOptions.base?.background : ''}
                      placeholder="输入颜色代码，如 #ff0000"
                      onChange={(e) => handleOptionChange('base', 'background', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-2">渐变色</p>
                  <div className="grid grid-cols-2 gap-2">
                    {gradientColors.map((gradient) => (
                      <button
                        key={gradient.value}
                        className={`h-12 w-full rounded-md border ${
                          currentOptions.base?.background === gradient.value
                            ? 'ring-2 ring-primary'
                            : 'hover:scale-105'
                        } transition-all`}
                        style={{ background: gradient.value }}
                        onClick={() => handleOptionChange('base', 'background', gradient.value)}
                        title={gradient.name}
                      />
                    ))}
                  </div>
                  <div className="mt-2">
                    <Input
                      value={currentOptions.base?.background?.startsWith('linear-gradient') ? currentOptions.base?.background : ''}
                      placeholder="输入渐变代码，如 linear-gradient(to right, #ff0000, #0000ff)"
                      onChange={(e) => handleOptionChange('base', 'background', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                此颜色将应用于整个文档背景
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>字体大小</Label>
                {customizedFields.has('base.fontSize') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => resetToDefault('base.fontSize')}
                  >
                    重置
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="12"
                  max="24"
                  value={parseInt(currentOptions.base?.fontSize || '15')}
                  className="w-24"
                  onChange={(e) => handleOptionChange('base', 'fontSize', `${e.target.value}px`)}
                />
                <span className="flex items-center">px</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>内边距</Label>
                {customizedFields.has('base.padding') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => resetToDefault('base.padding')}
                  >
                    重置
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={parseInt(currentOptions.base?.padding?.replace('px', '') || '20')}
                  className="w-24"
                  onChange={(e) => handleOptionChange('base', 'padding', `${e.target.value}px`)}
                />
                <span className="flex items-center">px</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>文本对齐</Label>
                {customizedFields.has('base.textAlign') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => resetToDefault('base.textAlign')}
                  >
                    重置
                  </Button>
                )}
              </div>
              <Select 
                value={currentOptions.base?.textAlign || 'left'}
                onValueChange={(value: string) => handleOptionChange('base', 'textAlign', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">左对齐</SelectItem>
                  <SelectItem value="center">居中对齐</SelectItem>
                  <SelectItem value="right">右对齐</SelectItem>
                  <SelectItem value="justify">两端对齐</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>行高</Label>
                {customizedFields.has('base.lineHeight') && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => resetToDefault('base.lineHeight')}
                  >
                    重置
                  </Button>
                )}
              </div>
              <Input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={parseFloat(String(currentOptions.base?.lineHeight || '1.75'))}
                onChange={(e) => handleOptionChange('base', 'lineHeight', e.target.value)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 