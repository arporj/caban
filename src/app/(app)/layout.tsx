import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-cn-surface">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
