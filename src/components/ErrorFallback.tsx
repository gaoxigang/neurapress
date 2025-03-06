'use client'

import React from 'react'
import { Logo } from '@/components/icons/Logo'

export function ErrorFallback() {
  return (
    <div className="h-full bg-background flex items-center justify-center">
      <div className="flex flex-col items-center mt-20">
        <div className="flex items-center justify-center">
          <Logo className="w-20 h-20" />
          <p className="text-lg font-medium text-foreground">出现了一些问题</p>
        </div> 
        <div className="flex flex-col items-center gap-4 mt-4">
          <p className="text-sm text-muted-foreground">编辑器加载失败，请刷新页面重试</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            刷新页面
          </button>
        </div>
      </div>
    </div>
  )
} 