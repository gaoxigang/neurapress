'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export interface QiniuConfig {
  accessKey: string
  secretKey: string
  bucket: string
  domain: string
}

interface QiniuConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: QiniuConfig) => void
}

export function QiniuConfigDialog({ open, onOpenChange, onSave }: QiniuConfigDialogProps) {
  const { toast } = useToast()
  const [config, setConfig] = useState<QiniuConfig>({
    accessKey: '',
    secretKey: '',
    bucket: '',
    domain: ''
  })

  // 从本地存储加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('qiniu_config')
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error('Failed to parse qiniu config:', error)
      }
    }
  }, [])

  const handleSave = () => {
    // 验证所有字段都已填写
    if (!config.accessKey || !config.secretKey || !config.bucket || !config.domain) {
      toast({
        title: '配置错误',
        description: '请填写所有必填字段',
        variant: 'destructive'
      })
      return
    }

    // 保存到本地存储
    localStorage.setItem('qiniu_config', JSON.stringify(config))
    onSave(config)
    onOpenChange(false)

    toast({
      title: '保存成功',
      description: '七牛云配置已更新'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>七牛云配置</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="accessKey" className="text-right">
              AccessKey
            </Label>
            <Input
              id="accessKey"
              value={config.accessKey}
              onChange={(e) => setConfig({ ...config, accessKey: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="secretKey" className="text-right">
              SecretKey
            </Label>
            <Input
              id="secretKey"
              type="password"
              value={config.secretKey}
              onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bucket" className="text-right">
              Bucket
            </Label>
            <Input
              id="bucket"
              value={config.bucket}
              onChange={(e) => setConfig({ ...config, bucket: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="domain" className="text-right">
              Domain
            </Label>
            <Input
              id="domain"
              value={config.domain}
              onChange={(e) => setConfig({ ...config, domain: e.target.value })}
              className="col-span-3"
              placeholder="https://example.com"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>保存配置</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 检查七牛云配置是否完整
export function checkQiniuConfig(): QiniuConfig | null {
  const savedConfig = localStorage.getItem('qiniu_config')
  if (!savedConfig) return null

  try {
    const config = JSON.parse(savedConfig) as QiniuConfig
    if (!config.accessKey || !config.secretKey || !config.bucket || !config.domain) {
      return null
    }
    return config
  } catch (error) {
    console.error('Failed to parse qiniu config:', error)
    return null
  }
}