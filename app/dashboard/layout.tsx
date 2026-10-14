import Header from '@/components/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-page dark">
      <Header />
      {children}
    </main>
  )
}