import { QiniuConfig } from '@/components/editor/QiniuConfigDialog'

// 获取上传token
async function getUploadToken(config: QiniuConfig): Promise<string> {
  try {
    const response = await fetch('/api/qiniu/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        bucket: config.bucket
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get upload token')
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('Error getting upload token:', error)
    throw error
  }
}

// 生成随机文件名
function generateFileName(file: File): string {
  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}.${ext}`
}

// 上传文件到七牛云
export async function uploadToQiniu(file: File, config: QiniuConfig): Promise<string> {
  try {
    // 获取上传token
    const token = await getUploadToken(config)

    // 生成文件名
    const key = generateFileName(file)

    // 创建FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('token', token)
    formData.append('key', key)

    // 上传文件
    const response = await fetch('https://up-z2.qiniup.com', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Upload failed:', errorData)
      throw new Error(errorData.error || 'Failed to upload file')
    }

    const data = await response.json()
    
    // 确保domain不以斜杠结尾
    const domain = config.domain.replace(/\/$/, '')
    
    // 返回完整的图片URL
    return `${domain}/${data.key}`
  } catch (error) {
    console.error('Error uploading to Qiniu:', error)
    throw error
  }
} 