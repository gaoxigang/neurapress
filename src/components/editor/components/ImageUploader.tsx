'use client'

import { useState } from 'react'
import { Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "请选择图片文件"
      })
      return
    }

    setIsUploading(true)

    try {
      // TODO: 实现七牛云上传逻辑
      // 1. 从后端获取上传 token
      // 2. 使用 token 上传图片到七牛云
      // 3. 获取返回的图片 URL
      const imageUrl = 'https://example.com/image.jpg' // 替换为实际的上传结果

      onImageUploaded(imageUrl)
      toast({
        title: "上传成功",
        description: "图片已插入到编辑器"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "图片上传失败，请重试"
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 relative"
      disabled={isUploading}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <Image className="h-4 w-4" />
    </Button>
  )
}