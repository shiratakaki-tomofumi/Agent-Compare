'use client'

import React from 'react'
import { Sidebar } from '@/components/sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbItems?: { label: string; href?: string }[]
}

export function DashboardLayout({ children, breadcrumbItems = [] }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
