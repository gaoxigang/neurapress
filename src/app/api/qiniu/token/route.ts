import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessKey, secretKey, bucket } = await request.json()

    // 验证参数
    if (!accessKey || !secretKey || !bucket) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      )
    }

    // 动态导入七牛云SDK
    const qiniu = await import('qiniu')

    // 创建七牛云认证对象
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: bucket,
      expires: 7200 // 2小时过期
    })

    // 生成上传token
    const uploadToken = putPolicy.uploadToken(mac)

    return NextResponse.json({ token: uploadToken })
  } catch (error) {
    console.error('Error generating Qiniu token:', error)
    return NextResponse.json(
      { error: '生成上传token失败' },
      { status: 500 }
    )
  }
} 