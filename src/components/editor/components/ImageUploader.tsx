'use client'

import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { QiniuConfigDialog, checkQiniuConfig } from '../QiniuConfigDialog'
import { uploadToQiniu } from '@/lib/qiniu'

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

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

    // 检查文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "图片大小不能超过10MB"
      })
      return
    }

    // 检查七牛云配置
    const qiniuConfig = checkQiniuConfig()
    if (!qiniuConfig) {
      setPendingFile(file)
      setShowConfigDialog(true)
      return
    }

    await uploadFile(file, qiniuConfig)
  }

  const uploadFile = async (file: File, config: any) => {
    setIsUploading(true)

    try {
      const imageUrl = await uploadToQiniu(file, config)
      
      // 验证图片URL是否可访问
      const img = new Image()
      img.onload = () => {
        onImageUploaded(imageUrl)
        toast({
          title: "上传成功",
          description: "图片已插入到编辑器"
        })
      }
      img.onerror = () => {
        throw new Error('图片URL无法访问')
      }
      img.src = imageUrl
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        title: "上传失败",
        description: error instanceof Error ? error.message : "图片上传失败，请检查配置是否正确"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfigSave = (config: any) => {
    if (pendingFile) {
      uploadFile(pendingFile, config)
      setPendingFile(null)
    }
    setShowConfigDialog(false)
  }

  return (
    <>
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
          disabled={isUploading}
        />
        <ImageIcon className="h-4 w-4" />
      </Button>

      <QiniuConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        onSave={handleConfigSave}
      />
    </>
  )
}