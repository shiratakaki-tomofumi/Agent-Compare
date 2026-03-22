'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  Receipt,
  LogOut,
  Building2,
  ListTodo
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: '顧客/商談', href: '/sales/customers', icon: Users, prefix: '/sales' },
  { name: '案件', href: '/projects', icon: FolderKanban, prefix: '/projects' },
  { name: '経費/承認', href: '/finance/expenses', icon: Receipt, prefix: '/finance' },
  { name: '従業員', href: '/hr/employees', icon: Briefcase, prefix: '/hr' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="flex h-16 shrink-0 items-center px-6 border-b">
          <Building2 className="h-6 w-6 text-indigo-600" />
          <span className="ml-3 text-lg font-bold text-gray-900">BizBoard</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.prefix && pathname.startsWith(item.prefix))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">{session?.user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-4 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="mr-3 h-5 w-5" />
            ログアウト
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center px-6 shrink-0">
          <div className="flex flex-1 justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              {navigation.find((n) => pathname === n.href || (n.prefix && pathname.startsWith(n.prefix)))?.name || 'Dashboard'}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
