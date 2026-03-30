import { FloatingNavbar } from '@/components/layout/FloatingNavbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pb-28">
        {children}
      </main>
      <FloatingNavbar />
    </div>
  )
}
