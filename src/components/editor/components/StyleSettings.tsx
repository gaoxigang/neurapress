import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Paintbrush } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect } from 'react'

// 预设背景颜色
const presetColors = [
  {
    name: "默认白色",
    value: "#ffffff"
  },
  {
    name: "温暖米色",
    value: "#f5f5dc"
  },
  {
    name: "淡雅灰",
    value: "#f8f9fa"
  },
  {
    name: "薄荷绿",
    value: "#f0fff4"
  }
]

// 预设渐变色
const presetGradients = [
  {
    name: "日落渐变",
    value: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)"
  },
  {
    name: "清新渐变",
    value: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)"
  },
  {
    name: "紫罗兰渐变",
    value: "linear-gradient(to right, #c471f5 0%, #fa71cd 100%)"
  },
  {
    name: "深海渐变",
    value: "linear-gradient(120deg, #0093E9 0%, #80D0C7 100%)"
  },
  {
    name: "晨雾渐变",
    value: "linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)"
  },
  {
    name: "极光渐变",
    value: "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)"
  },
  {
    name: "霞光渐变",
    value: "linear-gradient(to right, #fa709a 0%, #fee140 100%)"
  },
  {
    name: "星空渐变",
    value: "linear-gradient(to top, #30cfd0 0%, #330867 100%)"
  }
]

interface StyleSettingsProps {
  editor: any
}

export default function StyleSettings({ editor }: StyleSettingsProps) {
  // 初始化背景色
  useEffect(() => {
    if (editor) {
      const savedBackground = localStorage.getItem('editor-background')
      if (savedBackground) {
        const element = editor.view.dom as HTMLElement
        element.style.background = savedBackground
      }
    }
  }, [editor])

  const setBackground = (value: string) => {
    // 设置整个编辑器的背景
    if (editor) {
      const element = editor.view.dom as HTMLElement
      element.style.background = value
      // 保存到本地存储以便下次加载
      localStorage.setItem('editor-background', value)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label>背景颜色</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[140px] justify-start">
              <Paintbrush className="mr-2 h-4 w-4" />
              选择背景
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px]">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">纯色</h4>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      className={cn(
                        "h-8 w-full rounded-md border",
                        "cursor-pointer hover:scale-105 transition-transform"
                      )}
                      style={{ background: color.value }}
                      onClick={() => setBackground(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none">渐变色</h4>
                <div className="grid grid-cols-2 gap-2">
                  {presetGradients.map((gradient) => (
                    <button
                      key={gradient.value}
                      className={cn(
                        "h-12 w-full rounded-md border",
                        "cursor-pointer hover:scale-105 transition-transform"
                      )}
                      style={{ background: gradient.value }}
                      onClick={() => setBackground(gradient.value)}
                      title={gradient.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* 其他样式设置选项 */}
    </div>
  )
} 