import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-background overflow-hidden">
      <Sidebar
        userRole={(session.user as any).role}
        userName={session.user.name || 'Usuário'}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
