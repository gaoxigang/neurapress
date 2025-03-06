import React, { useState } from 'react'
import { Paintbrush } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ColorPickerProps {
  onColorSelect: (color: string) => void
}

// 预设的20种颜色
const presetColors = [
  // 基础颜色
  '#000000', '#333333', '#666666', '#999999', 
  // 红色系
  '#ff0000', '#ff4d4d', '#ff9999', '#ffcccc',
  // 绿色系
  '#00ff00', '#4dff4d', '#99ff99', '#ccffcc',
  // 蓝色系
  '#0000ff', '#4d4dff', '#9999ff', '#ccccff',
  // 其他颜色
  '#ff00ff', '#ffff00', '#00ffff', '#ff9900'
]

export function ColorPicker({ onColorSelect }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState('#000000')

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value)
  }

  const handleCustomColorSelect = () => {
    onColorSelect(customColor)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Paintbrush className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h4 className="font-medium">选择文字颜色</h4>
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                className="h-6 w-6 rounded-md border border-gray-200 cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => onColorSelect(color)}
                title={color}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Label htmlFor="custom-color">自定义:</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="custom-color"
                type="color"
                value={customColor}
                onChange={handleColorChange}
                className="h-8 w-12 p-0"
              />
              <Input
                type="text"
                value={customColor}
                onChange={handleColorChange}
                className="h-8 w-24"
              />
              <Button 
                size="sm" 
                onClick={handleCustomColorSelect}
                className="h-8"
              >
                应用
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 